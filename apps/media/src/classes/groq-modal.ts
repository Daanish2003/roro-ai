import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { ChatGroq } from "@langchain/groq";
import { BufferMemory } from "langchain/memory";

export class GroqModal {
  private conversationChain: ConversationChain;

  constructor() {
    const modelName = "gemma2-9b-it";
    const temperature = 0.7;
    const apiKey = process.env.GROQ_API_KEY;


    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY is not set. Please ensure you have set it for API calls to work.");
    }

    const model = new ChatGroq({ model: modelName, temperature, apiKey });
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `You are an AI conversational partner designed to help users practice and improve their English communication skills.
         Engage in natural, flowing conversation as if you were chatting with a friend. Your tone should be friendly, supportive,
         and encouraging. Ask open-ended questions and share your own thoughts to keep the conversation lively. If the user makes
         mistakes, gently offer corrections or suggestions without interrupting the natural flow of conversation. Focus on creating
         a relaxed, stress-free environment where the user feels comfortable experimenting with new words and phrases. Avoid using
         overly technical language unless the user asks for clarification. Your goal is to help the user build confidence in speaking
         English through natural dialogue and real-life conversation scenarios. Also don't use emoji and apply some emotions`
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
