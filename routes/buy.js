const express = require("express");
const db = require('../db')
const router = express.Router();

router.post('/buystock', (req, res) => {
    const uid = req.body.uid;
    const symbol = req.body.symbol;
    const price = req.body.price;
    const currency = req.body.currency;
    const volume = req.body.volume;

    db.query(
        "SELECT amount FROM cash WHERE currecny = ? AND user = (SELECT id FROM users WHERE email = ?)",
        [currency, uid],
        (err, result) => {
            if (price * volume < result[0].amount) {
                db.query(
                    "UPDATE cash SET amount = ? WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(result[0].amount-price), uid],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
                db.query(
                    "INSERT INTO stock_holdings (user, symbol, volume) VALUES ((SELECT id FROM users WHERE email = ?), ?, ?) ON DUPLICATE KEY UPDATE volume = volume + ?",
                    [uid, symbol, volume, volume],
                    (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "pavyko"});
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka lesu"})
            }
        }
    );
});

router.post('/buycrypto', (req, res) => {
    const uid = req.body.uid;
    const cid = req.body.cid;
    const price = req.body.price;
    const currency = req.body.currency;
    const volume = req.body.volume;
    const name = req.body.name;

    db.query(
        "SELECT amount FROM cash WHERE currecny = ? AND user = (SELECT id FROM users WHERE email = ?)",
        [currency, uid],
        (err, result) => {
            if (price * volume < result[0].amount) {
                db.query(
                    "UPDATE cash SET amount = ? WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(result[0].amount-price), uid],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
                db.query(
                    "INSERT INTO crypto_holdings (user, cid, volume, name) VALUES ((SELECT id FROM users WHERE email = ?), ?, ?, ?) ON DUPLICATE KEY UPDATE volume = volume + ?",
                    [uid, cid, volume, name, volume],
                    (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "pavyko"});
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka lesu"})
            }
        }
    );
});

module.exports = router;