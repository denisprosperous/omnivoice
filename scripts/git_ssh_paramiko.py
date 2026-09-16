#!/usr/bin/env python3
"""
GIT_SSH shim backed by paramiko (sandbox has no openssh binary).

git invokes this script as:
    GIT_SSH <git@host> <remote-command-args...>
We open an SSH session to GitHub with the sandbox ed25519 key, exec the
git-receive-pack / git-upload-pack command, and pipe all three streams
bidirectionally so git's pack protocol works unchanged.
"""
import os
import sys
import threading

import paramiko


def main() -> int:
    args = sys.argv[1:]

    # Pull out optional -p/--port flags (ssh:// URLs); scp-like syntax carries none.
    port = 22
    filtered = []
    i = 0
    while i < len(args):
        a = args[i]
        if a == "-p" and i + 1 < len(args):
            port = int(args[i + 1])
            i += 2
            continue
        if a.startswith("--port="):
            port = int(a.split("=", 1)[1])
            i += 1
            continue
        filtered.append(a)
        i += 1

    if not filtered:
        sys.stderr.write("git_ssh_paramiko: no host argument\n")
        return 2

    host = filtered[0]
    user = "git"
    if "@" in host:
        user, host = host.split("@", 1)
    if ":" in host and not host.startswith("["):
        host, _, port_s = host.rpartition(":")
        try:
            port = int(port_s)
        except ValueError:
            pass

    remote_cmd = " ".join(filtered[1:])

    key_path = os.path.expanduser("~/.ssh/id_ed25519")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            hostname=host,
            port=port,
            username=user,
            key_filename=key_path,
            allow_agent=False,
            look_for_keys=False,
            timeout=30,
            banner_timeout=30,
            auth_timeout=30,
        )
    except paramiko.AuthenticationException:
        sys.stderr.write(
            f"git_ssh_paramiko: AUTH FAILED for {user}@{host}:{port} "
            "(public key not yet registered on GitHub?)\n"
        )
        return 255
    except Exception as exc:  # noqa: BLE001
        sys.stderr.write(f"git_ssh_paramiko: connect error: {exc}\n")
        return 255

    try:
        transport = client.get_transport()
        channel = transport.open_session()
        channel.exec_command(remote_cmd)

        def pump_stdin() -> None:
            try:
                while True:
                    data = sys.stdin.buffer.read(32768)
                    if not data:
                        break
                    channel.sendall(data)
            except Exception:
                pass
            finally:
                try:
                    channel.shutdown_write()
                except Exception:
                    pass

        def pump_stderr() -> None:
            try:
                while True:
                    data = channel.recv_stderr(32768)
                    if not data:
                        break
                    sys.stderr.buffer.write(data)
                    sys.stderr.buffer.flush()
            except Exception:
                pass

        stdin_thread = threading.Thread(target=pump_stdin, daemon=True)
        stderr_thread = threading.Thread(target=pump_stderr, daemon=True)
        stdin_thread.start()
        stderr_thread.start()

        try:
            while True:
                data = channel.recv(32768)
                if not data:
                    break
                sys.stdout.buffer.write(data)
                sys.stdout.buffer.flush()
        except Exception:
            pass

        exit_code = channel.recv_exit_status()
        stdin_thread.join(timeout=5)
        stderr_thread.join(timeout=5)
        return exit_code
    finally:
        client.close()


if __name__ == "__main__":
    sys.exit(main())
