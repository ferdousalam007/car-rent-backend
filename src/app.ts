import express, { Request, Response } from "express";
import router from "./app/routes";
import cors from "cors";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import fileUpload from 'express-fileupload';
const app = express();


app.use(
  cors({
    origin: [
      "http://localhost:5173",
      // "https://car-rental-reservation-client.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
//parser
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  }),
);
//application route
app.use("/api", router);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcom to car rent service !");
});

app.use(globalErrorHandler);
//not found
app.use(notFound);
export default app;
