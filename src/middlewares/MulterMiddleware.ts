const multer = require("multer")
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the 'uploads' folder is at the root level
    cb(null, path.join(__dirname, "../../uploads")); // Goes up two levels to reach the root
  },
  filename: (req, file, cb) => {
    // Keep the original filename
    cb(null, file.originalname);
  }
});

 export const upload = multer({ storage });