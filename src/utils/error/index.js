import jwt from "jsonwebtoken"
import { verifyToken, generateToken } from "../../utils/token/index.js"
import { Token } from "../../DB/model/token.model.js"

export const asyncHandler = (fn) =>{
    return async (req, res, next) =>{
            fn(req, res, next).catch((error) => {
                next(error)
            })
    }       
            
}

export const globalErrorHandler =  async (error,req,res,next) => {
        // if (req.file){
        //     fs.unlinkSync(req.file.path)
        // }
        if ( error.message == "jwt expired"){
            const refreshToken = req.headers["refreshtoken"]
            const payload = verifyToken(refreshToken)
            const tokenExist = await Token.findOneAndDelete({ 
                token: refreshToken,
                user: payload.id 
                ,type: "refresh" })

            if(!tokenExist){
                throw new Error("Invalid refresh token, please login again", { cause: 401 })
                //logout from all devices
            }
            const accessToken = generateToken({
                payload: { id: payload.id },
                options: { expiresIn: "15m" }
            })

            const newRefreshToken = generateToken({
                payload: { id: payload.id },
                options: { expiresIn: "7d" },
            })

            await Token.create({
                token: newRefreshToken,
                user: payload.id,
                type: "refresh"
            })

            return res.status(200).json({
                message: "Token refreshed successfully",
                success: true,
                data: { accessToken, refreshToken: newRefreshToken }
            })
        }
        res.status(error.cause || 500).json({
            message: error.message || "Internal Server Error",
            success: false,
            stack: error.stack,
            globalErrorHandler: true,
            error
        }
    ) 
}
