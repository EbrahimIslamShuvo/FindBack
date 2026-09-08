import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory =
  path.join(
    process.cwd(),
    "uploads",
    "posts"
  );

// Create directory
if (
  !fs.existsSync(
    uploadDirectory
  )
) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}

// =========================
// STORAGE
// =========================

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const fileName =
        `${Date.now()}-${Math.round(
          Math.random() * 1000000000
        )}${extension}`;

      cb(
        null,
        fileName
      );
    },
  });

// =========================
// FILE FILTER
// =========================

const fileFilter: multer.Options["fileFilter"] =
  (
    req,
    file,
    cb
  ) => {
    if (
      file.mimetype.startsWith(
        "image/"
      )
    ) {
      cb(
        null,
        true
      );
    } else {
      cb(
        new Error(
          "Only image files are allowed"
        )
      );
    }
  };

// =========================
// MULTER
// =========================

export const uploadPostImages =
  multer({
    storage,

    fileFilter,

    limits: {
      files: 10,

      fileSize:
        5 * 1024 * 1024,
    },
  });