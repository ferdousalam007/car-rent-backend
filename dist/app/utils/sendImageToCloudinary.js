"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import multer from "multer";
const cloudinary_1 = require("cloudinary");
const config_1 = __importDefault(require("../config"));
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: config_1.default.cloud_name,
    api_key: config_1.default.api_key,
    api_secret: config_1.default.api_secret,
});
exports.default = cloudinary_1.v2;
// export const sendImageToCloudinary = async (
//   imageName: string,
//   path: string
// ) => {
//   return new Promise((resolve, reject) => {
//     // upload image to cloudinary
//     cloudinary.uploader.upload(
//       path,
//       {
//         public_id: imageName,
//       },
//       function (error, result) {
//         if (error) {
//           reject(error);
//         }
//         resolve(result);
//       }
//     );
//   });
// };
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, process.cwd() + "/uploads");
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });
// export const upload = multer({ storage: storage });
