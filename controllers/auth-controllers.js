const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passwordValidator = require("password-validator");
const emailValidator = require("email-validator");
const zxcvbn = require("zxcvbn");

const passwordSchema = new passwordValidator();
passwordSchema
  .is()
  .min(8)
  .is()
  .max(30)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits() // doit contenir un chiffre
  .has()
  .not()
  .spaces() // aucun espace
  .is()
  .not()
  .oneOf(["Password123", "12345678"])
  .is()
  .not()
  .empty();

exports.signup = (req, res, next) => {
  if (!emailValidator.validate(req.body.email)) {
    return res.status(400).json({ message: "Email invalide" });
  }

  if (!passwordSchema.validate(req.body.password)) {
    return res.status(400).json({
      message:
        "Le mot de passe doit contenir entre 8 et 30 caractères, une majuscule, une minuscule, un chiffre, aucun espace et ne doit pas être vide.",
    });
  }

  const passwordStrength = zxcvbn(req.body.password);
  if (passwordStrength.score < 2) {
    // Score sur 4
    return res.status(400).json({
      message:
        "Le mot de passe est trop faible. Essayez d'ajouter des caractères spéciaux, des chiffres, ou des lettres majuscules.",
    });
  }

  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res.status(400).json({ message: "Email déjà utilisé !" });
      }

      bcrypt
        .hash(req.body.password, 10)
        .then((hash) => {
          const user = new User({
            email: req.body.email,
            password: hash,
          });
          user
            .save()
            .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
            .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res
          .status(401)
          .json({ message: "Paire login/mot de passe incorrecte" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res
              .status(401)
              .json({ message: "Paire login/mot de passe incorrecte" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
