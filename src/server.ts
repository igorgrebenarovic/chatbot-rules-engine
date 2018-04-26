/**
 * Module dependencies.
 */
import * as path from "path";
import * as cors from "cors";
import * as http from "http";
import * as dotenv from "dotenv";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as compression from "compression";
import * as session from "express-session";
import * as errorHandler from "errorhandler";
import swaggerJSDoc = require("swagger-jsdoc");
import * as appInsights from "applicationinsights";
import expressValidator = require("express-validator");
import { parseCsvCardsFile } from "./controllers/parser.controller";

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: ".env" });

/**
 * Controllers (route handlers).
 */
import * as userController from "./routes/user.router";
import * as twilioController from "./routes/twilio.router";
import * as historyController from "./routes/history.router";

/**
 * Create Express server.
 */
const app = express();

(async () => { await parseCsvCardsFile().then((data) => {
    app.set("parsedCards", data);
  });
})();

/**
 *  corsOptions.
 * @type {{allowedHeaders: [string,string]; methods: string; origin: [string,string,string];}}
 */
const corsOptions: cors.CorsOptions = {
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: "*",
  preflightContinue: false,
};

/**
 * Express configuration.
 */
app.set("port", process.env.PORT || 3001);
app.set("host", process.env.HOST || "localhost");
app.use(compression());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
}));

/**
 * API examples routes.
 */
const router = express.Router();

router.get("/getuserInfo/:phoneNumber", userController.getUser);
router.get("/getUsers", userController.getUsers);
router.get("getConversationHistory/{phoneNumber}", historyController.getConversationHistory);
router.post("/postUserInfoAndTriggerConversation", userController.postUserInfoAndTriggerConversation);
router.post("/postUserInfo", userController.postUserInfo);
router.post("/simulateConversation", userController.simulateConversation);
app.post("/message", twilioController.communication);

app.use(`/api/${process.env.PROJECT_VERSION}`, router);

/**
 * Error Handler. Provides full stack - remove for production
 */

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition: {
    swagger: "2.0",
    info: {
      title: "RULES API APP",
      version: `${process.env.PROJECT_VERSION || "1"}.${process.env.BUILD_NUMBER || "0"}.${process.env.BUILD_TAG || "0"}`,
      description: "API for apiapprules project.",
    },
    host: process.env.SWAGGER_HOST || `${app.get("host")}:${app.get("port")}`,
    schemes: ["http", "https"],
    basePath: `/api/${process.env.PROJECT_VERSION}`,
    securityDefinitions: {
      Bearer: {
          type: "apiKey",
          in: "header",
          name: "Authorization"
      }
  },
    },
  apis: [`${__dirname}/routes/*.js`]
});

/* Initialize the Swagger middleware */
app.get("/api-docs", (req: express.Request, res: express.Response) => {
  res.contentType("application/json");
  res.send(swaggerSpec);
});

app.use("/docs", express.static(path.join(__dirname, "public/swagger")));


/**
 * Start Express server.
 */
const port = process.env.PORT || 3001;
http
    .createServer(app)
    .listen(port, () => console.log(`App is running at http://localhost:${port}`));

export default app;