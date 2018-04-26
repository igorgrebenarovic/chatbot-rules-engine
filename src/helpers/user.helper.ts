/**
 * Module dependencies.
 */
import { UserRepository } from "../controllers/user.controller";

/**
 * Requiring modules and creating classes.
 */
const userRepository = new UserRepository();

/**
 * This function preprocesses the data:
 * - updates database value with response
 * @param locationOrder
 * @param response
 * @param card
 * @param version
 * @param phoneNumber
 */
export async function ResponsePreprocessing (locationOrder: string, response: string, card: any, version: string, phoneNumber: string) {
    const user = await userRepository.getUserInfoByPhoneNumber(phoneNumber);
    const currentCard = card[version][locationOrder];

    let result: any;
    if (currentCard.purpose) {
        switch (currentCard.purpose.toLowerCase()) {
            case "updateage":
                await userRepository.postUserAge(response, phoneNumber);
                result = response;
                break;
            case "updatepet":
                await userRepository.postUserPet(response, phoneNumber);
                result = response;
                break;
            case "updateinstrument":
                await userRepository.postUserInstrument(response, phoneNumber);
                result = response;
                break;
        }
    }
    else {
        result = response;
    }
    return result;
}

/**
 * This function stores conversation in the database
 * @param locationOrder
 * @param currentQuestion
 * @param response
 * @param phoneNumber
 */
export async function addConversationPart (locationOrder: any, currentQuestion: any, response: any, phoneNumber: any) {
    const conversation = JSON.parse(JSON.stringify({
        "locationOrder" : locationOrder,
        "question" : currentQuestion,
        "response" : response
    }));
    await userRepository.postConversation(conversation, phoneNumber);
}

/**
 * This function generates user based on several inputs
 * @param name
 * @param phoneNumber
 */
export function generateUserCollection (name: any, phoneNumber: any) {
    const userCollection = JSON.parse(JSON.stringify(
        {
            "name": name,
            "age": "",
            "phoneNumber": phoneNumber,
            "pet": "",
            "instrument": "",
            "conversationHistory": [
                {
                    "locationOrder": "A01",
                    "question": "Starting conversation.",
                    "response": "Awaiting response."
                }
            ],
        }
    ));
    return userCollection;
}
