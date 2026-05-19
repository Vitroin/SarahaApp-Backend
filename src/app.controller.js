import { authRouter, userRouter, messageRouter } from './modules/index.js';
import { connectDB } from './DB/connection.js';
import cors from 'cors';
import fs from 'fs';
import { globalErrorHandler } from './utils/error/index.js';

export function bootstrap(app,express){
    app.use(express.json());
    app.use("/uploads",express.static("uploads"))
    app.use(cors({
        origin: "*"
    }));

    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/message", messageRouter);

    // Global Error Handler
    app.use( globalErrorHandler );
    connectDB();

}