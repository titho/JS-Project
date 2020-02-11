import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { ApiController } from "./controllers/apiController";
require("dotenv").config();

const app: express.Application = express();
const port: number = +(process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));


app.use("/api", ApiController);

app.listen(port, () => {
  // Success callback
  console.log(`Listening at http://localhost:${port}/`);
});
