// ngrokManager.ts
import ngrok from "ngrok";

let tunnelUrl: string | null = null;

export const initializeNgrok = async (port: number): Promise<string> => {
  if (tunnelUrl) {
    // If the tunnel is already initialized, return the existing URL
    return tunnelUrl;
  }

  console.log("Initializing Ngrok tunnel...");

  tunnelUrl = await ngrok.connect({
    proto: "http",
    authtoken: process.env.ngrokauth, // Use your auth token
    addr: port, // Port your app runs on
  });

  console.log(`Ngrok tunnel initialized at: ${tunnelUrl}`);
  return tunnelUrl;
};

export const getNgrokUrl = (): string | null => tunnelUrl;
