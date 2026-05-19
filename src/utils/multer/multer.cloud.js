import multer from 'multer';
import { diskStorage } from 'multer';
import { nanoid } from 'nanoid';
import path from 'path';
import fs from 'fs';

export function fileUpload({ allowedType = ["image/png", "image/jpg", "image/jpeg"] } = {}) {

  const storage = diskStorage({
    destination: (req, file, cb) => {
      const dest = `uploads/temp`;
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      cb(null, nanoid(5) + '-' + file.originalname.replace(/\s/g, '_'));
    }
  });

  const fileFilter = (req, file, cb) => {
    if (allowedType.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type", { cause: 400 }), false);
    }
  };

  return multer({ fileFilter, storage });
}