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
exports.FeedBackControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResonse_1 = __importDefault(require("../../utils/sendResonse"));
const feedBack_service_1 = require("./feedBack.service");
const createFeedBack = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedBack = yield feedBack_service_1.FeedBackService.createFeedBack(req.body, req, res);
    (0, sendResonse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "FeedBack created successfully!",
        data: feedBack,
    });
}));
const getAllFeedBacks = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const feedBacks = yield feedBack_service_1.FeedBackService.getAllFeedBacks();
    (0, sendResonse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "FeedBacks retrieved successfully!",
        data: feedBacks,
    });
}));
exports.FeedBackControllers = {
    createFeedBack,
    getAllFeedBacks,
};
