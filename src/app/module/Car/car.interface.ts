import { Types } from "mongoose";

export type TCar = {
  name: string;
  description: string;
  color: string;
  isElectric: boolean;
  features: string[];
  isDelete: boolean;
  pricePerHour: number;
  status: "available" | "unavailable";
  carImgUrl: string[];
  vehicleSpecification: string[];
  maxSeats: number;
  rating: [Types.ObjectId];
  gearType: string;
  fuelType: string;
  carType: string;
  avgRating: number;
};
export interface TSearchCriteria {
  carType: string;
  seats: number;
  features: string;
}
