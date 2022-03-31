const express = require('express');
const router = express.Router();
const saucesCtrl = require('../controllers/Sauce');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/',auth, multer, saucesCtrl.createSauce);
router.put('/:id',auth, multer, saucesCtrl.modifySauce);
router.get('/:id',auth, saucesCtrl.getOneSauce);
router.get('/',auth, saucesCtrl.getAllSauce);
router.delete('/:id',auth, saucesCtrl.deleteSauce);
router.post('/:id/like', auth, saucesCtrl.likeSauce);


module.exports = router;