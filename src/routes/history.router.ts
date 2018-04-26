/**
 * Module dependencies.
 */
import { Parser } from "csv-parse";
import { Response, Request } from "express";
import { exportCSV } from "../helpers/history.helper";
import { UserRepository } from "../controllers/user.controller";

/**
 * Requiring modules and creating classes.
 */
const userRepository = new UserRepository();

/**
 * @swagger
 * /getConversationHistory/{phoneNumber}:
 *   get:
 *     tags:
 *       - History
 *     operationId: getConversationHistory
 *     security:
 *       - Bearer: []
 *     description: Get Conversation History
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
export const getConversationHistory = async (req: Request, res: Response) => {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
        return res.status(400).json({ error: "Wrong user number." });
    }

    const user: any = await userRepository.getConversationHistory(phoneNumber);
    const history = user.conversationHistory;

    const fields = {
        locationOrder: "locationOrder",
        question: "question",
        response: "response"
    };
    const csv = exportCSV(fields, history);

    if (history) {
        res.attachment("conversation.csv");
        return await res.status(200).send(csv);
    } else {
        return res.status(404).json({ error: `user with id ${phoneNumber} not found.` });
    }
};