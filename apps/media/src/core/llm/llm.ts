import { v4 as uuidv4 } from "uuid";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { START, END, StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { SystemPrompt } from "./prompt.js";
import { LLM as BaseLLM, LLMStream as BaseStream } from "./utils.js";
import { mongoClient } from '@roro-ai/database/client';
import { MongoDBSaver } from  "@langchain/langgraph-checkpoint-mongodb"




export class LLM extends BaseLLM {
    #threadId: string;
    private client: ChatGoogleGenerativeAI;
    private prompt: string;
    private promptTemplate: ChatPromptTemplate;
    private memory: MongoDBSaver;

    constructor(prompt: string) {
        super();
        this.prompt = prompt;
        this.memory = new MongoDBSaver({
            client: mongoClient.client,
            dbName: 'chatHistory',
            checkpointCollectionName: 'checkpoints',
            checkpointWritesCollectionName: 'checkpoint_writes'

        });
        this.promptTemplate = this.createPromptTemplate(this.prompt);
        this.#threadId = uuidv4();


        this.client = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-lite",
            temperature: 0.7,
            apiKey: process.env.GEMINI_API_KEY!,
        });
    }

    chat(): LLMStream {
        return new LLMStream(this, this.client, this.memory, this.promptTemplate, this.#threadId);
    }

    private createPromptTemplate(prompt: string) {
        return ChatPromptTemplate.fromMessages([
            ["system", SystemPrompt],
            ["user", prompt],
            ["placeholder", "{messages}"],
        ]);
    }

    get threadId() {
        return this.#threadId
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

    constructor(llm: LLM, client: ChatGoogleGenerativeAI, memory: MongoDBSaver, promptTemplate: ChatPromptTemplate, threadId: string) {
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



