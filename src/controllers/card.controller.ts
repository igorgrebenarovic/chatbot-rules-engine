/**
 * Module dependencies.
 */
import * as request from "request";
import * as RuleEngine from "node-rules";
import { UserRepository } from "./user.controller";
import { replaceDynamicText } from "../helpers/card.helper";
import { checkObjHasProperty, getDataByType } from "../controllers/utils.controller";

/**
 * Requiring modules and creating classes.
 */
const userRepository = new UserRepository();

export interface NextCards {
    cardIds: string[];
    percentage: number;
}

export interface Sequence {
    locationOrder: string;
    question: string;
}

/** Class representing a CardRepository. */
export class CardController {

    /**
     * Get array of locationOrders
     * @param locationOrder
     * @param id
     * @param version
     * @returns {Promise<any>}
     */
    public async getNextCardIds(parsedCards: ParsedCards, locationOrder: string, facts: any, version: string, phoneNumber: string): Promise<Sequence[]> {
        if ( !parsedCards[version][locationOrder] ) {
            throw new Error("Card location not found");
        }
        const card: Card = parsedCards[version][locationOrder];
        let nextLocationOrder = card.nextCard;
        const sequence: Sequence[] = [];

        if (card.cardRules) {
            // 2. Check the fact has the property with key Fieldname or throw error
            if (!card.endCard && !checkObjHasProperty(facts, card.fieldName)) {
                throw new Error(`Field ${card.fieldName} not found in fact`);
            }
            // 3. Get next Location order depending on Rules
            try {
                nextLocationOrder = await this.executeRules(card.cardRules.rules, card.cardRules.negRes, facts);
            } catch (e) {
                throw new Error(`Error at getNextCardIds executing Rules ${e}`);
            }
        }
        this.getLocationSequence(parsedCards, nextLocationOrder, version, sequence);
        // 4. Replace dynamic text
        sequence[0].question = await replaceDynamicText(sequence[0].question, phoneNumber);
        return sequence;
    }

    public async executeRules(rules: any[], negativeResult: string, facts: any): Promise<string> {
        const evalRules = rules.map(rule => {
            return {
                condition: eval("(" + rule.condition + ")"),
                consequence: eval("(" + rule.consequence + ")")
            };
        });
        let nextCardLocation: string = negativeResult;

        const R = new RuleEngine(evalRules, "");
        const nextCard: Promise<string> = new Promise((resolve, reject) => {
            R.execute(facts, (result: any) => {
                nextCardLocation = negativeResult;
                if (result.error) {
                    return reject("Error executing Card Rules");
                }
                if (result.cardLocation) {
                    nextCardLocation = result.cardLocation;
                } else {
                    console.log(`No rules satisfied, negative result is: ${nextCardLocation}`);
                }
                return resolve(nextCardLocation);
            });
        });
        return nextCard;
    }

    /**
     * Get Location orders sequence
     * @param currentOrder - The card's location order.
     * @param version - The rules version
     * @param sequence - The current location order sequence
     * @returns     - Return array with the location orders sequence.
     */
    public getLocationSequence(parsedCards: ParsedCards, currentOrder: string, version: string, sequence: Sequence[]): Sequence[] {
        if (!parsedCards[version][currentOrder]) {
            // Location order does not exist, might be a Complete Card
            if (currentOrder.startsWith("Complete")) {
                // CurrentOrder starts with "Complete", return currentOrder as final card
                sequence.push(
                    {
                        locationOrder: currentOrder,
                        question: "This is the end. Thank you.",
                    }
                );
                return sequence;
            } else {
                // Card does not exist, throw Error
                throw new Error(`Card with Location Order ${currentOrder} not present, please review your rules`);
            }
        }
        else {
            const currentCard = parsedCards[version][currentOrder];
            if (currentOrder.startsWith("Complete") ||
                currentCard.cardRules
            ) {
                // Card starts with "Complete" or has rules to evaluate or address lookup
                // return sequence until this point
                sequence.push(
                    {
                        locationOrder: currentOrder,
                        question: currentCard.question,
                    }
                );
                return sequence;
            } else {
                // Card hasnt rules, push currentLocOrder and keep building sequence
                sequence.push(
                    {
                        locationOrder: currentOrder,
                        question: currentCard.question,
                    }
                );
                return this.getLocationSequence(parsedCards, currentCard.nextCard, version, sequence);
            }
        }
    }
}