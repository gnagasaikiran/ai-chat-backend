// lambda.js (AWS Lambda handler)
import serverless from "serverless-http";
import app from "./app.js";

export const handler = serverless(app);
