import ZAI from 'z-ai-web-dev-sdk';

async function main() {
  const zai = await ZAI.create();

  // TTS test
  try {
    const tts = await zai.audio.tts.create({ input: 'Good morning, young one!', voice: 'tongtong', speed: 0.9 });
    console.log('TTS keys:', Object.keys(tts || {}));
    const s = JSON.stringify(tts);
    console.log('TTS preview:', s.slice(0, 300));
  } catch (e) { console.log('TTS ERROR:', e.message); }

  // Chat test
  try {
    const chat = await zai.chat.completions.create({ messages: [{ role: 'user', content: 'Say hi in 3 words' }], thinking: { type: 'disabled' } });
    console.log('CHAT:', JSON.stringify(chat?.choices?.[0]?.message?.content || chat).slice(0, 200));
  } catch (e) { console.log('CHAT ERROR:', e.message); }
}
main();
