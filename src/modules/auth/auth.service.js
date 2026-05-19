import { User } from "../../DB/model/user.model.js";
import { sendMail } from "../../utils/email/index.js";
import { generateOTP } from "../../utils/OTP/index.js";
import { hashPasword, comparePassword } from "../../utils/hash/index.js";
import { Token } from "../../DB/model/token.model.js";
import { generateToken } from "../../utils/token/index.js";

export const register = async (req, res, next) => {
  const { fullName, email, password, phoneNumber, dob } = req.body;

  const userExist = await User.findOne({
    $or: [
      { email: { $exists: true, $ne: null, $eq: email } },
      { phoneNumber: { $exists: true, $ne: null, $eq: phoneNumber } }
    ]
  });

  if (userExist) throw new Error("User already exists", { cause: 409 });

  const user = new User({
    fullName,
    email,
    password: hashPasword(password),
    phoneNumber,
    dob
  });

  const { otp, otpExpire } = generateOTP(15);
  user.otp = otp;
  user.otpExpire = otpExpire;

  if (email) await sendMail({
    to: email,
    subject: "Verify Your Account!",
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`
  });

  await user.save();

  return res.status(201).json({
    message: "User created successfully",
    success: true
  });
};

export const login = async (req, res, next) => {
  const { email, phoneNumber, password } = req.body;

  const userExist = await User.findOne({
    $or: [
      { email: { $exists: true, $ne: null, $eq: email } },
      { phoneNumber: { $exists: true, $ne: null, $eq: phoneNumber } }
    ]
  });

  if (!userExist) throw new Error("Incorrect Credentials", { cause: 401 });

  if (!userExist.isVerified) throw new Error("Account not verified.", { cause: 401 });

  const match = comparePassword(password, userExist.password);
  if (!match) throw new Error("Incorrect Credentials", { cause: 401 });

  const token = generateToken({
    payload: { id: userExist._id },
    options: { expiresIn: "7d" }
  });

  return res.status(200).json({
    message: "Login successful",
    success: true,
    data: { token, user: userExist }
  });
};

export const verifyAccount = async (req, res, next) => {
  const { otp, email } = req.body;

  const userExist = await User.findOne({
    email,
    otp,
    otpExpire: { $gt: Date.now() }
  });

  if (!userExist) throw new Error("Invalid OTP or OTP expired", { cause: 401 });
  if (userExist.isVerified) throw new Error("Account already verified", { cause: 400 });

  userExist.isVerified = true;
  userExist.otp = undefined;
  userExist.otpExpire = undefined;
  await userExist.save();

  return res.status(200).json({
    message: "Account verified successfully",
    success: true
  });
};

export const sendOTP = async (req, res, next) => {
  const { email } = req.body;
  const { otp, otpExpire } = generateOTP(15);

  const userExist = await User.findOneAndUpdate({ email }, { otp, otpExpire });
  if (!userExist) throw new Error("User not found", { cause: 404 });

  await sendMail({
    to: email,
    subject: "New OTP - Verify Your Account!",
    html: `<p>Your New OTP Code Is: <strong>${otp}</strong></p>`
  });

  return res.status(200).json({ message: "OTP sent successfully", success: true });
};

export const logout = async (req, res, next) => {
  const token = req.headers.authorization;
  await Token.create({ token, user: req.user._id, type: "access" });
  return res.status(200).json({ message: "Logout successful", success: true });
};