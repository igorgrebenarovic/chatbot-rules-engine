/**
 * Module dependencies.
 */
import * as dotenv from "dotenv";
import { Response, Request } from "express";
import { NextQuestion } from "../helpers/card.helper";
import { replaceDynamicText } from "../helpers/card.helper";
import { UserRepository } from "../controllers/user.controller";
import { ResponsePreprocessing, addConversationPart } from "../helpers/user.helper";

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

/**
 * Requiring modules and creating classes.
 */
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const userRepository = new UserRepository();

/**
 * Runs the conversation
 * Uses initial SMS to trigger the conversation
 * the body of the message should be in JSON format:
 * {"phoneNumber" : "value", "currentLocationOrder" : "A01"}
 * Initial SMS is converted to JSON and used to update the DB fields
 * @param req
 * @param res
 */
export const communication = async (req: Request, res: Response) => {
    const twiml = new MessagingResponse();

    const parsedCards = req.app.get("parsedCards");
    const rules = "v1";
    const initialSms = req.body.Body;
    const phoneNumber = req.body.From;

    const user: any = await userRepository.getUserInfoByPhoneNumber(phoneNumber);

    const userConversation = await userRepository.getPreviousConversationPart(phoneNumber);
    const locationOrder = userConversation.conversationHistory.locationOrder;
    const response = req.body.Body;
    let currentQuestion = parsedCards["v1"][locationOrder].question;

    // Replace dynamic text
    currentQuestion = await replaceDynamicText(currentQuestion, phoneNumber);

    // Preprocess data
    const newResponse = await ResponsePreprocessing(locationOrder, response, parsedCards, rules, phoneNumber);

    // Generate next question
    const question = await NextQuestion(parsedCards, rules, locationOrder, phoneNumber, newResponse);

    // Add conversation part to database
    await addConversationPart(question[0].locationOrder, currentQuestion, response, phoneNumber);

    // Respond to a message
    twiml.message({
        to: user.phoneNumber
    }, question[0].question);

    res.writeHead(200, {"Content-Type": "text/xml"});
    res.end(twiml.toString());
};

