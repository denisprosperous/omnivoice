/**
 * v4.2 Task 15 — mobile 375px verification via CDP over the agent-browser
 * chrome (Emulation.setDeviceMetricsOverride). Walks the key views at 375×812,
 * asserting zero horizontal overflow, and captures screenshots + console errors.
 */
const { execSync } = require("node:child_process");

async function main() {
  // find agent-browser chrome debug port: launch our own headless chrome instead
  const { spawn } = require("node:child_process");
  const chrome = spawn("/home/z/.agent-browser/browsers/chrome-152.0.7977.64/chrome", [
    "--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--remote-debugging-port=9333",
    "--window-size=375,812", "about:blank",
  ], { stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 2500));

  // fetch WS endpoint
  const res = await fetch("http://127.0.0.1:9333/json/version");
  const { webSocketDebuggerUrl } = await res.json();
  const WebSocket = (await import("ws")).default;
  const ws = new WebSocket(webSocketDebuggerUrl, { perMessageDeflate: false });
  await new Promise((r) => ws.on("open", r));

  let id = 0;
  const pending = new Map();
  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  function send(method, params = {}, sessionId) {
    return new Promise((resolve) => {
      const mid = ++id;
      pending.set(mid, resolve);
      ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
    });
  }

  const { targetInfos } = (await send("Target.getTargets")).result;
  let { targetId } = (await send("Target.createTarget", { url: "about:blank" })).result;
  const { sessionId } = (await send("Target.attachToTarget", { targetId, flatten: true })).result;

  const errors = [];
  await send("Runtime.enable", {}, sessionId);
  await send("Log.enable", {}, sessionId);
  // listen via Runtime.consoleAPICalled / Log.entryAdded through flat session events
  ws.on("message", (raw) => {
    const m = JSON.parse(raw);
    if (m.method === "Log.entryAdded" && m.params.entry.level === "error") errors.push(m.params.entry.text.slice(0, 160));
    if (m.method === "Runtime.exceptionThrown") errors.push(String(m.params.exceptionDetails?.text || "exception").slice(0, 160));
  });

  await send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 2, mobile: true }, sessionId);

  async function nav(url) {
    await send("Page.enable", {}, sessionId);
    await send("Page.navigate", { url }, sessionId);
    await new Promise((r) => setTimeout(r, 4500));
  }
  async function js(expr) {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    return r.result?.result?.value;
  }

  const report = [];
  await nav("http://localhost:3000/");
  report.push(["landing", await js(`document.documentElement.scrollWidth <= 375`)]);

  // create profile to reach inner views
  await js(`(() => {
    const i = document.querySelector('input');
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    set.call(i, 'Mobile375');
    i.dispatchEvent(new Event('input', { bubbles: true }));
    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Learner'))?.click();
    return 'ok';
  })()`);
  await new Promise((r) => setTimeout(r, 800));
  await js(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Class 3')?.click()`);
  await new Promise((r) => setTimeout(r, 400));
  await js(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Start the Adventure'))?.click()`);
  await new Promise((r) => setTimeout(r, 3000));
  report.push(["navigator", await js(`document.documentElement.scrollWidth <= 375`)]);

  // library v4.2 wing
  await js(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Content Library'))?.click()`);
  await new Promise((r) => setTimeout(r, 1500));
  await js(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Curriculum & Content v4.2'))?.click()`);
  await new Promise((r) => setTimeout(r, 2500));
  report.push(["library-framework", await js(`document.documentElement.scrollWidth <= 375`)]);

  await js(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Lexicon (500)'))?.click()`);
  await new Promise((r) => setTimeout(r, 2000));
  report.push(["library-lexicon", await js(`document.documentElement.scrollWidth <= 375`)]);

  await js(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Reading Ladder'))?.click()`);
  await new Promise((r) => setTimeout(r, 1500));
  report.push(["library-reading", await js(`document.documentElement.scrollWidth <= 375`)]);

  await js(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Listening (NT)'))?.click()`);
  await new Promise((r) => setTimeout(r, 1500));
  report.push(["library-listening", await js(`document.documentElement.scrollWidth <= 375`)]);

  // lesson golden path at 375
  await js(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Curriculum Navigator'))?.click()`);
  await new Promise((r) => setTimeout(r, 1500));
  await js(`Array.from(document.querySelectorAll('button')).find(b => /quest 1|Greeting|Salut/i.test(b.textContent))?.click()`);
  await new Promise((r) => setTimeout(r, 3000));
  report.push(["lesson-hook", await js(`document.documentElement.scrollWidth <= 375`)]);
  const komHook = await js(`document.body.innerText.includes('À bwɛ̀, mwɛ̀n!') || document.body.innerText.includes('Good morning')`);
  report.push(["lesson-kom-hook-visible", Boolean(komHook)]);

  // screenshot proof
  const shot = await send("Page.captureScreenshot", { format: "png" }, sessionId);
  require("node:fs").writeFileSync("/home/z/my-project/scripts/v42-mobile-375-lesson.png", Buffer.from(shot.result.data, "base64"));

  console.log("=== 375px overflow report (true = NO overflow) ===");
  let allPass = true;
  for (const [view, ok] of report) { console.log(`${ok ? "PASS" : "FAIL"} ${view}`); if (!ok) allPass = false; }
  console.log("console/page errors:", errors.length ? errors.slice(0, 5) : "none");
  console.log(allPass && errors.length === 0 ? "MOBILE VERIFICATION PASS" : "MOBILE VERIFICATION ISSUES");
  chrome.kill();
  process.exit(allPass && errors.length === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
