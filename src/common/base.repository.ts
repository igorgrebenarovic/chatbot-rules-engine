/**
 * Module dependencies.
 */
import { Database } from "./database";
import { Collection, ObjectID } from "mongodb";

/**
 * Class whihch allows to connect to a db
 */
export class BaseRepository {
    protected collection: Collection;
    private collectionName: string;

    constructor(collectionName: string) {
        this.connect(collectionName);
        this.collectionName = collectionName;
    }

    public async connect(collectionName: string = this.collectionName): Promise<void> {
        if (!this.collection) {
            const connection = Database.getConnection();
            await connection.connect();
            this.collection = connection.collection(collectionName);
        }
    }
}