
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/lipaRoute";
const ngrok = require('ngrok');
let tokken = "";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// initialize ngrok using the following function



//middlewares
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Darajaa API payment gateway");
});
app.use("/lipa", router)



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
