import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLM as BaseLLM, LLMStream as BaseStream } from "./utils.js"
import { END, MemorySaver, MessagesAnnotation, START, StateGraph } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { v4 as uuidv4 } from 'uuid';
import { SystemPrompt } from "./prompt.js";

export interface LLMOptions {
    model: string;
    apiKey?: string;
}

const defaultLLMOptions: LLMOptions = {
    model: 'gemini-2.0-flash',
    apiKey: process.env.GEMINI_API_KEY,
}

export class LLM extends BaseLLM {
    private options: LLMOptions
    private client: ChatGoogleGenerativeAI
    private prompt: string
    constructor(
        prompt: string,
        opts: Partial<LLMOptions> = defaultLLMOptions,
    ) {
        super();
        this.options = {...defaultLLMOptions, ...opts};
        this.prompt = prompt

        if (this.options.apiKey === undefined) {
            throw new Error('Gemini API key is required, whether as an argument or as $OPENAI_API_KEY');
        }

        this.client = new ChatGoogleGenerativeAI({
            model: this.options.model,
            temperature: 0.7,
            apiKey: this.options.apiKey,
        })
    }
    chat(): LLMStream {
        return new LLMStream(
            this,
            this.options,
            this.client,
            this.prompt
        )   
    }
}

export class LLMStream extends BaseStream {
    private options: LLMOptions
    private client: ChatGoogleGenerativeAI
    private app: any;
    private prompt_template: ChatPromptTemplate
    private threadId: string
    constructor(llm: LLM, opts: LLMOptions, client: ChatGoogleGenerativeAI, prompt: string) {
        super(llm)
        this.options = opts
        this.client = client
        this.app = this.initializeWorkflow()
        this.prompt_template = this.initializeChatPromptTemplate(prompt)
        this.threadId = uuidv4()
    }

    private async callModel(state: typeof MessagesAnnotation.State) {
        const prompt = await this.prompt_template.invoke(state)
        const stream = await this.client.stream(prompt)

        let buffer = "";
        const response: string[] = []

        for await (const chunk of stream) {
            buffer += chunk.content;

            const parts = buffer.split(",");

            for (let i = 0; i < parts.length - 1; i++) {
                const chunkText = parts[i]!;
                this.output.put(chunkText)
                response.push(chunkText)
                console.log(chunkText)
            }

            buffer = parts[parts.length - 1]!;
        }

        if (buffer.trim()) {
            this.output.put(buffer);
            response.push(buffer);
            console.log(buffer)
        }
    
        return {
          messages: response
        }
    }

    private initializeChatPromptTemplate(prompt: string) {
        return ChatPromptTemplate.fromMessages([[
          "system",
           SystemPrompt,
        ],
        ["user", prompt],
        ["placeholder", "{messages}"]
      ])
      }

    private initializeWorkflow() {
        const memory = new MemorySaver()
        const workflow = new StateGraph(MessagesAnnotation).addNode("model", this.callModel.bind(this)).addEdge(START, "model").addEdge("model", END)
        const app = workflow.compile({ checkpointer: memory })
    
        return app
    }

    public async sendMessage(userMessage: string) {
        try {
          await this.app.invoke({ messages: 
            {
              role: "user",
              content: userMessage
            }
           }, { configurable: { thread_id: this.threadId}})

        } catch (error) {
          console.error("llm response error:", error)
        }
      }
}