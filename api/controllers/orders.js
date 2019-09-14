const mongoose = require('mongoose');

const Order = require('../models/order');
const Product = require('../models/product');

exports.get_all = (req, res, next) => {
    Order.find()
        .select('-__v')     // __v'yi getirme
        .populate('product', 'name')    //join product
        .exec()
        .then(results => {
            const orders = {
                count: results.length,
                data: results.map(result => {
                    return {
                        ...result._doc,
                        request: {
                            type: 'GET',
                            url: process.env.URL + '/orders/' + result._id
                        }
                    }
                }),
            }
            res.status(200).json(orders);
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

exports.get_single = (req, res, next) => {
    Order.findById(req.params.orderId)
        .select('-__v')
        .populate('product', '-__v')
        .exec()
        .then(result => {
            if (!result) {
                return res.status(404).json({
                    message: "Sipariş bulunamadı"
                })
            }
            res.status(200).json({
                order: result,
                request: {
                    type: 'GET',
                    url: process.env.URL + '/orders'
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}

exports.create = (req, res, next) => {
    Product.findById(req.body.productId)
        .then(product => {
            if (!product) {
                return res.status(404).json({
                    message: 'Ürün bulunamadı.'
                })
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),
                quantity: req.body.quantity,
                product: req.body.productId
            });
            return order.save();
        })
        .then(result => {
            const { __v, ...createdOrder } = result._doc;
            res.status(201).json({
                message: 'Sipariş başarıyla oluşturuldu',
                order: {
                    ...createdOrder,
                    request: {
                        type: 'GET',
                        url: process.env.URL + '/orders/' + result._id
                    }
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        });
}

exports.delete = (req, res, next) => {
    Order.remove({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Ürün başarıyla silindi',
                request: {
                    type: 'POST',
                    url: process.env.URL + '/orders',
                    body: { productId: 'ID', quantity: 'Number' }
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
}