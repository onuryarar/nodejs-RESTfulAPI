const express = require('express');
const router = express.Router();
const multer = require('multer');
const authorization = require('../middleaware/check-auth');

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads/');
    },
    filename: function (req, file, callback) {
        const dateTime = new Date().toLocaleString("tr-TR").replace(/:| |\./gi, "");
        callback(null, dateTime + file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
        callback(null, true);
    else
        callback(null, false);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const ProductController = require('../controllers/products');

router.get('/', authorization, ProductController.get_all);

router.get('/:productId', authorization, ProductController.get_single);

router.post('/', authorization, upload.single('productImage'), ProductController.create);

router.patch('/:productId', authorization, ProductController.update);

router.delete('/:productId', authorization, ProductController.delete);

module.exports = router;