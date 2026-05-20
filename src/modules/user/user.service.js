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

export const getMe = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new Error("User not found", { cause: 404 });
  return res.status(200).json({
    message: "User fetched successfully",
    success: true,
    data: user
  });
};


export const uploadProfilePictureCloud = async (req, res, next) => {
  const user = req.user;
  const file = req.file;

  if (!file) {
    throw new Error("No file uploaded", { cause: 400 });
  }

  try {
    const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
      folder: `Sarahah/users/${user._id}/profilePic`,
      public_id: "profilePic",
      overwrite: true
    });

    await User.updateOne(
      { _id: user._id },
      { profilePic: { secure_url, public_id } }
    );

    // Delete temp file after upload
    fs.unlinkSync(file.path);

    return res.status(200).json({
      message: "Profile picture uploaded successfully",
      success: true,
      data: { secure_url, public_id }
    });
  } catch (err) {
    // Clean up temp file if upload fails
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw new Error("Failed to upload image: " + err.message, { cause: 500 });
  }
};