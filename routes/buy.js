const express = require("express");
const db = require('../db')
const router = express.Router();

router.post('/buystock', (req, res) => {
    const uid = req.body.uid;
    const symbol = req.body.symbol;
    const price = req.body.price;
    const currency = req.body.currency;
    const volume = req.body.volume;
    const marketState = req.body.market

    db.query(
        "SELECT amount FROM cash WHERE currecny = ? AND user = ?",
        [currency, uid],
        (err, result) => {
            if(marketState === "CLOSED") {
                res.send({msg: 'Uzdarytas market'});
            }
            else if (price * volume < result[0].amount) {
                db.query(
                    "UPDATE cash SET amount = ? WHERE user = ?",
                    [(result[0].amount-price), uid],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
                db.query(
                    "INSERT INTO stock_holdings (user, symbol, volume) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE volume = volume + ?",
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

    db.query(
        "SELECT amount FROM cash WHERE currecny = ? AND user = ?",
        [currency, uid],
        (err, result) => {
            if (price * volume < result[0].amount) {
                db.query(
                    "UPDATE cash SET amount = ? WHERE user = ?",
                    [(result[0].amount-price), uid],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
                db.query(
                    "INSERT INTO crypto_holdings (user, cid, volume) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE volume = volume + ?",
                    [uid, cid, volume, volume],
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