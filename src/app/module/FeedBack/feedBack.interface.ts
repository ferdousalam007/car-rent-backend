import { Types } from "mongoose";
export type TFeedBack = {
bookingId: Types.ObjectId;
carId: Types.ObjectId;
  message: string;
  rating: number;
  date: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // image: any;
};
