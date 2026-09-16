#!/usr/bin/env python3
"""Generate an ed25519 SSH keypair in OpenSSH format for GitHub push from sandbox."""
import os
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat, PrivateFormat, NoEncryption

priv_path = os.path.expanduser("~/.ssh/id_ed25519")
pub_path = priv_path + ".pub"
os.makedirs(os.path.dirname(priv_path), mode=0o700, exist_ok=True)

if os.path.exists(priv_path):
    print(f"KEY ALREADY EXISTS: {priv_path}")
    with open(pub_path) as f:
        print(f.read().strip())
    raise SystemExit(0)

key = Ed25519PrivateKey.generate()
pem = key.private_bytes(
    Encoding.PEM,
    PrivateFormat.OpenSSH,   # OpenSSH-format private key (-----BEGIN OPENSSH PRIVATE KEY-----)
    NoEncryption(),
)
openssh_pub = key.public_key().public_bytes(
    Encoding.OpenSSH, PublicFormat.OpenSSH
)

with open(priv_path, "wb") as f:
    f.write(pem)
os.chmod(priv_path, 0o600)
with open(pub_path, "wb") as f:
    f.write(openssh_pub + b" omnivoice-sandbox\n")
os.chmod(pub_path, 0o644)

print("GENERATED ed25519 keypair (OpenSSH format)")
print("PUBLIC KEY (add to GitHub as Deploy Key with write access):")
print((openssh_pub + b" omnivoice-sandbox\n").decode().strip())
