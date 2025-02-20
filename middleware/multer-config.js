const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

// Vérifie si le dossier "images" existe, sinon le créer
if (!fs.existsSync("images")) {
  fs.mkdirSync("images");
}

// Stocke temporairement l'image en mémoire RAM sans l'enregistrer sur le disque
const storage = multer.memoryStorage();

// on spécifie que l'on attend un seul fichier image et qu'on veut stocker l'image en mémoire RAM
const upload = multer({ storage: storage }).single("image");

const convertToWebp = async (req, res, next) => {
  // Passe au middleware suivant si aucun fichier n'est envoyé
  if (!req.file) {
    return next();
  }
  try {
    // Nettoie le nom du fichier et génère un nom unique avec un timestamp
    const originalName = req.file.originalname.split(" ").join("_");
    // récupère le nom du fichier sans l'extension
    const nameWithoutExt = path.parse(originalName).name;
    const timestamp = Date.now();
    const webpFilename = `${nameWithoutExt}_${timestamp}.webp`;
    // spécification du chemin de sortie pour la conversion en WebP
    const outputPath = path.join("images", webpFilename);
    // Conversion de l'image en WebP avec une qualité de 80%
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
