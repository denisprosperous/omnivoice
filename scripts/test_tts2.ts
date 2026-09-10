import ZAI from 'z-ai-web-dev-sdk';

async function main() {
  const zai = await ZAI.create();
  for (const fmt of ['wav', 'mp3']) {
    try {
      const res = await zai.audio.tts.create({ input: 'Bonjour!', voice: 'tongtong', response_format: fmt });
      const ct = res.headers.get('content-type');
      const buf = await res.arrayBuffer();
      const head = Buffer.from(buf.slice(0, 12)).toString('hex');
      console.log(fmt, '->', ct, buf.byteLength, 'head:', head);
    } catch (e) { console.log(fmt, 'ERROR:', e.message.slice(0, 150)); }
  }
  // ASR test with our PCM test file converted to wav
  try {
    const fs = await import('fs');
    const pcm = fs.readFileSync('/home/z/my-project/scripts/tts_test.bin');
    const sampleRate = 24000;
    const header = Buffer.alloc(44);
    header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVE', 8);
    header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22); header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28);
    header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
    const wav = Buffer.concat([header, pcm]);
    fs.writeFileSync('/home/z/my-project/scripts/tts_test.wav', wav);
    const b64 = wav.toString('base64');
    const asr = await zai.audio.asr.create({ file_base64: b64 });
    console.log('ASR:', JSON.stringify(asr).slice(0, 300));
  } catch (e) { console.log('ASR ERROR:', e.message.slice(0, 200)); }
}
main();
