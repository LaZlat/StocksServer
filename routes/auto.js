const express = require("express");
const db = require('../db')
const router = express.Router();
const jwt = require("jsonwebtoken");
const Axios = require('axios')
const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "elektroniniaimainai@gmail.com",
        pass: "Labas123."
    }
});


var sendEmail = function (text, email) {
    transporter.sendMail({
        from: 'elektroniniaimainai@gmail.com', // sender address 
        to: email, // list of receivers 
        cc: '',
        subject: 'Jusu ' + text + 'sandoris ivykdytas', // Subject line 
        text: 'Katik buvo ivykdytas jusu ' + text + ' automatinio pirkimo sandoris. Placiau suzinokite apsilanke ir prisijunge i elektroniaimainai.lt', // plaintext body 
    }, function(error, info){
    if (error){
        console.log(error);
    } else {
        console.log('Message sent: ' + info.response);
    }
    });
}





router.post('/sellcrypto', (req, res) => {
    const cid = req.body.cid;
    const price = req.body.price;
    const volume = req.body.volume;
    const sell = req.body.sell
    const name = req.body.name;
    const decodedToken = jwt.decode(req.body.token)

    db.query(
        "SELECT volume FROM crypto_holdings WHERE cid = ? AND user = (SELECT id FROM users WHERE email = ?)",
        [cid, decodedToken.user],
        (err, result) => {
            if (volume <= result[0].volume) {
                db.query(
                    "UPDATE crypto_holdings SET volume = (volume - ?) WHERE cid = ? AND user = (SELECT id FROM users WHERE email = ?)",
                    [volume, cid, decodedToken.user],
                    (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "Pardavimas sukurtas"});
                        }
                    }
                )
                db.query(
                    "INSERT INTO crypto_autos (cid, volume, price, user, sell, status) VALUES (?, ?, ?, (SELECT id FROM users WHERE email = ?), ?, ?)",
                    [cid, volume, price, decodedToken.user, sell, "Aktyvus"],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka virtualių valiutų"})
            }
        }
    );
});

router.post('/sellstock', (req, res) => {
    const symbol = req.body.symbol;
    const price = req.body.price;
    const volume = req.body.volume;
    const sell = req.body.sell
    const decodedToken = jwt.decode(req.body.token)

    db.query(
        "SELECT volume FROM stock_holdings WHERE symbol = ? AND user = (SELECT id FROM users WHERE email = ?)",
        [symbol, decodedToken.user],
        (err, result) => {
            if (volume <= result[0].volume) {
                db.query(
                    "UPDATE stock_holdings SET volume = (volume - ?) WHERE symbol = ? AND user = (SELECT id FROM users WHERE email = ?)",
                    [volume, symbol, decodedToken.user],
                    (err, r) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "Pardavimas sukurtas"});
                        }
                    }
                )
                db.query(
                    "INSERT INTO stock_autos (symbol, volume, price, user, sell, status) VALUES (?, ?, ?, (SELECT id FROM users WHERE email = ?), ?, ?)",
                    [symbol, volume, price, decodedToken.user, sell, "Aktyvus"],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka vertybinių popierių"})
            }
        }
    );
});

router.post('/buycrypto', (req, res) => {
    const cid = req.body.cid;
    const price = req.body.price;
    const volume = req.body.volume;
    const sell = req.body.sell;
    const name = req.body.name;
    const decodedToken = jwt.decode(req.body.token)

    db.query(
        "SELECT amount FROM cash WHERE user = (SELECT id FROM users WHERE email = ?)",
        [decodedToken.user],
        (err, result) => {
            if ((price * volume) < result[0].amount) {

                db.query(
                    "UPDATE cash SET amount = ? WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(result[0].amount-(price*volume)), decodedToken.user],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "Pirkimas sukurtas"});
                        }
                    }
                )
                db.query(
                    "INSERT INTO crypto_autos (cid, volume, price, user, sell, status, name) VALUES (?, ?, ?, (SELECT id FROM users WHERE email = ?), ?, ?, ?)",
                    [cid, volume, price, decodedToken.user, sell, "Aktyvus", name],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka lešų"})
            }
        }
    );
});

router.post('/buystock', (req, res) => {
    const symbol = req.body.symbol;
    const price = req.body.price;
    const volume = req.body.volume;
    const sell = req.body.sell;
    const decodedToken = jwt.decode(req.body.token)

    db.query(
        "SELECT amount FROM cash WHERE user = (SELECT id FROM users WHERE email = ?)",
        [decodedToken.user],
        (err, result) => {
            if (price * volume < result[0].amount) {
                db.query(
                    "UPDATE cash SET amount = ? WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(result[0].amount-(volume* price)), decodedToken.user],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send({msg: "Pirkimas sukurtas"});
                        }
                    }
                )
                db.query(
                    "INSERT INTO stock_autos (symbol, volume, price, user, sell, status) VALUES (?, ?, ?, (SELECT id FROM users WHERE email = ?), ?, ?)",
                    [symbol, volume, price, decodedToken, sell, "Aktyvus"],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            } else {
                res.send({msg: "Nepakanka lešų"})
            }
        }
    );
});


router.get('/availablecryptoautos', (req, res) => {
    const email = req.query.email;
    const token = req.query.token;

    const decodedToken = jwt.decode(req.query.token)

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else {
            db.query(
                "SELECT id, name, volume, price, sell, status FROM crypto_autos WHERE user = (SELECT id FROM users WHERE email = ?)",
                [decodedToken.user],
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

router.get('/availablestockautos', (req, res) => {
    const email = req.query.email;
    const token = req.query.token;

    const decodedToken = jwt.decode(req.query.token)

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else {
            db.query(
                "SELECT id, symbol, volume, price, sell, status FROM stock_autos WHERE user = (SELECT id FROM users WHERE email = ?)",
                [decodedToken.user],
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

    db.query(
        "SELECT cid, volume, price, sell, user, status from crypto_autos WHERE id = ?",
        [deleteId],
        (err, result) =>{
            if(err) {
                console.log(err);
            } else if (result[0].sell != 1 && result[0].status == "Aktyvus") {
                db.query(
                    "UPDATE cash SET amount = (amount + ?) WHERE user = (SELECT id FROM users WHERE email = ?)",
                    [(result[0].volume * result[0].price), result[0].user],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            } else if (result[0].status == "Aktyvus") {
                db.query(
                    "UPDATE crypto_holdings SET volume = (volume + ?) WHERE user = ? AND cid = ?",
                    [result[0].volume, result[0].user, result[0].cid],
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

router.post('/deleteautostock', (req, res) => {
    const deleteId = req.body.deleteId;

    db.query(
        "SELECT symbol, volume, price, sell, user, status from stock_autos WHERE id = ?",
        [deleteId],
        (err, result) =>{
            if(err) {
                console.log(err);
            } else if (result[0].sell != 1 && result[0].status == "Aktyvus") {
                db.query(
                    "UPDATE cash SET amount = (amount + ?) WHERE user = ?",
                    [(result[0].volume * result[0].price), result[0].user],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            } else if(result[0].status == "Aktyvus") {
                db.query(
                    "UPDATE stock_holdings SET volume = (volume + ?) WHERE user = ? AND symbol = ?",
                    [result[0].volume, result[0].user, result[0].symbol],
                    (err, result) => {
                        if (err) {
                            console.log(err);
                        }
                    }
                )
            }
        }
    )
    db.query("DELETE FROM stock_autos WHERE id = ?",
    [deleteId],
    (err, result) =>{
        if(err) {
            console.log(err);
        } else {
            res.send({msg: "Pavyko"})
        }
    })
})

/*let cryptoData = "";
let cryptoAutos = "";
let stockData = "";
let stockAutos = "";

var options = {
    method: 'GET',
    url: 'https://coinranking1.p.rapidapi.com/coins',
    headers: {
      'x-rapidapi-host': 'coinranking1.p.rapidapi.com',
      'x-rapidapi-key': '045de38290mshb58ec6d51d4e6a9p1d0760jsn01c573420a6a'
    }
  };

  var options2 = {
    method: 'GET',
    url: 'https://mboum-finance.p.rapidapi.com/co/collections/most_actives',
    params: {start: '0'},
    headers: {
      'x-rapidapi-host': 'mboum-finance.p.rapidapi.com',
      'x-rapidapi-key': '045de38290mshb58ec6d51d4e6a9p1d0760jsn01c573420a6a'
    }
  };
  
  Axios.request(options2).then(function (response) {
      stockData = response?.data?.quotes
  }).catch(function (error) {
      console.error(error);
  });
  
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

db.query(
    "SELECT id, symbol, price, volume, user, sell, status from stock_autos",
    (err, result) =>{
        if (err) {
            console.log(err)
        } else {
            cryptoAutos = result;
        }
    }
)


  
  setInterval(function() {
    for (let a = 0; a < cryptoAutos.length; a++) {
        cryptoData.map((e) => {
            if(cryptoAutos[a].cid == e.id && cryptoAutos[a].status == 'Aktyvus') {
                if(cryptoAutos[a].sell == true ) {
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
                        db.query(
                            "SELECT email FROM users WHERE id = ?",
                            [cryptoAutos[a].user],
                            (err, result) =>{
                                if (err) {
                                    console.log(err)
                                } else {
                                    sendEmail(e.name, result[0].email);
                                }
                            }
                        )
                    }
                } else {
                    if(cryptoAutos[a].price >= e.price) {
                        db.query(
                            "UPDATE crypto_holdings SET volume = (volume + ?) WHERE user = ? AND cid = ?",
                            [cryptoAutos[a].volume, cryptoAutos[a].user, cryptoAutos[a].cid],
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
                        db.query(
                            "SELECT email FROM users WHERE id = ?",
                            [cryptoAutos[a].user],
                            (err, result) =>{
                                if (err) {
                                    console.log(err)
                                } else {
                                    sendEmail(e.name, result[0].email);
                                }
                            }
                        )
                    }
                }
            }
        })
    }

    for (let a = 0; a < stockAutos.length; a++) {
        stockData.map((e) => {
            if(stockAutos[a].symbol == e.symbol && stockAutos[a].status == 'Aktyvus') {
                if(stockAutos[a].sell == true ) {
                    if(stockAutos[a].price <= e.ask) {
                        db.query(
                            "UPDATE cash SET amount = (amount + ?) WHERE user = ?",
                            [e.price * stockAutos[a].volume, stockAutos[a].user],
                            (err, result) =>{ 
                                if (err) {
                                    console.log(err)
                                } else {
                                    db.query(
                                        "UPDATE stock_autos SET status = ? WHERE id = ?",
                                        ["BAIGTA", stockAutos[a].id],
                                        (err, result) =>{ 
                                            if (err) {
                                                console.log(err)
                                            }
                                        }
                                    )
                                }
                            }
                        )
                        db.query(
                            "SELECT email FROM users WHERE id = ?",
                            [stockAutos[a].user],
                            (err, result) =>{
                                if (err) {
                                    console.log(err)
                                } else {
                                    sendEmail(e.symbol, result[0].email);
                                }
                            }
                        )

                    }
                } else {
                    if(stockAutos[a].price >= e.ask) {
                        db.query(
                            "UPDATE stock_holdings SET volume = (volume + ?) WHERE user = ? AND symbol = ?",
                            [stockAutos[a].volume, stockAutos[a].user, stockAutos[a].symbol],
                            (err, result) =>{ 
                                if (err) {
                                    console.log(err)
                                } else {
                                    db.query(
                                        "UPDATE stock_autos SET status = ? WHERE id = ?",
                                        ["BAIGTA", stockAutos[a].id],
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
                    db.query(
                            "SELECT email FROM users WHERE id = ?",
                            [stockAutos[a].user],
                            (err, result) =>{
                                if (err) {
                                    console.log(err)
                                } else {
                                    sendEmail(e.symbol, result[0].email);
                                }
                            }
                        )

                }
            }
        })
    }
  
    Axios.request(options).then(function (response) {
        cryptoData = response?.data?.data?.coins;
    }).catch(function (error) {
        console.error(error);
    });

    Axios.request(options2).then(function (response) {
        stockData = response?.data?.quotes
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
        }}
    );

    db.query(
        "SELECT id, symbol, price, volume, user, sell, status from stock_autos",
        (err, result) =>{
            if (err) {
                console.log(err)
            } else {
                cryptoAutos = result;
            }
        }
    )
  }, 60 * 10000);*/

  router.get('/generatecsv', (req, res) => {
    const email = req.query.email;
    const token = req.query.token;

    const decodedToken = jwt.decode(req.query.token)

    jwt.verify(token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else {

            db.query(
                "SELECT name, volume, price, sell, status FROM crypto_autos WHERE user = (SELECT id FROM users WHERE email = ?) UNION ALL SELECT symbol as name, volume, price, sell, status FROM stock_autos WHERE user = (SELECT id FROM users WHERE email = ?)",
                [decodedToken.user, decodedToken.user],
                (err, result) => {
                    if (err || result[0] == null) {
                        res.sendStatus(404);
                    } else {
                        let csv;

                        csv = "name,volume,price,sell,status" + '\r\n';
                        
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