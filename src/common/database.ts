/**
 * Module dependencies.
 */
import * as dotenv from "dotenv";
import { MongoClient, Db, Collection } from "mongodb";

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

/**
 * Class that allows db manipulation
 */
export class Database {
    private static connection: Database;
    private static db: Db;

    private constructor() {}

    static getConnection(): Database {
        if (!Database.connection) {
            Database.connection = new Database();
        }

        return Database.connection;
    }

    collection(collectionName: string): Collection {
        return Database.db.collection(collectionName);
    }

    async connect(): Promise<void> {
        if (!Database.db) {
            if (process.env.MODE === "test")
                Database.db = await MongoClient.connect(process.env.TEST_MONGODB_URI, { autoReconnect: true });
            else
                Database.db = await MongoClient.connect(process.env.MONGODB_URI, { autoReconnect: true });
        }
    }

    async createCollection(collectionName: string): Promise<any> {
        await this.connect();
        return await Database.db.createCollection(collectionName);
    }

    async removeCollection(collection: Collection): Promise<void> {
        await collection.drop();
        await collection.dropIndexes();
    }
}