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
exports.FeedBackService = void 0;
const feedBack_model_1 = require("./feedBack.model");
const sendImageToCloudinary_1 = __importDefault(require("../../utils/sendImageToCloudinary"));
const uuid_1 = require("uuid");
const createFeedBack = (payload, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.files && req.files.image) {
        const image = req.files.image;
        const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validExtensions.includes(image.mimetype)) {
            return res
                .status(400)
                .json({ message: 'Only JPEG, JPG,webp and PNG files are allowed' });
        }
        const result = yield sendImageToCloudinary_1.default.uploader.upload(image.tempFilePath, {
            folder: 'carRental/feedback',
            public_id: (0, uuid_1.v4)(),
        });
        payload.image = result.secure_url;
    }
    const result = yield feedBack_model_1.FeedBack.create(payload);
    return result;
});
const getAllFeedBacks = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield feedBack_model_1.FeedBack.find();
    return result;
});
exports.FeedBackService = {
    createFeedBack,
    getAllFeedBacks,
};
