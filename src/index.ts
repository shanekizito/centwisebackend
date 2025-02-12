// index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/lipaRoute";
import { initializeNgrok } from "../utils/ngrokManager";
import serverless from "serverless-http";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5001;

(async () => {
  // Initialize Ngrok and get the tunnel URL
  const tunnelUrl = await initializeNgrok(PORT);
  console.log(`Ngrok tunnel is available at: ${tunnelUrl}`);
})();

// Middleware setup
app.use(express.json());
app.use(cors());

// Test endpoint
app.get("/", (req, res) => {
  res.send("Daraja API payment gateway");
});

// Routes
app.use("/lipa", router);

export const handler = serverless(app);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
