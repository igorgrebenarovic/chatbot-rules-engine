/**
 * Interface representing object of Parsed Cards.
 * @interface
 */
interface ParsedCards {
    [key: string]: {
        [locationOrder: string]: Card;
    };
}

/**
 * Interface representing Card
 * @interface
 */
interface Card {
    purpose: string;
    question: string;
    dbField: string;
    cardRules: CardRules;
    fieldName: string;
    nextCard: string;
    endCard: boolean;
}

/**
 * Interface representing CardRules
 * @interface
 */
interface CardRules {
    rules?: Rule[];
    negRes: string;
}
