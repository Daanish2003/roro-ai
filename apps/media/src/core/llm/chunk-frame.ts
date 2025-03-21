export class ChunkFrame {
    sentences: string[] = [];
  
      constructor(chunk: string) {
        this.splitIntoSentences(chunk)
      }

      splitIntoSentences(chunk: string) {
        this.sentences = chunk.split(/(?<=[.!?])\s+/);
      }

  }