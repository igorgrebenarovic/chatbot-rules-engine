/**
 * Module dependencies.
 */
import { CardController } from "../controllers/card.controller";
import { getDataByType } from "../controllers/utils.controller";
import { UserRepository } from "../controllers/user.controller";

/**
 * Requiring modules and creating classes.
 */
const userRepository = new UserRepository();

/**
 * This function generates next question based on a current location order and response, for a certain user.
 * It takes into account back option.
 * @param parsedCards
 * @param rules
 * @param locationOrder
 * @param phoneNumber
 * @param response
 */
export async function NextQuestion(parsedCards: any, rules: string, locationOrder: string, phoneNumber: string, response: string) {
    const cardController = new CardController();
    const card: Card = parsedCards[rules][locationOrder];
    let facts;
    let question: any;

    if (!card) throw ({message: "Card not found"});
    else if (card.cardRules) {
        facts = await getDataByType(locationOrder, response);
    }
    question = await cardController.getNextCardIds(parsedCards, locationOrder, facts, rules, phoneNumber);


    return question;
}

/**
 * This functions replaces dynamic text in a question for a certain customer.
 * @param inputString
 * @param phoneNumber
 */
export async function replaceDynamicText(inputString: any, phoneNumber: any) {
    const user: any = await userRepository.getUserInfoByPhoneNumber(phoneNumber);
    const mapObj: any = {
        "<pet>" : user.pet,
        "<name>" : user.name,
        "<instrument>" : user.instrument
    };
    const re = new RegExp(Object.keys(mapObj).join("|"), "gi");
    return inputString.replace(re, function(matched: any) {
        return mapObj[matched];
    });
}