import { User } from "../../DB/model/user.model.js";
import jwt from "jsonwebtoken";
import {verifyToken} from "../../utils/token/index.js"
import fs from "fs";
import cloudinary from "../../utils/cloud/cloudinary.config.js";

export const deleteAccount = async (req,res, next) =>{

        const user = await User.findById(req.user._id);
        
        if (!user) throw new Error("User not found", { cause: 404 });

        const folderPath = `Sarahah/users/${user._id}`;

        // Delete user from DB
        await User.findByIdAndDelete(req.user._id);

        if (user.profilePic?.public_id) {
            await cloudinary.api.delete_resources_by_prefix(folderPath);
            await cloudinary.api.delete_folder(folderPath);

            return res.status(200).json({
                message: "Account and profile deleted successfully",
                success: true
            });
        }

        return res.status(200).json({
            message: "Account deleted successfully but no profile picture found",
            success: true
        });

}


export const uploadProfilePicture = async (req,res, next) =>{
        if (req.user.profilePic){
            fs.unlinkSync(req.user.profilePic)
        }

        if (!req.file) {
            throw new Error("No file uploaded", { cause: 400 });
        }
        const userExist = await User.findByIdAndUpdate(
        req.user._id,
        {
            profilePic: req.file.path
        },
        {new: true}
    )
    if (!userExist){
        throw new Error("User not found", { cause: 404 });
    }

    return res.status(200).json({
        message: "Profile picture uploaded successfully",
        success: true,
        data: userExist
    });

}

export const uploadProfilePictureCloud = async (req, res, next) => {
    const user = req.user;
    const file = req.file;


    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
        folder: `Sarahah/users/${user._id}/profilePic`,
        public_id: "profilePic",
        overwrite: true
    });

    // ✅ Save both fields nested inside profilePic
    await User.updateOne(
        { _id: user._id },
        { profilePic: { secure_url, public_id } }  
    );

    return res.status(200).json({
        message: "Profile picture uploaded successfully",
        success: true,
        data: { secure_url, public_id }
    });
};