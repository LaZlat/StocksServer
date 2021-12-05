const express = require("express");
const db = require('../db')
const router = express.Router();
const bcrypt = require('bcrypt');

const saltRounds = 10;


router.post('/pass', (req, res) => {
    const password = req.body.password;
    const email = req.body.email;

    bcrypt.hash(password, saltRounds, (err, hash) =>{
        if (err) {
            console.log(err);
        } else {
        db.query(
            "UPDATE users SET password = ? WHERE email = ?",
            [hash, email],
            (err, result) => {
                if (err) {
                    res.status(404).send('Not found')
                } else {
                    res.status(200).send('OK')
                } 
            
            }
        );
        }
    })
});

router.post('/email', (req, res) => {
    const email = req.body.email;
    const oldEmail = req.body.oldEmail;

    db.query(
        "UPDATE users SET email = ? WHERE email = ?",
        [email, oldEmail],
        (err, result) => {
            if (err) {
                res.status(404).send('Not found')
            } else {
                res.status(200).send(email);
            }
        }
    );
})

router.post('/refresh', (req, res) => {
    const email = req.body.email;

    db.query(
        "UPDATE cash SET amount = '10000' WHERE email = (SELECT id FROM users WHERE email = ?)",
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

    res.status(200).send('OK');
})


module.exports = router;