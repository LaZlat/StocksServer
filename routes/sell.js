const express = require("express");
const db = require('../db')
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post('/sellcrypto', (req, res) => {
    const cid = req.body.cid;
    const price = req.body.price;
    const volume = req.body.volume;
    const decodedToken = jwt.decode(req.body.token)

    db.query(
        "SELECT volume FROM crypto_holdings WHERE cid = ? AND user = (SELECT id FROM users WHERE email = ?)",
        [cid, decodedToken.user],
        (err, result) => {
            if (result.length == 0) {
                res.send({msg: "Nepakanka virtualių valiutų"})

            }
            if (volume <= result[0].volume) {
                db.query(
                    "UPDATE cash SET amount = (amount + ?) WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(volume * price), decodedToken.user],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
                db.query(
                    "UPDATE crypto_holdings SET volume = (volume - ?) WHERE cid = ? AND user = (SELECT id FROM users WHERE email = ?)",
                    [volume, cid, decodedToken.user],
                    (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "Virtualios valiutos parduotos"});
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka virtualių valiutų"})
            }
        }
    );
});

router.post('/sellstock', (req, res) => {
    const symbol = req.body.symbol;
    const price = req.body.price;
    const volume = req.body.volume;
    const decodedToken = jwt.decode(req.body.token)


    db.query(
        "SELECT volume FROM stock_holdings WHERE symbol = ? AND user = (SELECT id FROM users WHERE email = ?)",
        [symbol, decodedToken.user],
        (err, result) => {
            if (result.length == 0) {
                res.send({msg: "Nepakanka vertybinių popierių"})

            }
            if (volume <= result[0].volume) {
                db.query(
                    "UPDATE cash SET amount = (amount + ?) WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(volume * price), decodedToken.user],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
                db.query(
                    "UPDATE stock_holdings SET volume = (volume - ?) WHERE symbol = ? AND user = (SELECT id FROM users WHERE email = ?)",
                    [volume, symbol, decodedToken.user],
                    (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "Vertybiniai poperiai parduoti"});
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka vertybinių popierių"})
            }
        }
    );
});

module.exports = router;