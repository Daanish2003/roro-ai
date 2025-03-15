import { AgentPipeline } from "../core/agent-pipeline.js"

class AgentPipelineManager {
    private static instance: AgentPipelineManager
    private pipeline: Map<string, AgentPipeline>

    constructor() {
        this.pipeline = new Map()
    }

    static getInstance() {
        if(!AgentPipelineManager.instance) {
            AgentPipelineManager.instance = new AgentPipelineManager()
        }

        return AgentPipelineManager.instance
    }

    addPipeline(pipeline: AgentPipeline) {
        this.pipeline.set(pipeline.agentId, pipeline)
    }

    getPipeline(pipelineId: string) {
        return this.pipeline.get(pipelineId)
    }

    hasPipeline(pipelineId: string) {
        return this.pipeline.has(pipelineId)
    }
}

export const agentManager = AgentPipelineManager.getInstance()