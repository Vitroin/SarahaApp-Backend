import { User } from "../../DB/model/user.model.js";
import bcrypt, { compare } from "bcrypt";
import { sendMail } from "../../utils/email/index.js";
import { generateOTP } from "../../utils/OTP/index.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import joi from 'joi';
import { hashPasword, comparePassword } from "../../utils/hash/index.js";
import { Token } from "../../DB/model/token.model.js";
import { generateToken } from "../../utils/token/index.js";

export const register =  async (req, res ,next) => {
            //  Extract data from request body
            const { fullName, email, password, phoneNumber, dob } = req.body;
            
            //  Check if user already exists (by email OR phone)
            const userExist = await User.findOne({
                $or: [
                    {
                        $and: [
                            { email: { $exists: true } }, // email field exists
                            { email: { $ne: null } },     // email is not null
                            { email: email }              // matches input email
                        ]
                    },
                    {
                        $and: [
                            { phoneNumber: { $exists: true } }, // phoneNumber field exists
                            { phoneNumber: { $ne: null } },     // phoneNumber is not null]
                            { phoneNumber: phoneNumber }         // matches input phoneNumber
                        ]
                    }         // OR phone matches
                ]
            });

            
            if (userExist) {
                throw new Error("User already exists", { cause: 409 });
            }

            // Create new user instance
            const user = new User({
                fullName,
                email,
                password: hashPasword(password),
                phoneNumber,
                dob
            });


            const otp = Math.floor(Math.random() * 90000 + 10000);
            const otpExpire = Date.now() + 15 * 60 * 1000;
            user.otp = otp;
            user.otpExpire = otpExpire;
            
            if (email) await sendMail({
                to: email,
                subject: "Verify Your Account!",
                html: `<p>Your OTP code is: ${otp}</p>`
            });
            // 🔸 Save user to database
            await user.save();

            return res.status(201).json({
            message: "User created successfully",
            success: true,
            data: user} 
        );
    };


export const login =  async (req, res, next) =>{
        //get data from req
        const { email, phoneNumber, password } = req.body;
        console.log(password);

        //check existance of user
        const userExist = await User.findOne({
                $or: [
                    {
                        $and: [
                            { email: { $exists: true } }, // email field exists
                            { email: { $ne: null } },     // email is not null
                            { email: email }              // matches input email
                        ]
                    },
                    {
                        $and: [
                            { phoneNumber: { $exists: true } }, // phoneNumber field exists
                            { phoneNumber: { $ne: null } },     // phoneNumber is not null]
                            { phoneNumber: phoneNumber }         // matches input phoneNumber
                        ]
                    }         // OR phone matches
                ]
        })
        console.log(userExist);

        if (!userExist){
            throw new Error("Incorrect Creditentials", { cause: 401 });
        }

        //check if account is verified
        if (userExist.isVerified === false){
            throw new Error("Account not verified. Please verify your account before logging in.", { cause: 401 });
        }

        //compare password
        const match = comparePassword(password, userExist.password);
        if (!match){
            throw new Error("Incorrect Creditentials", { cause: 401 });
        }

        //generate token
        //send resposne
        const accessToken = generateToken({
            payload: { id: userExist._id },
            options: { expiresIn: "5s" }
        })

        const refreshToken = generateToken({
            payload: { id: userExist._id },
            options: { expiresIn: "7d" },
        })

        await Token.create({ 
            token: refreshToken, 
            user: userExist._id,
            type: "refresh"
         });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            data: {accessToken, refreshToken}
        });
    }


export const  verifyAccount = async (req, res, next) =>{
        const { otp, email} = req.body;
        const userExist = await User.findOne({
            email,
            otp,
            otpExpire: { $gt: Date.now() }
        })

        const currentUser = await User.findOne({ email });

        if (currentUser.isVerified){
            throw new Error("Account already verified", { cause: 400});
        }

        if (!userExist){
            throw new Error("Invalid OTP or OTP expired", { cause: 401});
        }
        userExist.isVerified = true;
        userExist.otp = undefined;
        userExist.otpExpire = undefined;

        await userExist.save();

        return res.status(200).json({
        message: "Account verified successfully",
        success: true,
        data: userExist
        });
    }


export const sendOTP =  async (req, res, next) =>{

        const { email } = req.body;   
        const {otp, otpExpire} = generateOTP(15); // Generate new OTP with 15 minutes expiry
        const userExist = await User.findOneAndUpdate( { email },{ otp, otpExpire })

        if (!userExist){
            throw new Error("User not found", { cause: 404 });
        }

        await sendMail({
            to: email,
            subject: "New OTP - Verify Your Account!",
            html: `<p>Your New OTP Code Is: ${otp}</p>`
        });

        return res.status(200).json({
            message: "OTP sent successfully",
            success: true
        });
    }


export const googleLogin = async (req, res, next) =>{
        const {idToken} = req.body;
        const audience = "348272664706-iq7c77hvaeffruaorsmdv51ncu82l7im.apps.googleusercontent.com";
        const client = new OAuth2Client(audience);
        
        const ticket = await client.verifyIdToken({ idToken, audience });
        const payload = ticket.getPayload(); // { email, name, sub (googleId),phone ,birthdate }
        let userExist = await User.findOne({ email: payload.email })
        if (!userExist){
            userExist = await User.create({
                fullName: payload.name,
                email: payload.email,
                phoneNumber: payload.phone,
                dob: payload.birthdate,
                isVerified: true,
                userAgent: "google"}
            )
        }
        const token = jwt.sign(
            { id: userExist._id, name:userExist.fullName},
            "asdfhasdjfhkkasdjfasdjfasdf",
            { expiresIn: "15m" });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            data: {token}
        });
    }


export const resetPassword = async (req, res, next) => {
    //get data from req
    const { email, otp, newPassword } = req.body;
    
    //check if user exists
    const userExist = await User.findOne({email});

    if (!userExist){
        throw new Error("User not found", { cause: 404 });
    }
    //check if otp is valid
    if (userExist.otp !== Number(otp) ){
        throw new Error("Invalid OTP", { cause: 401 });
    }

    if(userExist.otpExpire < Date.now()){
        throw new Error(" OTP expired", { cause: 401 });
    }
    //Update user
    userExist.password = hashPasword(newPassword);

    await userExist.save(); // create if not exist, update if exist

    return res.status(200).json({
        message: "Password reset successful",
        success: true,
        data: userExist
    });
}


export const logout = async (req, res, next) => {
    //get data from req
    const token = req.headers.authorization
    //store token into database
    await Token.create({ token, user: req.user._id })
    
    return res.status(200).json({
        message: "Logout successful",
        success: true,
    });
}

