import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

import { START, END, MessagesAnnotation, StateGraph, MemorySaver} from "@langchain/langgraph"
import { ChatPromptTemplate } from '@langchain/core/prompts';


dotenv.config();

export class GeminiModel {
  private apiKey: string;
  private systemPrompt: string | null =;
  private prompt_template: ChatPromptTemplate<any, any>;
  private model: ChatGoogleGenerativeAI;
  private app: any;
  private isAgentSpeaking: boolean = false
  private isGeneratingVoice: boolean = false

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.prompt_template = this.initializeChatPromptTemplate()
    this.model = this.initializeModel()
    this.app = this.initializeWorkflow()

    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }
  }

  private initializeModel() {
    return new ChatGoogleGenerativeAI({
      apiKey: this.apiKey,
      model:"gemini-2.0-flash",
      temperature: 0.7
    })
  }

  private initializeWorkflow() {
    const memory = new MemorySaver()
    const workflow = new StateGraph(MessagesAnnotation).addNode("model", this.callModel.bind(this)).addEdge(START, "model").addEdge("model", END)
    const app = workflow.compile({ checkpointer: memory })

    return app
  }

  private async callModel(state: typeof MessagesAnnotation.State) {
    const prompt = await this.prompt_template.invoke(state)
    const response = await this.model.invoke(prompt)

    return {
      messages: [response]
    }
  }

  private initializeChatPromptTemplate() {
    return ChatPromptTemplate.fromMessages([[
      "system",
       this.systemPrompt
    ],
    ["placeholder", "{messages}"]
  ])
  }

  private async sendMessage(userMessage: string) {

    if(this.isAgentSpeaking) return
    if(this.isGeneratingVoice) return

    try {
      const output = await this.app.invoke({ messages: 
        {
          role: "user",
          content: userMessage
        }
       }, { configurable: { thread_id: this.room.roomId}})

       if (output && output.messages && output.messages[0]) {
         return output.messages[output.messages.length - 1].content;
      } else {
        return null;
      }
    } catch (error) {
      console.error("llm response error:", error)
    }
  }
}
