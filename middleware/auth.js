const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // récupère le token dans le header authorization
    // split retourne un array avec bearer en 0 et le token en 1
    const token = req.headers.authorization.split(" ")[1];
    //On verifie le token avec la clé secret generer grace a dotenv
    const decodedToken = jwt.verify(token, process.env.SECRETTOKEN);
    //On récupère le userId du token
    const userId = decodedToken.userId;
    //Ajout de l'user du token à l'objet requête
    req.auth = { userId };
    //Si l'userId de la requête est égal a celui du token
    if (req.body.userId && req.body.userId !== userId) {
      throw "Identifiant utilisateur non valide";
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error("Requête invalide!"),
    });
  }
};
