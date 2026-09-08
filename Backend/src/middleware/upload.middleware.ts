import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath =
  path.join(
    process.cwd(),
    "uploads",
    "profile"
  );

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(
    uploadPath,
    {
      recursive: true,
    }
  );
}

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadPath
      );
    },
    filename: (
      req,
      file,
      cb
    ) => {
      const uniqueName =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${path.extname(
          file.originalname
        )}`;
      cb(
        null,
        uniqueName
      );
    },
  });

const fileFilter:
  multer.Options["fileFilter"] =
  (
    req,
    file,
    cb
  ) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      cb(
        null,
        true
      );
    } else {
      cb(
        new Error(
          "Only JPG, JPEG, PNG and WEBP images are allowed"
        )
      );
    }
  };

export const uploadProfile =
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize:
        5 * 1024 * 1024,
    },
  });