const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/user");

//Route cration utilisateur
router.post("/signup", userCtrl.signup);
//Route connexion utilisateur
router.post("/login", userCtrl.login);

module.exports = router;
