import { ElevenLabsClient, stream } from 'elevenlabs';
import { Readable } from 'stream';

const client = new ElevenLabsClient();

async function textToSpeech(input: string) {
  const audioStream = await client.textToSpeech.convertAsStream('JBFqnCBsd6RMkjVDRZzb', {
    text: input,
    model_id: '',
  });

  
  await stream(Readable.from(audioStream));

  // option 2: process the audio manually
  for await (const chunk of audioStream) {
    console.log(chunk);
  }
}

main();
