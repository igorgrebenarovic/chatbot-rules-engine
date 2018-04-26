interface CsvRow {
    locationOrder: string;
    purpose: string;
    dbField: string;
    question: string;
    fieldName: string;
    expression: string;
    posRes: string;
    negRes: string;
    checkValues: string;
}

interface RuleArgs {
    expression: string;
    fieldName: string;
    posRes: string;
    checkValues: string;
}
