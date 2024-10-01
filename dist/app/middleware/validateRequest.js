"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseData = (data) => {
    const parsedData = Object.assign({}, data);
    // Convert relevant fields to numbers
    if (parsedData.rating)
        parsedData.rating = parseFloat(parsedData.rating);
    if (parsedData.pricePerHour)
        parsedData.pricePerHour = parseFloat(parsedData.pricePerHour);
    if (parsedData.maxSeats)
        parsedData.maxSeats = parseInt(parsedData.maxSeats, 10);
    // Convert relevant fields to booleans
    if (parsedData.isElectric)
        parsedData.isElectric = parsedData.isElectric === 'true';
    // Convert string to array
    // Helper function to clean and parse string arrays
    const cleanAndParseArray = (str) => {
        return str
            .replace(/[[]]/g, '') // Remove square brackets
            .split(',')
            .map((item) => item.trim().replace(/["']/g, '')); // Trim and remove quotes
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
const validateRequest = (schema) => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        req.body = parseData(req.body);
        yield schema.parseAsync({
            body: req.body,
            cookies: req.cookies,
        });
        next();
    }));
};
exports.default = validateRequest;
