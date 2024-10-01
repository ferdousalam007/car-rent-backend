import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";
import catchAsync from "../utils/catchAsync";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseData = (data: any) => {
  const parsedData = { ...data };

  // Convert relevant fields to numbers
  if (parsedData.rating) parsedData.rating = parseFloat(parsedData.rating);
  if (parsedData.pricePerHour) parsedData.pricePerHour = parseFloat(parsedData.pricePerHour);
  if (parsedData.maxSeats) parsedData.maxSeats = parseInt(parsedData.maxSeats, 10);

  // Convert relevant fields to booleans
  if (parsedData.isElectric) parsedData.isElectric = parsedData.isElectric === 'true';

  // Convert string to array
  // Helper function to clean and parse string arrays
  const cleanAndParseArray = (str: string) => {
    return str
      .replace(/[[]]/g, '') // Remove square brackets
      .split(',')
      .map((item: string) => item.trim().replace(/["']/g, '')); // Trim and remove quotes
  };

  // Convert string to array and clean brackets
  if (typeof parsedData.features === 'string') {
    parsedData.features = cleanAndParseArray(parsedData.features);
  }
  if (typeof parsedData.vehicleSpecification === 'string') {
    parsedData.vehicleSpecification = cleanAndParseArray(parsedData.vehicleSpecification);
  }
  return parsedData;
};
const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    req.body = parseData(req.body);
    await schema.parseAsync({
      body: req.body,
      cookies: req.cookies,
    });
    next();
  });
};
export default validateRequest;
