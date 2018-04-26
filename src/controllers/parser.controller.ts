/**
 * Module dependencies.
 */
import * as fs from "fs";
import { fail } from "assert";
import { forEach } from "async";
import * as csvParser from "csv-parse";

/**
 * This function parses CSV file
 * @param filename
 */
export const parseCsvCardsFile = async (filename?: string): Promise<ParsedCards> => {
    try {
        const parsedCards: ParsedCards = {};
        const cards: any = {};
        const fileName = filename || __dirname + "/../workflows/v1.csv";
        const parser: any = csvParser({delimiter: ",", columns: true}, (err, data: CsvRow[]) => {
            data.map( (card: CsvRow) => {
                const parsedRow = parseCard(parseRules, card);
                cards[card.locationOrder] = parsedRow;
                parsedCards["v1"] = cards;
            });
        });
        const input = fs.createReadStream(fileName);
        await new Promise(resolve =>
            input
              .pipe(parser)
              .on("end", resolve)
        );
        return parsedCards;
    } catch (e) {
        console.log(e);
        throw (e);
    }
};

export const parseCard = (parseRules: Function, card: CsvRow): Card => {
    let rules: Rule[] = [];
    let cardRules: CardRules;
    const {
        locationOrder,
        purpose,
        dbField,
        question,
        negRes
    } = card;
    const rulesArgs: RuleArgs = card;
    if (rulesArgs.expression !== "") {
        try {
            rules = parseRules(getRule, rulesArgs);
            cardRules = {
                rules,
                negRes,
            };
        } catch (error) {
            console.log(`Error caught at parseRules with location order: ${locationOrder}`);
            throw (error);
        }
    }
    return {
        purpose,
        question,
        dbField,
        cardRules,
        fieldName: rulesArgs.fieldName,
        nextCard: rulesArgs.expression.startsWith("Complete") ? rulesArgs.expression : rulesArgs.posRes,
        endCard: rulesArgs.expression.startsWith("Complete") ? true : false
    };
};

export const parseRules = (getRule: Function, args: RuleArgs): Rule[] => {
    const expressionsArray: string[] = args.expression.split("||");
    const positiveResultsArray: string[] = args.posRes.split("||");
    const checkValuesArray: string[] = args.checkValues.split("||");

    const rules: Rule[] = [];

    if ( expressionsArray.length === positiveResultsArray.length &&
        positiveResultsArray.length === checkValuesArray.length ) {
        expressionsArray.forEach( (expression, index) => {
            const ruleArgs = {
                expression,
                fieldName: args.fieldName,
                posRes: positiveResultsArray[index],
                checkValues: checkValuesArray[index],
            };
            rules.push(getRule(ruleArgs));
        } );
        return rules;
    } else {
        throw new Error("CSV file params dont match");
    }
};

export const getRule = (args: RuleArgs): Rule => {
    const { expression, fieldName, posRes, checkValues} = args;
    const checkValuesArray: string[] = checkValues.split("|").map(value => value.toLowerCase());
    let when: string;
    let ifCondition: string;
    let location: string;

    switch (expression.toLowerCase()) {
        case "equality":
            ifCondition = `this.${fieldName}`;
            when = `['${checkValuesArray.join("','")}'].includes(this.${fieldName}.toLowerCase())`;
            location = posRes;
            break;
        default:
            throw Error(`Error while Parsing CSV: Rule Expression "${expression}" not recognized`);
    }

    const condition =
            `function (R) {
                if(${ifCondition}) {
                    R.when(${when});
                } else {
                    this.error = true;
                    R.stop();
                }
            }`;

    const consequence = `function (R) { this.cardLocation = '${location}'; R.stop(); }`;
    const rule = {
        condition: condition,
        consequence: consequence,
    };
    return rule;
};

