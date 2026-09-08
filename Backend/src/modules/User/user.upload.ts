import multer from "multer";
import path from "path";
import fs from "fs";


// ==========================================
// UPLOAD DIRECTORY
// ==========================================

const uploadDir =
  path.join(
    process.cwd(),
    "uploads",
    "profile"
  );


if (!fs.existsSync(uploadDir)) {

  fs.mkdirSync(
    uploadDir,
    {
      recursive: true,
    }
  );

}


// ==========================================
// STORAGE
// ==========================================

const storage =
  multer.diskStorage({

    destination: (
      req,
      file,
      cb
    ) => {

      cb(
        null,
        uploadDir
      );

    },


    filename: (
      req,
      file,
      cb
    ) => {

      const ext =
        path.extname(
          file.originalname
        );

      const fileName =
        `profile-${Date.now()}-${Math.round(
          Math.random() * 100000
        )}${ext}`;

      cb(
        null,
        fileName
      );

    },

  });


// ==========================================
// FILE FILTER
// ==========================================

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {

  if (
    file.mimetype.startsWith(
      "image/"
    )
  ) {

    cb(null, true);

  } else {

    cb(
      new Error(
        "Only image files are allowed"
      )
    );

  }

};


// ==========================================
// MULTER
// ==========================================

export const uploadProfileImage =
  multer({

    storage,

    fileFilter,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },

  });