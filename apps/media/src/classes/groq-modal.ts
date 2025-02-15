import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferMemory } from "langchain/memory";

export class GroqModal {
  private conversationChain: ConversationChain;

  constructor() {
    const modelName = "gemini-2.0-flash";
    const temperature = 0.7;
    const apiKey = process.env.GEMINI_API_KEY;


    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is not set. Please ensure you have set it for API calls to work.");
    }

    const model = new ChatGoogleGenerativeAI({ model: modelName, temperature, apiKey });
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `I want you to act a as spoken English teacher, I will speak to you in English and you will reply to me in
        English to practice my spoken english i want you tu keep your reply neat. limiting the reply to 100 words.
        I want you to strictly correct my grammer mistakes and typos. I want you to ask me a question first. Remember,
        I want you to strictly correct my grammer mistakes and typos.`
      ),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);

    this.conversationChain = new ConversationChain({
      llm: model,
      prompt: chatPrompt,
      memory: new BufferMemory(),
    });
  }

  public async sendMessage(input: string) {
    try {
      
      const { response } = await this.conversationChain.call({ input });

      console.log(response)
       
       return response

    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw new Error(`Failed to send message and receive response from Gemini API: ${error}`);
    }
  }

  public clearHistory(): void {
    (this.conversationChain.memory as BufferMemory).clear();
  }
}
