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
exports.AuthService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const AppError_1 = __importDefault(require("../../error/AppError"));
const user_model_1 = require("../User/user.model");
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../config"));
const auth_constant_1 = require("./auth.constant");
const sendImageToCloudinary_1 = __importDefault(require("../../utils/sendImageToCloudinary"));
const uuid_1 = require("uuid");
const nodemailer_1 = __importDefault(require("nodemailer"));
const createSignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    // Checking if the user already exists
    const existingUser = yield user_model_1.User.findOne({ email: payload.email });
    if (existingUser) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, "User already exists!!");
    }
    // Validate image file
    if (!req.files || !req.files.image) {
        return res.status(400).json({ message: 'Image file is required' });
    }
    const image = req.files.image;
    const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validExtensions.includes(image.mimetype)) {
        return res
            .status(400)
            .json({ message: 'Only JPEG, JPG,webp and PNG files are allowed' });
    }
    const result = yield sendImageToCloudinary_1.default.uploader.upload(image.tempFilePath, {
        folder: 'carRental/users',
        public_id: (0, uuid_1.v4)(),
    });
    // Create new user object
    const newUser = new user_model_1.User(Object.assign(Object.assign({}, payload), { image: result.secure_url }));
    yield newUser.save();
    return newUser;
});
const createSignIn = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.isUserExitsByEmail(payload.email);
    // checking if the user not found
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not Found");
    }
    // chcek password matched
    if (!(yield user_model_1.User.isPasswordMatched(payload === null || payload === void 0 ? void 0 : payload.password, user.password))) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Password do not matched!!");
    }
    // create token send to the client
    const jwtPaylod = {
        userId: user === null || user === void 0 ? void 0 : user._id,
        userEmail: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
    };
    const accessToken = jsonwebtoken_1.default.sign(jwtPaylod, config_1.default.jwt_access_secret, {
        expiresIn: "10m",
    });
    const refreshToken = jsonwebtoken_1.default.sign(jwtPaylod, config_1.default.jwt_refresh_secret, {
        expiresIn: "10d",
    });
    return {
        user,
        refreshToken: refreshToken,
        accessToken: accessToken,
    };
});
const forgotPasswordIntoDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found!!");
    }
    const jwtPayload = {
        userId: user._id,
        userEmail: user.email,
    };
    const token = jsonwebtoken_1.default.sign(jwtPayload, config_1.default.jwt_access_secret, {
        expiresIn: "40m",
    });
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: config_1.default.email,
            pass: config_1.default.email_password
        }
    });
    const mailOptions = {
        from: config_1.default.email,
        to: email,
        subject: 'Reset your password',
        text: `Click the following link to reset your password: ${config_1.default.reset_password_link}/${user._id}/${token}`
    };
    yield transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Something went wrong");
        }
        else {
            // eslint-disable-next-line no-console
            console.log('Email sent: ' + info.response);
        }
    });
});
const resetPasswordIntoDB = (token, password) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = (0, auth_constant_1.verifyToken)(token, config_1.default.jwt_access_secret);
    const { userId } = decoded;
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found!!");
    }
    user.password = password;
    yield user.save();
    return user;
});
const getAllUserInDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.find();
    return result;
});
const refreshTokenIntoDB = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the token is valid
    const decoded = (0, auth_constant_1.verifyToken)(token, config_1.default.jwt_refresh_secret);
    const { userEmail } = decoded;
    const user = yield user_model_1.User.findOne({ email: userEmail });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found!!");
    }
    const jwtPayload = {
        userId: user._id,
        userEmail: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
    };
    const accessToken = jsonwebtoken_1.default.sign(jwtPayload, config_1.default.jwt_access_secret, {
        expiresIn: "10m",
    });
    return {
        accessToken,
    };
});
const updateUserIntoDB = (userEmail, payload, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email: userEmail });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found!!");
    }
    // Validate image file
    if (req.files && req.files.image) {
        const image = req.files.image;
        const validExtensions = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validExtensions.includes(image.mimetype)) {
            return res
                .status(400)
                .json({ message: 'Only JPEG, JPG,webp and PNG files are allowed' });
        }
        const result = yield sendImageToCloudinary_1.default.uploader.upload(image.tempFilePath, {
            folder: 'carRental/users',
            public_id: (0, uuid_1.v4)(),
        });
        payload.image = result.secure_url;
    }
    const result = yield user_model_1.User.findByIdAndUpdate(user === null || user === void 0 ? void 0 : user._id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const getMeIntoDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found!!");
    }
    return user;
});
const delelteUserIntoDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ _id: userId });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found!!");
    }
    const result = yield user_model_1.User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
    return result;
});
const toggleAdminRoleInDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the user exists
    const user = yield user_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // Toggle the user's role between 'admin' and 'user'
    const newRole = user.role === "admin" ? "user" : "admin";
    const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
    return updatedUser;
});
exports.AuthService = {
    createSignUp,
    createSignIn,
    refreshTokenIntoDB,
    getAllUserInDB,
    updateUserIntoDB,
    getMeIntoDB,
    delelteUserIntoDB,
    toggleAdminRoleInDB,
    forgotPasswordIntoDB,
    resetPasswordIntoDB,
};
