const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

//Middleware de création d'utilisateur
exports.signup = (req, res, next) => {
  //cryptage du mdp avec hash 10 tours
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      //Enregistrement de l'utilisateur
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

//Middleware d'authentification'
exports.login = (req, res, next) => {
  //Trouver l'utilisateur dans la bdd
  User.findOne({ email: req.body.email })
    .then((user) => {
      //si non trouvé
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      //si trouvé comparer le mdp avec le hash enregistré
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          //si mdp incorrect
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            /* vérifier le token à chaque fois avec la fonction 
            sign (payload, clé secrete pour encodage, config expiration)*/
            token: jwt.sign({ userId: user._id }, process.env.SECRETTOKEN, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
