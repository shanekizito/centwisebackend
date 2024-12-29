
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

(async function() {
  console.log("Initializing Ngrok tunnel...");

  // Initialize ngrok using auth token and hostname
  const url = await ngrok.connect({
      proto: "http",
      // Your authtoken if you want your hostname to be the same everytime
      authtoken: process.env.ngrokauth,
      // Your hostname if you want your hostname to be the same everytime
      hostname: "",
      // Your app port
      addr: PORT,
   
  });

  console.log(`Listening on url ${url}`);
  console.log("Ngrok tunnel initialized!");
})();

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