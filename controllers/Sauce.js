const Sauce = require("../models/Sauce");
const fs = require("fs");

//Fonction pour la gestion des likes
function makeOrder(type, liked, idUser) {
  const result = {
    $inc: {},
    $pull: {},
    $push: {},
  };
  let quantity;
  if (type === "j'aime") quantity = 1;
  if (type === "je n'aime plus") quantity = -1;
  result.$inc[liked ? "likes" : "dislikes"] = quantity;
  const actionArray = type === "je n'aime plus" ? "$pull" : "$push";
  const targetArray = liked ? "" : "Dis";
  result[actionArray]["users" + targetArray + "Liked"] = idUser;
  return result;
}

//Middleware de cration de la sauce
exports.createSauce = async (req, res, next) => {
  try {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
      dislikes: 0,
      likes: 0,
      usersLiked: [],
      usersDisliked: [],
    });
    await sauce.save();
    res.status(201).json({ message: "Sauce enregistrée !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

//Middleware de modification de la sauce
exports.modifySauce = async (req, res, next) => {
  try {
    const sauceObject = req.file
      ? {
          ...JSON.parse(req.body.sauce),
          imageUrl: `${req.protocol}://${req.get("host")}/images/${
            req.file.filename
          }`,
        }
      : { ...req.body };
    await Sauce.updateOne(
      { _id: req.params.id },
      { ...sauceObject, _id: req.params.id }
    );
    res.status(200).json({ message: "Sauce modifiée !" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

//Séléction d'une seule sauce en fonction asynchrone pour attendre qu'une sauce soit trouvée
exports.getOneSauce = async (req, res, next) => {
  try {
    const sauce = await Sauce.findOne({ _id: req.params.id });
    res.status(200).json(sauce);
  } catch (error) {
    res.status(404).json({ error });
  }
};

//Middleware de suppresion de la sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

//Middleware de cration de toute les sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(400).json({ error }));
};

//Middleware de like de la sauce
exports.likeSauce = async (req, res, next) => {
  try {
    const idUser = req.body.userId;
    const result = await Sauce.findById(req.params.id).exec();
    let todo;
    if (result.usersLiked.indexOf(idUser) === -1)
      todo = makeOrder("j'aime", true, idUser);
    else todo = makeOrder("je n'aime plus", true, idUser);
    console.log(todo);
    await Sauce.updateOne({ _id: result._id }, todo);
    res.status(200).json({ message: "like ou dislike pris en compte" });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "echec", error: err });
  }
};
