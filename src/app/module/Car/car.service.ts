/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../error/AppError";
import { TCar, TSearchCriteria } from "./car.interface";
import { Car } from "./car.model";
import { Booking } from "../Booking/booking.model";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../User/user.model";
import mongoose from "mongoose";
import { calculateTotalPrice } from "./car.utils";
import cloudinary from "../../utils/sendImageToCloudinary";
import { v4 as uuidv4 } from 'uuid';
const createCarIntoDB = async (req: any,res:any) => {
  const parseCars: TCar = req.body;
 
  if (!req.files || !req.files.images) {
    return res.status(400).json({ message: 'Image files are required' });
  }

  let images = req.files.images as any[]; // Type assertion to array
  if (!Array.isArray(images)) {
    images = [images];
  }
  const imageUrls = await Promise.all(
    images.map(async (image: any) => {
      const result = await cloudinary.uploader.upload(image.tempFilePath, {
        folder: 'carRental/cars',
        public_id: uuidv4(),
      });
      return result.secure_url;
    }),
  );
  const payload = new Car({
    ...parseCars,
    images: imageUrls,
  });
  
  const result = await Car.create(payload);
  return result;
};
const getAllCarsFromDB = async (
  name: string,
  carType: string,
  location: string,
  price: number
) => {
  let query: any = {
    isDelete: { $ne: true },
  };

  if (name) {
    const searchRegex = new RegExp(name, "i");
    query = {
      $or: [{ name: searchRegex }],
    };
  }
  if (carType) {
    const searchRegex = new RegExp(carType, "i");
    query = {
      $or: [{ carType: searchRegex }],
    };
  }

  if (location) {
    const searchRegex = new RegExp(location, "i");
    query = {
      $or: [{ location: searchRegex }],
    };
  }
  if (price > 0) {
    query.pricePerHour = { $lte: price };
  }

  const result = await Car.find(query);
  return result;
};
const getSingleCarFromDB = async (id: string) => {
  const result = await Car.findById(id);
  return result;
};
const updateCarIntoDB = async (id: string, payload: Partial<TCar>, req: any) => {
  const { vehicleSpecification, features, ...remainingPayload } = payload;
  const modifiedUpdateData: Record<string, unknown> = {
    ...remainingPayload,
  };

  // Handling features
  if (features && Object.keys(features).length) {
    for (const [key, value] of Object.entries(features)) {
      modifiedUpdateData[`features.${key}`] = value;
    }
  }

  // Handling vehicleSpecification
  if (vehicleSpecification && Object.keys(vehicleSpecification).length) {
    for (const [key, value] of Object.entries(vehicleSpecification)) {
      modifiedUpdateData[`vehicleSpecification.${key}`] = value;
    }
  }

  // Handling images if they exist in the request
  if (req.files && req.files.images) {
    let images = req.files.images as any[];
    if (!Array.isArray(images)) {
      images = [images];
    }
    const imageUrls = await Promise.all(
      images.map(async (image: any) => {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: 'carRental/cars',
          public_id: uuidv4(),
        });
        return result.secure_url;
      }),
    );
    modifiedUpdateData.images = imageUrls;
  }

  const result = await Car.findOneAndUpdate({ _id: id }, modifiedUpdateData, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteCarFromDB = async (id: string) => {
  const result = await Car.findOneAndUpdate(
    { _id: id },
    { isDelete: true },
    {
      new: true,
    }
  );
  return result;
};

const returnCarIntoDB = async (bookingId: string, user: JwtPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userData = await User.findOne({ _id: user?.userId });
    if (!userData) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    if (userData.role !== "admin") {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking) {
      throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }
    const car = await Car.findById(booking.car).session(session);
    if (!car) {
      throw new AppError(httpStatus.NOT_FOUND, "Car not Found!!");
    }

    const { pickUpDate, pickTime } = booking;
    const pricePerHour = car.pricePerHour;

    const { totalCost, dropOffDate, dropTime } = calculateTotalPrice(
      pickUpDate,
      pickTime,
      pricePerHour
    );

    // update booking status
    booking.totalCost = totalCost;
    booking.dropOffDate = dropOffDate;
    booking.dropTime = dropTime;
    booking.status = "completed";

    await booking.save({ session });

    // update cars status
    car.status = "available";
    await car.save({ session });

    // Re-query the booking to populate the car field
    const populatedBooking = await Booking.findById(bookingId)
      .populate("car")
      .populate("user")
      .session(session);
    await session.commitTransaction();
    session.endSession();
    return populatedBooking;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

// search car
const searchCarsFromDB = async ({
  features,
  carType,
  seats,
}: TSearchCriteria) => {
  const query: any = { status: "available" };

  if (carType) {
    query.carType = carType;
  }
  if (seats) {
    query.maxSeats = seats;
  }
  if (features) {
    query.features = { $in: [features] };
  }

  const result = await Car.find(query);

  return result;
};

export const CarServices = {
  createCarIntoDB,
  getAllCarsFromDB,
  getSingleCarFromDB,
  updateCarIntoDB,
  deleteCarFromDB,
  returnCarIntoDB,
  searchCarsFromDB,
};
