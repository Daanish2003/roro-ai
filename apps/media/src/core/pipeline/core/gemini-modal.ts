import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";

import { START, END, MessagesAnnotation, StateGraph, MemorySaver} from "@langchain/langgraph"
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { v4 as uuidv4 } from 'uuid';


dotenv.config();

export class GeminiModel {
  private apiKey: string;
  private prompt_template: ChatPromptTemplate<any, any>;
  private model: ChatGoogleGenerativeAI;
  private app: any;
  private threadId: string;

  constructor(prompt: string) {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.prompt_template = this.initializeChatPromptTemplate(prompt)
    this.model = this.initializeModel()
    this.app = this.initializeWorkflow()
    this.threadId = uuidv4()

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

  private initializeChatPromptTemplate(prompt: string) {
    return ChatPromptTemplate.fromMessages([[
      "system",
       prompt,
    ],
    ["placeholder", "{messages}"]
  ])
  }

  public async sendMessage(userMessage: string) {
    try {
      const output = await this.app.invoke({ messages: 
        {
          role: "user",
          content: userMessage
        }
       }, { configurable: { thread_id: this.threadId}})

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
