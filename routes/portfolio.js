const express = require("express");
const db = require('../db')
const router = express.Router();
const jwt = require("jsonwebtoken");

router.get('/availablecash', (req, res) => {
    const email = req.query.email;
    const token = req.query.token;

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else {
            db.query(
                "SELECT amount, currecny FROM cash WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err || result[0] == null) {
                        res.sendStatus(404);
                    } else {
                        res.send(result[0]);   
                    }
                });
        }
    })
});

router.get('/availablecrypto', (req, res) => {
    const email = req.query.email;
    const token = req.query.token;

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else {
            db.query(
                "SELECT name, cid, volume FROM crypto_holdings WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err || result[0] == null) {
                        res.sendStatus(404);
                    } else {
                        res.send(result);   
                    }
                });
        }
    })
});

router.get('/availablestock', (req, res) => {
    const email = req.query.email;
    const token = req.query.token;

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else {
            db.query(
                "SELECT symbol, volume FROM stock_holdings WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err || result[0] == null) {
                        res.sendStatus(404);
                    } else {
                        res.send(result);   
                    }
                }
            );
        }
    })
});

router.get('/generatecsv', (req, res) => {
    const email = req.query.email;
    const token = req.query.token;

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else {
            db.query(
                "SELECT name, volume FROM crypto_holdings WHERE user = (SELECT id FROM users WHERE email = ?) UNION ALL SELECT symbol as name, volume FROM stock_holdings WHERE user = (SELECT id FROM users WHERE email = ?) UNION ALL SELECT currecny as name, amount as volume FROM cash WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email, email, email],
                (err, result) => {
                    if (err || result[0] == null) {
                        res.sendStatus(404);
                    } else {
                        let csv;

                        csv = "name,volume" + '\r\n';
                        
                        for(let i = 0; i < result.length; i++){
                            let keysAmount = Object.keys(result[i]).length
                            let keysCounter = 0
                    
                               for(let key in result[i]){
                                   csv += result[i][key] + (keysCounter+1 < keysAmount ? ',' : '\r\n' )
                                   keysCounter++
                               }
                            
                        
                            keysCounter = 0
                        }

                        res.send(csv);
                    }
                }
            );
        }
    })
});

module.exports = router;