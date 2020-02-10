import bodyParser from "body-parser";
import { ApiController } from "./controllers/apiController";
import express, { Request, Response } from "express";
require("dotenv").config();

const app: express.Application = express();
const port: number = +(process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));

app.use("/api", ApiController);

app.listen(port, () => {
  // Success callback
  console.log(`Listening at http://localhost:${port}/`);
});
