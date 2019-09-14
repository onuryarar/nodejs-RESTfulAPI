const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user')

exports.register = (req, res, next) => {
    User.find({ email: req.body.email }).exec()
        .then(user => {
            if (user.length >= 1) {
                res.status(409).json({
                    message: "Mail already exists"
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash,
                            fname: req.body.fname,
                            lname: req.body.lname
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: 'Kullanıcı oluşturuldu.'
                                });
                            })
                            .catch(err => {
                                res.status(500).json({ error: err });
                            });
                    }
                });
            }
        });
}

exports.get_all = (req, res, next) => {
    User.find()
        .select('-__v -password')
        .exec()
        .then(results => {
            const user = {
                count: results.length,
                user: results.map(result => {
                    return {
                        ...result._doc
                    }
                }),
            }
            res.status(200).json(user);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

exports.get_single = (req, res, next) => {
    User.findOne({ _id: req.params.userId })
        .select('-__v -password')
        .exec()
        .then(result => {
            if (result)
                res.status(200).json({
                    ...result._doc
                });
            else
                res.status(404).json({
                    message: "Kullanıcı bulunamadı."
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
}

exports.update = (req, res, next) => {
    const id = req.params.userId;
    if (id !== req.user.userId) {   /** kişi sadece kendisini düzenleyebilir */
        return res.status(403).json({
            message: 'No Permission'
        });
    }

    User.update({ _id: id }, { $set: req.body })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Kullanıcı güncellendi'
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
    User.remove({ _id: req.params.userId }).exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'Kullanıcı silindi.'
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}

exports.login = (req, res, next) => {
    User.find({ email: req.body.email }).exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Unauthorized'
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (result) {
                    const token = jwt.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    }, process.env.JWT_KEY, {
                        expiresIn: '1h'
                    })
                    return res.status(200).json({
                        message: 'Authorized',
                        token: token
                    })
                }
                res.status(401).json({
                    message: 'Unauthorized'
                })
            });
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
}