const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // décodage du token en le séparant de Bearer
    const token = req.headers.authorization.split(" ")[1];
    // vérification du token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    // on ajoute à la requête l'objet auth contenant l'userId
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
