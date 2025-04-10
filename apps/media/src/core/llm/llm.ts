import { v4 as uuidv4 } from "uuid";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, AIMessageChunk, HumanMessage } from "@langchain/core/messages";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver, MessagesAnnotation, START, END, StateGraph } from "@langchain/langgraph";
import { SystemPrompt } from "./prompt.js";
import { LLM as BaseLLM, LLMStream as BaseStream } from "./utils.js";

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
    private memory: MemorySaver;

    constructor(prompt: string, opts: Partial<LLMOptions> = {}) {
        super();
        this.options = { ...defaultLLMOptions, ...opts };
        this.prompt = prompt;
        this.memory = new MemorySaver();
        this.promptTemplate = this.createPromptTemplate(prompt);
        this.threadId = uuidv4();

        if (!this.options.apiKey) {
            throw new Error("Gemini API key is required, either as an argument or via $GEMINI_API_KEY.");
        }

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
    private options: LLMOptions;
    private client: ChatGoogleGenerativeAI;
    private threadId: string;
    private memory: MemorySaver
    private promptTemplate: ChatPromptTemplate
    private app: any;
    private task?: Promise<void>;
    private interrupted: boolean = false

    constructor(llm: LLM, opts: LLMOptions, client: ChatGoogleGenerativeAI, memory: MemorySaver, promptTemplate: ChatPromptTemplate, threadId: string) {
        super(llm);
        this.options = opts;
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
            } else {
                console.log("userMessage:", userMessage)
            }
        } catch (error) {
            console.error("LLM response error:", error);
        }
    }

    private async callModel(state: typeof MessagesAnnotation.State) {
        try {
            console.log(state.messages)
            const prompt = await this.promptTemplate.invoke(state);
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
