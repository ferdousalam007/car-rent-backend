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
// const createFeedBack = async (payload: TFeedBack) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     // Step 1: Check if the booking exists
//     const booking = await Booking.findById(payload?.bookingId);
//     if (!booking) {
//       throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
//     }

//     // Step 2: Ensure the booking hasn't been rated yet
//     if (booking?.isRatings === false) {
//       // Mark the booking as rated
//       await Booking.findOneAndUpdate(
//         { _id: payload?.bookingId },
//         { isRatings: true },
//         { new: true, session }
//       );

//       // Step 3: Find the car associated with the booking
//       const car = await Car.findById(booking.car).session(session);
//       if (!car) {
//         throw new AppError(httpStatus.NOT_FOUND, "Car not found");
//       }

//       // Step 4: Check if car.rating is null and initialize it as an empty array
//       // Step 4: Check if car.rating is null and initialize it as an empty array
//       if (car.rating === null) {
//         car.rating = [] as any;
//       }

//       // Step 5: Add carId to payload
//       const newPayload = {
//         ...payload,
//         carId: car._id
//       };

//       // Step 6: Create feedback
//       const feedbackResult = await FeedBack.create([newPayload], { session });
      

//       // Step 7: Push feedback ID into Car's rating array
//       await Car.findByIdAndUpdate(
//         car._id,
//         { $push: { rating: feedbackResult[0]._id } }, // Push the new feedback ID into the car's rating array
//         { new: true, session }
//       );
//       // Step 8: Recalculate average rating
//       const feedbacks = await FeedBack.find({ carId: car._id }); // Get all feedbacks for the car
//       const totalRatings = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0); // Sum of all ratings
//       const avgRating = totalRatings / feedbacks.length; // Calculate the average

//       // Step 9: Update car's avgRating field
//       await Car.findByIdAndUpdate(
//         car._id,
//         { avgRating }, // Update avgRating field
//         { new: true, session }
//       );
//       // Commit the transaction
//       await session.commitTransaction();
//       await session.endSession();

//       return feedbackResult;
//     } else {
//       throw new AppError(httpStatus.BAD_REQUEST, "Feedback already submitted for this booking");
//     }
//   } catch (err) {
//     // Abort the transaction on error
//     await session.abortTransaction();
//     await session.endSession();

//     // Log the error for debugging
   

//     throw new AppError(httpStatus.BAD_REQUEST, "Failed to create feedback!");
//   }
// };

const createFeedBack = async (payload: TFeedBack) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Check if the booking exists
    const booking = await Booking.findById(payload?.bookingId).session(session);
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    // Step 2: Ensure the booking hasn't been rated yet
    if (booking?.isRatings === false) {
      // Mark the booking as rated
      await Booking.findByIdAndUpdate(
        payload?.bookingId,
        { isRatings: true },
        { new: true, session }
      );

      // Step 3: Find the car associated with the booking
      const car = await Car.findById(booking.car).session(session);
      if (!car) {
        throw new AppError(httpStatus.NOT_FOUND, "Car not found");
      }

     

      // Step 4: Initialize the rating array if null
      // if (!Array.isArray(car.rating)) {
      //   car.rating = [];
      // }

      // Step 5: Add carId to payload
      const newPayload = {
        ...payload,
        carId: car._id
      };

      // Step 6: Create feedback
      const feedbackResult = await FeedBack.create([newPayload], { session });
      const feedback = feedbackResult[0];

     

      // Step 7: Push feedback ID into Car's rating array
      await Car.findByIdAndUpdate(
        car._id,
        { $push: { rating: feedback._id } }, // Push feedback ID to car's rating array
        { new: true, session }
      );

      // Step 8: Recalculate average rating
      const feedbacks = await FeedBack.find({ carId: car._id }).session(session); // Get all feedbacks for the car
      const totalRatings = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0); // Sum all ratings
      const avgRating = totalRatings / feedbacks.length; // Calculate average



      // Step 9: Update car's avgRating field
      await Car.findByIdAndUpdate(
        car._id,
        { avgRating }, // Update avgRating field
        { new: true, session }
      );

      // Commit the transaction
      await session.commitTransaction();
      await session.endSession();

      return feedback;
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Feedback already submitted for this booking");
    }
  } catch (err) {
    // Abort the transaction on error
    await session.abortTransaction();
    await session.endSession();

    // Log the error for debugging
    console.error("Error while creating feedback:", err);

    throw new AppError(httpStatus.BAD_REQUEST, "Failed to create feedback!");
  }
};


// const getAllFeedBacks = async () => {
//   const result = await FeedBack.find()
//   return result;
// };
// const getAllFeedBacks = async () => {
//   const result = await FeedBack.find()
//     .populate({
//       path: 'bookingId',  
//       populate: {
//         path: 'user',     
//         select: 'name image message rating',  
//       },
//     })
//     // .select('car bookingId   date');  

//   return result;
// };
const getAllFeedBacks = async () => {
  const result = await FeedBack.aggregate([
    {
      $lookup: {
        from: 'bookings',            // Join with the Booking collection
        localField: 'bookingId',     // Feedback's bookingId
        foreignField: '_id',         // Booking's _id
        as: 'bookingData',           // Alias for the joined data
      },
    },
    { $unwind: '$bookingData' },     // Unwind the bookingData to deconstruct the array
    {
      $lookup: {
        from: 'users',               // Join with the User collection
        localField: 'bookingData.user',  // Booking's user field
        foreignField: '_id',         // User's _id
        as: 'userData',              // Alias for the joined data
      },
    },
    { $unwind: '$userData' },        // Unwind the userData to deconstruct the array
    {
      $project: {
        _id: 1,                      // Feedback ID
        carId: 1,                    // Car ID
        message: 1,                  // Feedback message
        rating: 1,                   // Feedback rating
        'userData.name': 1,          // User's name
        'userData.image': 1,        
      },
    },
  ]);

  return result;
};




export const FeedBackService = {
  createFeedBack,
  getAllFeedBacks,
};
