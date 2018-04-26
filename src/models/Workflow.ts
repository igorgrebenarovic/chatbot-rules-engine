export const workflowSchema = {
    "properties": {
        "currentPosition": {
            "type": "string"
        },
        "response": {
            "type": "string",
        },
        "rules": {
            "type": "string",
        },
        "phoneNumber": {
            "type": "string",
        }
    },
    "required": [ "currentPosition", "response", "phoneNumber"]
};
