import ZAI from 'z-ai-web-dev-sdk';

async function main() {
  const zai = await ZAI.create();
  for (const v of ['xiaochen', 'yeye', 'laotie', 'guanyu', 'robot', 'male', 'female', 'child', 'tongtong-v2', 'wanwan', 'chunhui', 'mengmeng']) {
    try {
      const res = await zai.audio.tts.create({ input: 'Hello', voice: v, response_format: 'wav' });
      const buf = await res.arrayBuffer();
      console.log(v, 'OK', buf.byteLength);
    } catch (e) { console.log(v, 'FAIL', e.message.slice(0, 60)); }
  }
}
main();
