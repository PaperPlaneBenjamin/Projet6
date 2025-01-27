const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});

const upload = multer({ storage: storage }).single("image");

const convertToWebp = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const originalName = req.file.originalname.split(" ").join("_");
  const nameWithoutExt = path.parse(originalName).name;
  const timestamp = Date.now();
  const webpFilename = `${nameWithoutExt}_${timestamp}.webp`;
  const outputPath = path.join("images", webpFilename);

  sharp(req.file.buffer)
    .webp({ quality: 80 })
    .toFile(outputPath) // Enregistrer l'image convertie
    .then(() => {
      req.file.filename = webpFilename;
      req.file.path = outputPath;
      next();
    })
    .catch((err) => {
      console.error("Erreur lors de la conversion en WebP :", err);
      res.status(500).json({ error: "Erreur lors du traitement de l'image" });
    });
};

module.exports = {
  upload,
  convertToWebp,
};
