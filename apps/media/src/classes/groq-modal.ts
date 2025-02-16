import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BufferMemory } from "langchain/memory";

export class GroqModal {
  private conversationChain: ConversationChain;
  private systemPrompt: string;

  constructor(prompt: string) {
    const modelName = "gemini-2.0-flash";
    const temperature = 0.7;
    const apiKey = process.env.GEMINI_API_KEY;

    this.systemPrompt = prompt


    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is not set. Please ensure you have set it for API calls to work.");
    }

    const model = new ChatGoogleGenerativeAI({ model: modelName, temperature, apiKey });
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(this.systemPrompt),
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
