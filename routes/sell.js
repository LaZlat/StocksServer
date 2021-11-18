const express = require("express");
const db = require('../db')
const router = express.Router();

router.post('/sellcrypto', (req, res) => {
    const uid = req.body.uid;
    const cid = req.body.cid;
    const price = req.body.price;
    const volume = req.body.volume;

    db.query(
        "SELECT volume FROM crypto_holdings WHERE cid = ? AND user = (SELECT id FROM users WHERE email = ?)",
        [cid, uid],
        (err, result) => {
            if (volume <= result[0].volume) {
                db.query(
                    "UPDATE cash SET amount = (amount + ?) WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(volume * price), uid],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
                db.query(
                    "UPDATE crypto_holdings SET volume = (volume - ?) WHERE cid = ? AND user = (SELECT id FROM users WHERE email = ?)",
                    [volume, cid, uid],
                    (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "pavyko"});
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka crypto"})
            }
        }
    );
});

router.post('/sellstock', (req, res) => {
    const uid = req.body.uid;
    const symbol = req.body.symbol;
    const price = req.body.price;
    const volume = req.body.volume;

    db.query(
        "SELECT volume FROM stock_holdings WHERE symbol = ? AND user = (SELECT id FROM users WHERE email = ?)",
        [symbol, uid],
        (err, result) => {
            if (volume <= result[0].volume) {
                db.query(
                    "UPDATE cash SET amount = (amount + ?) WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(volume * price), uid],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
                db.query(
                    "UPDATE stock_holdings SET volume = (volume - ?) WHERE symbol = ? AND user = (SELECT id FROM users WHERE email = ?)",
                    [volume, symbol, uid],
                    (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "pavyko"});
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka crypto"})
            }
        }
    );
});

module.exports = router;