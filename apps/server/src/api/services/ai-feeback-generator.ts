import { mongoClient } from "@roro-ai/database"

export const aiFeedbackGenerator = async (threadId: string) => {
    const client = mongoClient.client
    const db = client.db('chatHistory')
    const messagesCollection = db.collection("checkpointer")

    const result = messagesCollection
       .find({ thread_Id: threadId })
    
    for await (const history of result) {
        console.log(history)
    }
}


