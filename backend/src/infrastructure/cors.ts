import { NextFunction, Request, Response } from "express";

const allowedOrigins = new Set([
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const allowedMethods = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const allowedHeaders = "Content-Type,Authorization,X-Demo-UserId";

export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.has(origin)) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }

    res.setHeader("Access-Control-Allow-Methods", allowedMethods);
    res.setHeader("Access-Control-Allow-Headers", allowedHeaders);
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({
      status: 403,
      code: "CORS_ORIGIN_DENIED",
      title: "CORS origin is not allowed",
      message: "CORS origin is not allowed",
      detail: "This frontend origin is not allowed",
    });
  }

  next();
};
