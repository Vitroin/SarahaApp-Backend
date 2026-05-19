import { Token } from "../DB/model/token.model.js";
import { User } from "../DB/model/user.model.js";
import { verifyToken } from "../utils/token/index.js"
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token){
        throw new Error("Token is required", { cause: 401 });
    }

    const payload = verifyToken(token);

    //check into db
    const blockedToken = await Token.findOne({token, type: "access"})

    if (blockedToken){
        throw new Error("Token is blocked, please login again", { cause: 401 });
    }

    const userExist = await User.findById(payload.id)

    if (!userExist){
        throw new Error("User not found", { cause: 404 });
    }

    req.user = userExist;
    return next();
}