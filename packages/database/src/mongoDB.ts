import { MongoClient } from "mongodb"

class Mongo {
    private static instance: Mongo
    private Pclient: MongoClient

    constructor() {
        const url = process.env.MONGO_DB_URL

        if(!url) {
            throw new Error("MonogoDB url is not provided")
        }

        this.Pclient = new MongoClient(url)
    }

    static getInstance() {
        if(!Mongo.instance) {
            Mongo.instance = new Mongo()
        }

        return Mongo.instance
    }


    get client() {
        return this.Pclient
    }
}

export const mongoClient = Mongo.getInstance()
