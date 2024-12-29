import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      token?: string; // Add the token property to the Request type
    }
  }
}
