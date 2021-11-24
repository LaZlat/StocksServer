const express = require("express");
const db = require('../db')
const router = express.Router();
const jwt = require("jsonwebtoken");
const Axios = require('axios')

router.post('/sellcrypto', (req, res) => {
    const uid = req.body.uid;
    const cid = req.body.cid;
    const price = req.body.price;
    const volume = req.body.volume;
    const sell = req.body.sell

    db.query(
        "SELECT volume FROM crypto_holdings WHERE cid = ? AND user = (SELECT id FROM users WHERE email = ?)",
        [cid, uid],
        (err, result) => {
            if (volume <= result[0].volume) {
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
                db.query(
                    "INSERT INTO crypto_autos (cid, volume, price, user, sell, status) VALUES (?, ?, ?, (SELECT id FROM users WHERE email = ?), ?, ?)",
                    [cid, volume, price, uid, sell, "Aktyvus"],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka crypto"})
            }
        }
    );
});

router.post('/buycrypto', (req, res) => {
    const uid = req.body.uid;
    const cid = req.body.cid;
    const price = req.body.price;
    const volume = req.body.volume;
    const sell = req.body.sell

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
                    "INSERT INTO crypto_autos (cid, volume, price, user, sell, status) VALUES (?, ?, ?, (SELECT id FROM users WHERE email = ?), ?, ?)",
                    [cid, volume, price, uid, sell, "Aktyvus"],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka lesu"})
            }
        }
    );
});

router.get('/availablecryptoautos', (req, res) => {
    const email = req.query.email;
    const token = req.query.token;

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else {
            db.query(
                "SELECT id, name, volume, price, sell, status FROM crypto_autos WHERE user = (SELECT id FROM users WHERE email = ?)",
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

router.post('/deleteautocrypto', (req, res) => {
    const deleteId = req.body.deleteId;
    console.log(req.body)
    db.query(
        "SELECT volume, price, sell, user from crypto_autos WHERE id = ?",
        [deleteId],
        (err, result) =>{
            if(err) {
                console.log(err);
            } else if (result[0].sell == 1) {
                db.query(
                    "UPDATE cash SET amount = (amount + ?) WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(result[0].volume * result[0].price), result[0].user],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            } else {
                db.query(
                    "UPDATE volume SET volume = (volume + ?) WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [result[0].volume, result[0].user],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            }
        }
    )
    db.query("DELETE FROM crypto_autos WHERE id = ?",
    [deleteId],
    (err, result) =>{
        if(err) {
            console.log(err);
        } else {
            res.send({msg: "Pavyko"})
        }
    })
})

let cryptoData = "";
let cryptoAutos = "";

var options = {
    method: 'GET',
    url: 'https://coinranking1.p.rapidapi.com/coins',
    headers: {
      'x-rapidapi-host': 'coinranking1.p.rapidapi.com',
      'x-rapidapi-key': '045de38290mshb58ec6d51d4e6a9p1d0760jsn01c573420a6a'
    }
  };
  
  Axios.request(options).then(function (response) {
      cryptoData = response?.data?.data?.coins;
  }).catch(function (error) {
      console.error(error);
  });

db.query(
    "SELECT id, cid, price, volume, user, sell, status from crypto_autos",
    (err, result) =>{
        if (err) {
            console.log(err)
        } else {
            cryptoAutos = result;
        }
    }
)


  
  setInterval(function() {
      console.log("jelo")

                for (let a = 0; a < cryptoAutos.length; a++) {
                    cryptoData.map((e) => {
                        if(cryptoAutos[a].cid == e.id && cryptoAutos[a].status == 'Aktyvus') {
                            console.log(cryptoAutos[a])
                            if(cryptoAutos[a].sell == true ) {
                                console.log("true")
                                if(cryptoAutos[a].price <= e.price) {
                                    db.query(
                                        "UPDATE cash SET amount = (amount + ?) WHERE user = ?",
                                        [e.price * cryptoAutos[a].volume, cryptoAutos[a].user],
                                        (err, result) =>{ 
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                db.query(
                                                    "UPDATE crypto_autos SET status = ? WHERE id = ?",
                                                    ["BAIGTA", cryptoAutos[a].id],
                                                    (err, result) =>{ 
                                                        if (err) {
                                                            console.log(err)
                                                        }
                                                    }
                                                )
                                            }
                                        }
                                    )
                                }
                            } else {
                                if(cryptoAutos[a].price >= e.price) {
                                    db.query(
                                        "UPDATE crypto_holdings SET volume = (volume + ?) WHERE user = ?",
                                        [cryptoAutos[a].volume, cryptoAutos[a].user],
                                        (err, result) =>{ 
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                db.query(
                                                    "UPDATE crypto_autos SET status = ? WHERE id = ?",
                                                    ["BAIGTA", cryptoAutos[a].id],
                                                    (err, result) =>{ 
                                                        if (err) {
                                                            console.log(err)
                                                        }
                                                    }
                                                )
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    })
                }
  


 
                Axios.request(options).then(function (response) {
                    //cryptoData = response.data;
                }).catch(function (error) {
                    console.error(error);
                });
                
                db.query(
                    "SELECT id, cid, price, volume, user, sell, status from crypto_autos",
                    (err, result) =>{
                        if (err) {
                            console.log(err)
                        } else {
                            cryptoAutos = result;
                        }
                    }
                )
  
  }, 60 * 1000);


module.exports = router;