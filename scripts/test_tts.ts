import ZAI from 'z-ai-web-dev-sdk';

async function main() {
  const zai = await ZAI.create();
  try {
    const res = await zai.audio.tts.create({ input: 'Good morning, young one! Can you help me greet my friends?', voice: 'tongtong', speed: 0.9 });
    const ct = res.headers.get('content-type');
    console.log('TTS content-type:', ct);
    const buf = await res.arrayBuffer();
    console.log('TTS bytes:', buf.byteLength);
    const fs = await import('fs');
    fs.writeFileSync('/home/z/my-project/scripts/tts_test.bin', Buffer.from(buf));
  } catch (e) { console.log('TTS ERROR:', e.message); }
}
main();
