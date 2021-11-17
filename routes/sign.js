const express = require("express");
const db = require('../db')
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const saltRounds = 10;

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
                        
                        const token = jwt.sign(
                            {user: result[0].email},
                            "SECRET",
                            {
                                expiresIn: "2h",
                            }
                        );
                        const user = {
                            email: result[0].email,
                            token: token
                        }
                        res.status(200).json(user);
                    } else {
                        res.status(404);
                    }
                })
                
            } else {
                res.status(404); 
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