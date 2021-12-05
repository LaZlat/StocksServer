const express = require("express");
const db = require('../db')
const router = express.Router();
const jwt = require("jsonwebtoken");


router.post('/buystock', (req, res) => {
    const symbol = req.body.symbol;
    const price = req.body.price;
    const volume = req.body.volume;
    const decodedToken = jwt.decode(req.body.token)

    db.query(
        "SELECT amount FROM cash WHERE user = (SELECT id FROM users WHERE email = ?)",
        [decodedToken.user],
        (err, result) => {
            if (price * volume < result[0].amount) {
                db.query(
                    "UPDATE cash SET amount = ? WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(result[0].amount-price), decodedToken.user],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
                db.query(
                    "INSERT INTO stock_holdings (user, symbol, volume) VALUES ((SELECT id FROM users WHERE email = ?), ?, ?) ON DUPLICATE KEY UPDATE volume = volume + ?",
                    [decodedToken.user, symbol, volume, volume],
                    (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "Vertybiniai popieriai nupirkti"});
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka lėšų"})
            }
        }
    );
});

router.post('/buycrypto', (req, res) => {
    const cid = req.body.cid;
    const price = req.body.price;
    const volume = req.body.volume;
    const name = req.body.name;
    const decodedToken = jwt.decode(req.body.token)

    db.query(
        "SELECT amount FROM cash WHERE user = (SELECT id FROM users WHERE email = ?)",
        [decodedToken.user],
        (err, result) => {
            if (price * volume < result[0].amount) {
                db.query(
                    "UPDATE cash SET amount = ? WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(result[0].amount-price), decodedToken.user],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
                db.query(
                    "INSERT INTO crypto_holdings (user, cid, volume, name) VALUES ((SELECT id FROM users WHERE email = ?), ?, ?, ?) ON DUPLICATE KEY UPDATE volume = volume + ?",
                    [decodedToken.user, cid, volume, name, volume],
                    (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "Virtualios valiutos nupirktos"});
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka lešų"})
            }
        }
    );
});

module.exports = router;