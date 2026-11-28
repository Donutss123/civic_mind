import multer from "multer";

// Menyimpan file sementara di memori sebelum diproses.
const storage = multer.memoryStorage();

// Hanya menerima foto JPEG dan PNG.
const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const allowedTypes = ["image/jpeg", "image/png"];

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(new Error("Format foto harus JPG atau PNG"));
  }

  callback(null, true);
};

// Mengatur batas ukuran dan format foto.
export const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});