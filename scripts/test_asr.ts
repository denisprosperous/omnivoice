import ZAI from 'z-ai-web-dev-sdk';

async function main() {
  const zai = await ZAI.create();
  const fs = await import('fs');
  const wav = fs.readFileSync('/home/z/my-project/scripts/tts_test.wav');
  const b64 = wav.toString('base64');
  const asr = await zai.audio.asr.create({ file_base64: b64 });
  console.log('ASR:', JSON.stringify(asr).slice(0, 400));
}
main();
