/**
 * Module dependencies.
 */
import * as dotenv from "dotenv";
import { Collection, ObjectID } from "mongodb";
import { BaseRepository } from "../common/base.repository";

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

/**
 * Class which allows user collection manipulation
 */
export class UserRepository extends BaseRepository {

    constructor(collection: string = process.env.MONGODB_COLLECTION) {
        super(collection);
    }

    /**
     * This function posts user info based on phone number
     * @param req
     */
    public async postUserInfo (req: any): Promise<any> {
        await this.collection.insertOne(req);
    }

    /**
     * This function posts user age based on phone number
     * @param req
     */
    public async postUserAge (req: any, phoneNumber: any): Promise<any> {
        await this.collection.update(
            { "phoneNumber" : { $eq : phoneNumber } },
            { $set : { "age" : req }
        });
    }

    /**
     * This function posts user age based on phone number
     * @param req
     */
    public async postUserPet (req: any, phoneNumber: any): Promise<any> {
        await this.collection.update(
            { "phoneNumber" : { $eq : phoneNumber } },
            { $set : { "pet" : req }
        });
    }

    /**
     * This function posts user age based on phone number
     * @param req
     */
    public async postUserInstrument (req: any, phoneNumber: any): Promise<any> {
        await this.collection.update(
            { "phoneNumber" : { $eq : phoneNumber } },
            { $set : { "instrument" : req }
        });
    }

    /**
     * This function gets certain user.
     * @param phoneNumber
     */
    public async getUserInfoByPhoneNumber (phoneNumber: string): Promise<any> {
        return await this.collection.aggregate([
            {
                $project: {
                    _id : "$_id",
                    name: "$name",
                    phoneNumber: "$phoneNumber",
                    age: "$age",
                    pet: "$pet",
                    intrument: "$instrument"
                }
            },
            { $match: { phoneNumber : phoneNumber} }
        ]).next();
    }

    /**
     * This function returns all users.
     * @param filter
     */
    public async getAllUsers(filter: any = {}): Promise<any[]> {

        return await this.collection.aggregate([
            {
                $project: {
                    _id : "$_id",
                    name: "$name",
                    phoneNumber: "$phoneNumber",
                    age: "$age",
                    pet: "$pet",
                    intrument: "$instrument"
                }
            },
            { $match: { ...filter} }
        ]).toArray();
    }

    /**
     * This function posts conversation to a certain user.
     * @param req
     * @param phoneNumber
     */
    public async postConversation (req: any, phoneNumber: any): Promise <any> {
        await this.collection.update(
            { "phoneNumber" : { $eq : phoneNumber } },
            { $push : { "conversationHistory" : req }
        });
    }

    /**
     * This function returns second to last conversation part
     * @param phoneNumber
     */
    public async getPreviousConversationPart(phoneNumber: string): Promise<any> {
        return await this.collection.aggregate([
            {
                $project: {
                    phoneNumber: "$phoneNumber",
                    conversationHistory: { $arrayElemAt: ["$conversationHistory", -1] }
                }
            },
            { $match: { phoneNumber : phoneNumber} }
        ]).next();
    }

    /**
     * This function returns conversation history
     * @param phoneNumber
     */
    public async getConversationHistory(phoneNumber: string): Promise<any> {
        phoneNumber = "+" + phoneNumber;
        return await this.collection.aggregate([
            {
                $project: {
                    phoneNumber: "$phoneNumber",
                    conversationHistory : "$conversationHistory",
                }
            },
            { $match: { phoneNumber : phoneNumber} }
        ]).next();
    }

}
