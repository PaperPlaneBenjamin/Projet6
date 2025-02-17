const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Vérifie si le dossier "images" existe, sinon le créer
if (!fs.existsSync("images")) {
  fs.mkdirSync("images");
}

// Stocke l'image en mémoire pour un traitement rapide avant l'enregistrement
const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single("image");

const convertToWebp = async (req, res, next) => {
  if (!req.file) {
    // Passe au middleware suivant si aucun fichier n'est envoyé
    return next();
  }

  try {
    // Nettoie le nom du fichier et génère un nom unique avec un timestamp
    const originalName = req.file.originalname.split(" ").join("_");
    const nameWithoutExt = path.parse(originalName).name;
    const timestamp = Date.now();
    const webpFilename = `${nameWithoutExt}_${timestamp}.webp`;
    const outputPath = path.join("images", webpFilename);

    await sharp(req.file.buffer).webp({ quality: 80 }).toFile(outputPath);

    // Met à jour l'objet req.file avec le nouveau nom et chemin du fichier
    req.file.filename = webpFilename;
    req.file.path = outputPath;

    next();
  } catch (err) {
    console.error("Erreur lors de la conversion en WebP :", err);
    res.status(500).json({ error: "Erreur lors du traitement de l'image" });
  }
};

module.exports = {
  upload,
  convertToWebp,
};
