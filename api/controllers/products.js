const mongoose = require('mongoose');

const Product = require('../models/product');

exports.get_all = (req, res, next) => {
    Product.find()
        .select('-__v')
        .exec()
        .then(results => {
            const products = {
                count: results.length,
                product: results.map(result => {
                    return {
                        ...result._doc,
                        request: {
                            type: 'GET',
                            url: process.env.URL + '/products/' + result._id
                        }
                    }
                }),
            }
            res.status(200).json(products);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

exports.get_single = (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select("-__v")
        .exec()
        .then(result => {
            if (result)
                res.status(200).json({
                    product: result,
                    request: {
                        type: 'GET',
                        url: process.env.URL + '/products'
                    }
                });
            else
                res.status(404).json({
                    message: "Ürün bulanamadı"
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

exports.create = (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product
        .save()
        .then(result => {
            const { __v, ...createdProduct } = result._doc;
            res.status(201).json({
                message: 'Ürün başarıyla oluşturuldu',
                product: {
                    ...createdProduct,
                    request: {
                        type: 'GET',
                        url: process.env.URL + '/products/' + result._id
                    }
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        })
}

exports.update = (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.update({ _id: id }, { $set: updateOps })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Ürün başarıyla güncellendi',
                request: {
                    type: 'GET',
                    url: process.env.URL + '/products/' + id
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.delete = (req, res, next) => {
    const id = req.params.productId;
    Product.remove({ _id: id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Ürün başarıyla silindi',
                request: {
                    type: 'POST',
                    url: 'http://localhost:400/products',
                    body: { name: 'String', price: 'Number' }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}