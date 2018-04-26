# README #

### What is this repository for? ###

* This project is a csv-rules-engine driven communication chatbot. In the csv file conversation process is defined. It is than parsed and used in node-rules engine which allows different behaviour of the script. Rules engine is applicable to both small chats and extensive and complex conversation. It makes a good choice when full control of the conversation is needed. The communication channel in this project is SMS and the service used is Twilio. 
* v1:
    - post user info and trigger conversation
    - pre-process user responses so they fit node-rules
    - storing conversation history
    - generating csv of conversation history
* v2 (tbd): 
    - add unit and integration tests
    - extending script

### How do I get set up? ###

* Setup:
    - define env variables specified in an example
    - setup twilio webhook
* Running:
    - npm install
    - npm start
