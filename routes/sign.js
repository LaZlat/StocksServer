const express = require("express");
const db = require('../db')
const router = express.Router();

router.post('/signin', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    db.query(
        "SELECT id FROM users WHERE email = ? AND password = ?",
        [email, password],
        (err, result) => {
            if (err) {
                res.send({err});
            }
            if (result.length > 0) {
                res.send(result);
            } else {
                res.send({id: 0});
            }
        
        }
    );
});

router.post('/signup', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    console.log("aaa")
    db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        (err, result) => {
            if (err) {
                console.log(err)
                res.send({msg: "taken"});
            } else {
                res.send({msg: "good"});
            }
        
        }
    );
});

module.exports = router;