/**
 * Module dependencies.
 */
import * as dotenv from "dotenv";
import { Response, Request } from "express";
import { NextQuestion } from "../helpers/card.helper";
import { replaceDynamicText } from "../helpers/card.helper";
import { UserRepository } from "../controllers/user.controller";
import { ResponsePreprocessing, generateUserCollection, addConversationPart } from "../helpers/user.helper";

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

const userRepository = new UserRepository();

/**
 * @swagger
 * /getUserInfo/{phoneNumber}:
 *   get:
 *     tags:
 *       - user
 *     operationId: getUserInfo
 *     security:
 *       - Bearer: []
 *     description: Get User Info
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: phoneNumber
 *         description: Phone number of a user
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: user.
 *       400:
 *         description: Wrong user number.
 *       404:
 *         description: user not found.
 */

 export const getUser = async (req: Request, res: Response) => {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
        return res.status(400).json({ error: "Wrong user number." });
    }

    const user: any = await userRepository.getUserInfoByPhoneNumber(phoneNumber);

    if (user) {
        return res.json({ ...user});
    } else {
        return res.status(404).json({ error: `Product with id ${phoneNumber} not found.` });
    }
 };

/**
 * @swagger
 * /getUsers:
 *   get:
 *     tags:
 *       - user
 *     operationId: GetUsers
 *     security:
 *       - Bearer: []
 *     description: Get All Users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: List of users.
 */
export const getUsers = async (req: Request, res: Response) => {

    const params: any = {};

    const users: any = await userRepository.getAllUsers(params);

    return res.json(users);
};

/**
 * @swagger
 * /postUserInfo:
 *   post:
 *     tags:
 *       - user
 *     operationId: user
 *     security:
 *       - Bearer: []
 *     description: Post user info
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: user's name
 *         in: query
 *         required: true
 *         type: string
 *         default: John
 *       - name: phoneNumber
 *         description: user's phone number
 *         in: query
 *         required: true
 *         type: string
 *         default: phone
 *     responses:
 *       200:
 *         description: Result
 *       400:
 *         description: Incorrect parameters
 */
export const postUserInfo = async (req: Request, res: Response) => {
    const { name, phoneNumber } = req.query;

    if (!name || !phoneNumber ) {
        return res.status(400).json({ error: "Please enter inputs." });
    }
    const userDemoDocument = generateUserCollection(name, phoneNumber);
    const result = await userRepository.postUserInfo(userDemoDocument);

    res.json({ message: "OK" });
};

/**
 * @swagger
 * /postUserInfoAndTriggerConversation:
 *   post:
 *     tags:
 *       - user
 *     operationId: user
 *     security:
 *       - Bearer: []
 *     description: Post user info
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: user's name
 *         in: query
 *         required: true
 *         type: string
 *         default: John
 *       - name: phoneNumber
 *         description: user's phone number
 *         in: query
 *         required: true
 *         type: string
 *         default: phone
 *     responses:
 *       200:
 *         description: Result
 *       400:
 *         description: Incorrect parameters
 */
export const postUserInfoAndTriggerConversation = async (req: Request, res: Response) => {
    const { name, dob, city, phoneNumber } = req.query;

    if (!name || !dob || !city || !phoneNumber ) {
        return res.status(400).json({ error: "Please enter inputs." });
    }
    const userDemoDocument = generateUserCollection(name, phoneNumber);
    const result = await userRepository.postUserInfo(userDemoDocument);

    const locationOrder: any = "A01";
    const response: any = "Starting conversation...";
    const rules: any = "v1";

    const parsedCards = req.app.get("parsedCards");
    let currentQuestion = parsedCards[rules][locationOrder].question;

    // Replace dynamic text
    currentQuestion = await replaceDynamicText(currentQuestion, phoneNumber);

    // Preprocess data
    const newResponse = await ResponsePreprocessing(locationOrder, response, parsedCards, rules, phoneNumber);

    // Generate next question
    const question = await NextQuestion(parsedCards, rules, locationOrder, phoneNumber, newResponse);

    // Sending initial SMS
    const client = require("twilio")(process.env.TWILIO_ACCOUNT_SID_GLOBAL, process.env.TWILIO_AUTH_TOKEN);
    client.messages.create({
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: question[0].question
    })
    .then((message: any) => console.log(message.sid));
    res.json({ message: "OK" });
};

/**
 * @swagger
 * /simulateConversation:
 *   post:
 *     tags:
 *       - user
 *     operationId: conversationSimulation
 *     security:
 *       - Bearer: []
 *     description: Simulates conversation so the chat can be simulated without phone
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: response
 *         description: user's current response
 *         in: query
 *         required: true
 *         type: string
 *         default: yes
 *       - name: phoneNumber
 *         description: user's phone number
 *         in: query
 *         required: true
 *         type: string
 *         default: phone
 *     responses:
 *       200:
 *         description: Result
 *       400:
 *         description: Incorrect parameters
 */

export const simulateConversation = async (req: Request, res: Response) => {
    const { response, phoneNumber } = req.query;
    if (!response || !phoneNumber) {
        return res.status(400).json({ error: "Please enter inputs." });
    }

    const userConversation = await userRepository.getPreviousConversationPart(phoneNumber);
    const locationOrder = userConversation.conversationHistory.locationOrder;
    const parsedCards = req.app.get("parsedCards");
    const rules = "v1";
    let currentQuestion = parsedCards["v1"][locationOrder].question;

    // Replace dynamic text
    currentQuestion = await replaceDynamicText(currentQuestion, phoneNumber);

    // Preprocess data
    const newResponse = await ResponsePreprocessing(locationOrder, response, parsedCards, rules, phoneNumber);

    // Generate next question
    const question = await NextQuestion(parsedCards, rules, locationOrder, phoneNumber, newResponse);

    // Add conversation part to database
    await addConversationPart(question[0].locationOrder, currentQuestion, response, phoneNumber);

    res.json(question);
};