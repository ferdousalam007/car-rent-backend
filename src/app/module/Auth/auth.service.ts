/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../error/AppError";
import { TUser } from "../User/user.interface";
import { User } from "../User/user.model";
import httpStatus from "http-status";
import { TSignInUser } from "./auth.interface";
import jwt from "jsonwebtoken";
import config from "../../config";
import { verifyToken } from "./auth.constant";
import cloudinary from "../../utils/sendImageToCloudinary";
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const createSignUp = async (req: any, res: any) => {
  const payload: TUser = req.body;

  // Checking if the user already exists
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "Email already registered");
  }
  // Validate image file
  let result;
  if (req.files && req.files.image) {
    const image = req.files.image as any;
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validExtensions.includes(image.mimetype)) {
      return res
        .status(400)
        .json({ message: 'Only JPEG, JPG,webp and PNG files are allowed' });
    }
    result = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: 'carRental/users',
      public_id: uuidv4(),
    });
  }

  // Create new user object
  const newUser = new User({
    ...payload,
    image: result?.secure_url,
  });


  await newUser.save();

  return newUser;
};

const createSignIn = async (payload: TSignInUser) => {
  const user = await User.isUserExitsByEmail(payload.email);

  // checking if the user not found
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not Found");
  }
const isdeleted =await User.findOne({isDeleted:true})
  if(isdeleted){
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  // chcek password matched
  if (!(await User.isPasswordMatched(payload?.password, user.password))) {
    throw new AppError(httpStatus.FORBIDDEN, "Password do not matched!!");
  }
  // create token send to the client
  const jwtPaylod = {
    userId: user?._id,
    userEmail: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPaylod, config.jwt_access_secret as string, {
    expiresIn: "60m",
  });
  const refreshToken = jwt.sign(
    jwtPaylod,
    config.jwt_refresh_secret as string,
    {
      expiresIn: "10d",
    }
  );
  return {
    user,
    refreshToken: refreshToken,
    accessToken: accessToken,
  };
};
const forgotPasswordIntoDB = async (email: string) => {
 
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  const isdeleted =await User.findOne({isDeleted:true});
  if(isdeleted){
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  const jwtPayload = {
    userId: user._id,
    userEmail: user.email,
  };
  const token = jwt.sign(jwtPayload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: "40m",
  });
  const transporter=nodemailer.createTransport({
    service:'gmail',
    port: 587,  // or 465 for SSL
    secure: false,
    auth:{
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    },
    logger: true,  // Enable logging
    debug: true, 
  });
  const mailOptions={
    from: process.env.EMAIL,
    to:email,
    subject:'Reset your password',
    text: `Click the following link to reset your password: ${process.env.RESET_PASSWORD_LINK}/${user._id}/${token}`
  }
  // Step 5: Send email with error handling
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Something went wrong when sending the email.");
  }
};

const resetPasswordIntoDB = async (token: string, password: string) => {
  const decoded = verifyToken(token, config.jwt_access_secret as string);
  const { userId } = decoded;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  const isdeleted =await User.findOne({isDeleted:true})
  if(isdeleted){
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  user.password = password;
  await user.save();
  return user;
};


const getAllUserInDB = async () => {
  const result = await User.find();
  return result;
};



const refreshTokenIntoDB = async (token: string) => {
  // check if the token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { userEmail } = decoded;
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  const jwtPayload = {
    userId: user._id,
    userEmail: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
  };
  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "10m",
  });
  return {
    accessToken,
  };
};

const updateUserIntoDB = async (userEmail: string, payload: Partial<TUser>, req: any, res: any) => {
  const user = await User.findOne({ email: userEmail });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  // Validate image file
  if (req.files && req.files.image) {
    const image = req.files.image as any;
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validExtensions.includes(image.mimetype)) {
      return res
        .status(400)
        .json({ message: 'Only JPEG, JPG,webp and PNG files are allowed' });
    }
    const result = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: 'carRental/users',
      public_id: uuidv4(),
    });
    payload.image = result.secure_url;
  }
  const result = await User.findByIdAndUpdate(user?._id, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};
const getMeIntoDB = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  return user;
};
const delelteUserIntoDB = async (userId: string) => {
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!!");
  }
  const result = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true }
  );
  return result;
};
const toggleAdminRoleInDB = async (userId: string) => {
  // Check if the user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Toggle the user's role between 'admin' and 'user'
  const newRole = user.role === "admin" ? "user" : "admin";

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true }
  );

  return updatedUser;
};

export const AuthService = {
  createSignUp,
  createSignIn,
  refreshTokenIntoDB,
  getAllUserInDB,
  updateUserIntoDB,
  getMeIntoDB,
  delelteUserIntoDB,
  toggleAdminRoleInDB,
  forgotPasswordIntoDB,
  resetPasswordIntoDB,
};
