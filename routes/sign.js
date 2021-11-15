const express = require("express");
const db = require('../db')
const router = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session');

const saltRounds = 10;

router.get('/signin', (req, res) => {
    console.log(req)
    if (req.session.user) {
        res.send({loggedIn: true, user: req.session.user})
    } else {
        res.send({user: req.session.user})
    }
})

router.post('/signin', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, result) => {
            if (err) {
                res.send({err});
            }
            if (result.length > 0) {
                bcrypt.compare(password, result[0].password, (err, comp) => {
                    if (comp) {
                        req.session.user = result;
                        res.send({re: 1});
                    } else {
                        res.send({re: 0});
                    }
                })
                
            } else {
                res.send({re: 0}); 
            }
        
        }
    );
});

router.post('/signup', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    bcrypt.hash(password, saltRounds, (err, hash) =>{
        if (err) {
            console.log(err);
        }
        db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hash],
            (err, result) => {
                if (err) {
                    console.log(err)
                    res.send({msg: "taken"});
                } else {
                    res.send({msg: "good"});
                }
            
            }
        );
    })
});

module.exports = router;