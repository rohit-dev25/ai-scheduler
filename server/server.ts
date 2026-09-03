import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import socialAuthRouter from "./routes/social-authRoutes.js";
import accountRouter from "./routes/accountRoutes.js";
import router from "./routes/postRoutes.js";
import activityRouter from "./routes/activityRoutes.js";
import cron from "node-cron";
import { processScheduledPosts } from "./services/schedulerSevice.js";

const app = express();
//database connection
await connectDB();

// Middleware
app.use(cors())
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/', (_req: Request, res: Response) => {
    res.send('Server is Live!');
});
cron.schedule("* * * * *", () => {
  processScheduledPosts();
});
app.use("/api/auth",authRouter)
app.use("/api/oauth",socialAuthRouter)
app.use("/api/accounts",accountRouter)
app.use("/api/posts",router)
app.use("/api/activity",activityRouter)
//Global error handler

app.use((err:any,_req:Request,res:Response,_next:NextFunction)=>{
    console.log(err);
    res.status(500).send(err?.response?.data?.message || err?.message);
    
})
app.use((req, _res, next) => {
  console.log("Incoming:", req.method, req.url);
  next();
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});