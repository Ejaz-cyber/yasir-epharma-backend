
import multer from "multer";
import path from "path";
import fs from "fs";
import { ApiError } from "../utils/ApiError";

const uploadPath = path.join(__dirname, "../../uploads");

// Ensure the folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.parse(file.originalname).name;
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

export const uploadMultipleMedia = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 6,
  },
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith("image");
    const isVideo = file.mimetype.startsWith("video");

    if (!isImage && !isVideo) {
      return cb(new ApiError(400, "Only image and video files are allowed"));
    }

    cb(null, true);
  },
});
