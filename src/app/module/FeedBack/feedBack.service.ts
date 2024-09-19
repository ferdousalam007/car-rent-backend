/* eslint-disable @typescript-eslint/no-explicit-any */
import { TFeedBack } from "./feedBack.interface";
import { FeedBack } from "./feedBack.model";
import cloudinary from "../../utils/sendImageToCloudinary";
import { v4 as uuidv4 } from 'uuid';
const createFeedBack = async (payload: TFeedBack,req:any,res:any) => {

  if (req.files && req.files.image) {
    const image = req.files.image as any;
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!validExtensions.includes(image.mimetype)) {
      return res
        .status(400)
        .json({ message: 'Only JPEG, JPG,webp and PNG files are allowed' });
    }
    const result = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: 'carRental/feedback',
      public_id: uuidv4(),
    });
    payload.image = result.secure_url;
  }
  const result = await FeedBack.create(payload);
  return result;
};
const getAllFeedBacks = async () => {
  const result = await FeedBack.find();
  return result;
};

export const FeedBackService = {
  createFeedBack,
  getAllFeedBacks,
};
