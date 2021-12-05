const express = require("express");
const db = require('../db')
const router = express.Router();
const jwt = require("jsonwebtoken");

router.post('/users', (req, res) => {
    const owner = jwt.decode(req.body.token)
    const token = req.body.token;

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else if (owner.user == 'admin@admin.com') {
            db.query(
            "SELECT u.name, u.email, c.amount FROM users u INNER JOIN cash c where u.id = c.user",
            (err, result) => {
                if (err || result[0] == null) {
                    console.log(err)
                } else {
                    res.send(result)
                }
            }
        );}
    })
});

router.post('/removeuser', (req, res) => {
    const owner = jwt.decode(req.body.token)
    const token = req.body.token;
    const email = req.body.email

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else if (owner.user === 'admin@admin.com') {

            db.query(
                "DELETE FROM crypto_holdings WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            );
        
            db.query(
                "DELETE FROM stock_holdings WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            );
        
            db.query(
                "DELETE FROM stock_autos WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            );
        
            db.query(
                "DELETE FROM crypto_autos WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            );

            db.query(
                "DELETE FROM cash WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
            });


            db.query(
                "DELETE FROM users WHERE email = ?",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        res.status(200);
                    }
            });
        } else {
            res.status(404);
        }
    })
});

router.post('/restartuser', (req, res) => {
    const owner = jwt.decode(req.body.token)
    const token = req.body.token;
    const email = req.body.email

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else if (owner.user === 'admin@admin.com') {

            db.query(
                "DELETE FROM crypto_holdings WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            );
        
            db.query(
                "DELETE FROM stock_holdings WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            );
        
            db.query(
                "DELETE FROM stock_autos WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            );
        
            db.query(
                "DELETE FROM crypto_autos WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            );

            db.query(
                "UPDATE cash SET amount = '10000' WHERE user = (SELECT id FROM users WHERE email = ?)",
                [email],
                (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(result)
                    }
                }
            );
        } else {
            res.status(404);
        }
    })
});

module.exports = router;