/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { TFeedBack } from "./feedBack.interface";
import { FeedBack } from "./feedBack.model";
import AppError from "../../error/AppError";
import httpStatus from "http-status";
import { Booking } from "../Booking/booking.model";
import { Car } from "../Car/car.model";
// import cloudinary from "../../utils/sendImageToCloudinary";
// import { v4 as uuidv4 } from 'uuid';
const createFeedBack = async (payload: TFeedBack) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Step 1: Check if the booking exists
    const booking = await Booking.findById(payload?.bookingId);
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    // Step 2: Ensure the booking hasn't been rated yet
    if (booking?.isRatings === false) {
      // Mark the booking as rated
      await Booking.findOneAndUpdate(
        { _id: payload?.bookingId },
        { isRatings: true },
        { new: true, session }
      );

      // Step 3: Find the car associated with the booking
      const car = await Car.findById(booking.car).session(session);
      if (!car) {
        throw new AppError(httpStatus.NOT_FOUND, "Car not found");
      }

      // Step 4: Check if car.rating is null and initialize it as an empty array
      // Step 4: Check if car.rating is null and initialize it as an empty array
      if (car.rating === null) {
        car.rating = [] as any;
      }

      // Step 5: Add carId to payload
      const newPayload = {
        ...payload,
        carId: car._id
      };

      // Step 6: Create feedback
      const feedbackResult = await FeedBack.create([newPayload], { session });
      

      // Step 7: Push feedback ID into Car's rating array
      await Car.findByIdAndUpdate(
        car._id,
        { $push: { rating: feedbackResult[0]._id } }, // Push the new feedback ID into the car's rating array
        { new: true, session }
      );

      // Commit the transaction
      await session.commitTransaction();
      await session.endSession();

      return feedbackResult;
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Feedback already submitted for this booking");
    }
  } catch (err) {
    // Abort the transaction on error
    await session.abortTransaction();
    await session.endSession();

    // Log the error for debugging
   

    throw new AppError(httpStatus.BAD_REQUEST, "Failed to create feedback!");
  }
};



const getAllFeedBacks = async () => {
  const result = await FeedBack.find();
  return result;
};

export const FeedBackService = {
  createFeedBack,
  getAllFeedBacks,
};
