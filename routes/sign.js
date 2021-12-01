const express = require("express");
const db = require('../db')
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "elektroniniaimainai@gmail.com",
        pass: "Labas123."
    }
});

var sendEmail = function (email, newPass) {
    transporter.sendMail({
        from: 'elektroniniaimainai@gmail.com', // sender address 
        to: email, // list of receivers 
        cc: '',
        subject: 'Jusu slaptažodis pakeistas', // Subject line 
        text: 'Katik buvo ivykdytas jusu slaptažodžio pakeitimas. Naujasis jusu slaptažodis yra: ' + newPass + '. Ji pasikesiti galite prisijungus.'
    }, function(error, info){
    if (error){
        console.log(error);
    } else {
        console.log('Message sent: ' + info.response);
    }
    });
}

const saltRounds = 10;

router.post('/signin', (req, res) => {


    const email = req.body.email;
    const password = req.body.password;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        (err, result) => {
            if (err) {
                res.status(404).send('Not Found')
            } 
            else if (result.length > 0) {
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
                        res.status(200).send(user);
                    } else {
                        res.status(404).send('Not Found')
                    }
                })
            } else {
                res.status(404).send('Not Found')
            }
        
        }
    );
});

router.post('/signup', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    console.log("2")


    bcrypt.hash(password, saltRounds, (err, hash) =>{
        if (err) {
            console.log(err);
        }
        db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hash],
            (err, result) => {
                if (err) {
                    res.status(404).send('Not Found')
                } else {
                    db.query(
                        "INSERT INTO cash (currecny, amount, user) VALUES (?, ?, (SELECT id FROM users WHERE email = ?))",
                        ['USD', '10000', email],
                        (err, result) => {
                            if (err) {
                                res.status(404).send('Not Found')
                            } else {
                                res.status(200).send("OK")
                            }
                        }
                    );
                }
            }
        );

        
    })
});

router.post('/forgetpass', (req, res) => {
    const email = req.body.email;
    const name = req.body.name;

    const newPass = (Math.random() + 1).toString(36).substring(7);

    bcrypt.hash(newPass, saltRounds, (err, hash) =>{
        if (err) {
            console.log(err);
        } else {
        db.query(
            "UPDATE users SET password = ? WHERE email = ? AND name = ?",
            [hash, email, name],
            (err, result) => {
                if (err) {
                    res.status(404).send('Not Found')
                } else {
                    sendEmail(email, newPass);
                    res.status(200).send("OK")
                } 
            }
        );
        }
    })
})

router.post('/forgetemail', (req, res) => {
    const name = req.body.name;
    const date = req.body.date;

        db.query(
            "SELECT * FROM users WHERE name = ? AND ? < created_at",
            [name, date],
            (err, result) => {
                if (err) {
                    res.status(404).send('Not Found')
                } else if (result.length > 0) {
                    res.status(200).send({email: result[0].email});
                } else {
                    res.status(200).send({email: "Nerasta"});
                }
            }
        );
})

module.exports = router;