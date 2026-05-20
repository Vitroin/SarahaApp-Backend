import { authRouter, userRouter } from './modules/index.js';
import { connectDB } from './DB/connection.js';
import cors from 'cors';
import fs from 'fs';
import { globalErrorHandler } from './utils/error/index.js';

export function bootstrap(app,express){
    app.use(express.json());
    app.use("/uploads",express.static("uploads"))
    app.use(cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "authorization", "refreshtoken"]
    }))

    app.use("/auth", authRouter);
    app.use("/user", userRouter);

    // Global Error Handler
    app.use( globalErrorHandler );
    connectDB();

}