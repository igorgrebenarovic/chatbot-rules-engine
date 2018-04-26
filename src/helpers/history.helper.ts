/**
 * Module dependencies.
 */
import { entries, get } from "lodash";

/**
 * This function creates a CSV based on the headers and body
 * @param headersEnum
 * @param data
 */
export const exportCSV = (headersEnum: any, data: Array<any>) => {
    const dataEntries = entries(headersEnum);
    const [fields, headers] = [dataEntries.map(x => x[0]), dataEntries.map(x => x[1])];
    const dataRows = data.map(x => fields.map(f => JSON.stringify(get(x, f))).join(","));
    return [headers.join(","), ...dataRows].join("\r\n");
};