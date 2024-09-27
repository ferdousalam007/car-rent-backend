import mongoose, { model, Schema } from "mongoose";
import { TFeedBack } from "./feedBack.interface";
import moment from "moment";

const feedBackSchema = new Schema<TFeedBack>({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: [true, "Booking ID is required"],
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    required: [true, "Car ID is required"],
  },
  message: {
    type: String,
    required: [true, "Message is required"],
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
  },
  
  date: {
    type: String,
    required: true,
    default: () => moment().format("DD-MM-YYYY"),
  },
});

export const FeedBack = model<TFeedBack>("FeedBack", feedBackSchema);
