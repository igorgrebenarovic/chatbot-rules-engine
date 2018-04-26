/**
 * Module dependencies.
 */
import * as Ajv from "ajv";
import * as request from "request";
import { UserRepository } from "../controllers/user.controller";

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
const ajv = new Ajv({allErrors: true, $data: true});
require("ajv-keywords")(ajv, ["formatMinimum", "formatMaximum"]);

/**
 * Requiring modules and creating classes.
 */
const userRepository = new UserRepository();

export const checkObjHasProperty = (obj: any, propertyString: string): boolean => {
    const property: string[] = propertyString.split(".");
    if (!obj) return false;
    if (property.length === 1) return (property[0] in obj);
    else {
        if (property[0] in obj) {
            return checkObjHasProperty(obj[property[0]], property.slice(1).join("."));
        } else return false;
    }
};

export const getDataByType = (questionId: string, response: string) => {
    const customerPromise: {[k: string]: any} = {};
    customerPromise[questionId] = response;
    return customerPromise;
};

export const validate = (schema: any, query: any) => {
    const validate = ajv.validate(schema, query);
    return ajv.errors;
};
