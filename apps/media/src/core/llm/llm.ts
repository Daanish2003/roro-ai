import { v4 as uuidv4 } from "uuid";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { START, END, StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { SystemPrompt } from "./prompt.js";
import { LLM as BaseLLM, LLMStream as BaseStream } from "./utils.js";
import { mongoClient } from '@roro-ai/database/client';
import { MongoDBSaver } from  "@langchain/langgraph-checkpoint-mongodb"

export interface LLMOptions {
    model: string;
    apiKey?: string;
}

const defaultLLMOptions: LLMOptions = {
    model: "gemini-2.0-flash-lite",
    apiKey: process.env.GEMINI_API_KEY,
};


export class LLM extends BaseLLM {
    private threadId: string;
    private options: LLMOptions;
    private client: ChatGoogleGenerativeAI;
    private prompt: string;
    private promptTemplate: ChatPromptTemplate;
    private memory: MongoDBSaver;

    constructor(prompt: string, opts: Partial<LLMOptions> = {}) {
        super();
        this.options = { ...defaultLLMOptions, ...opts };
        this.prompt = prompt;
        this.memory = new MongoDBSaver({
            client: mongoClient.client,
            dbName: 'chatHistory',
            checkpointCollectionName: 'checkpoints',
            checkpointWritesCollectionName: 'checkpoint_writes'

        });
        this.promptTemplate = this.createPromptTemplate(this.prompt);
        this.threadId = uuidv4();


        this.client = new ChatGoogleGenerativeAI({
            model: this.options.model,
            temperature: 0.7,
            apiKey: this.options.apiKey,
        });
    }

    chat(): LLMStream {
        return new LLMStream(this, this.options, this.client, this.memory, this.promptTemplate, this.threadId);
    }

    private createPromptTemplate(prompt: string) {
        return ChatPromptTemplate.fromMessages([
            ["system", SystemPrompt],
            ["user", prompt],
            ["placeholder", "{messages}"],
        ]);
    }
}

export class LLMStream extends BaseStream {
    private client: ChatGoogleGenerativeAI;
    private threadId: string;
    private memory: MongoDBSaver;
    private promptTemplate: ChatPromptTemplate
    private app: any;
    private task?: Promise<void>;
    private interrupted: boolean = false

    constructor(llm: LLM, opts: LLMOptions, client: ChatGoogleGenerativeAI, memory: MongoDBSaver, promptTemplate: ChatPromptTemplate, threadId: string) {
        super(llm);
    
        this.client = client;
        this.threadId = threadId
        this.memory = memory
        this.promptTemplate = promptTemplate
        this.app = this.initializeWorkflow();
    }

    async sendChat(userMessage: string) {
        const trimmed = userMessage?.trim();
        if (this.interrupted || !trimmed) return;
        try {
            if(userMessage.length > 0) {
                await this.app.invoke({
                    messages: [new HumanMessage(userMessage)],
                }, {
                    configurable: { thread_id: this.threadId }
                });
            }
        } catch (error) {
            console.error("LLM response error:", error);
        }
    }

    private async callModel(state: typeof MessagesAnnotation.State) {
        try {
            console.log(this.app)
            console.log("state", state.messages)
            const prompt = await this.promptTemplate.invoke(state);
            console.log("prompt", prompt)
            const stream = await this.client.stream(prompt);

            let buffer = "";
            const chunks: AIMessageChunk[] = [];

            for await (const chunk of stream) {
                chunks.push(chunk);
                console.log(chunk)
                buffer += chunk.content;

                const sentences = buffer.split(".");
                for (let i = 0; i < sentences.length - 1; i++) {
                    const sentence = sentences[i]?.trim();
                    if (sentence) {
                        if(this.interrupted) return
                        this.output.put(sentence + ".");
                    }
                }
                buffer = sentences[sentences.length - 1] || "";
            }

            if (buffer.trim()) {
                if(this.interrupted) return
                this.output.put(buffer.trim());
            }

            const fullResponse = new AIMessage({
                content: chunks.map(chunk => chunk.content).join(""),
              });

            return { messages: [fullResponse] };
        } catch (error) {
            console.error("Error in callModel:", error);
            return { messages: [] };
        }
    }

    private initializeWorkflow() {
        return new StateGraph(MessagesAnnotation)
            .addNode("model", this.callModel.bind(this))
            .addEdge(START, "model")
            .addEdge("model", END)
            .compile({ checkpointer: this.memory });
    }

    interrupt() {
        this.interrupted = true
    }

}