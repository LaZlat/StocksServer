const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'em'
});

db.connect((err) => {
    if (err) {
        throw(err)
    }
    console.log('Mysql connected.')
    db.query("CREATE DATABASE IF NOT EXISTS em", function (err, result) {
        if (err) {
            throw err;
        } else {
            console.log("DB created")
            db.query("CREATE TABLE IF NOT EXISTS users (id INT(11) PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP())", function(e, r) {
                if (e) {
                    throw e;
                } else {
                    console.log("Table created");
                }
            })
            console.log("DB created")
            db.query("CREATE TABLE IF NOT EXISTS stock_holdings (id INT(11) PRIMARY KEY AUTO_INCREMENT, symbol VARCHAR(4) NOT NULL, volume INT(11) NOT NULL, user INT(11), FOREIGN KEY (user) REFERENCES users(id))", function(e, r) {
                if (e) {
                    throw e;
                } else {
                    console.log("Tables created");
                }
            })
            db.query("CREATE TABLE IF NOT EXISTS crypto_holdings (id INT(11) PRIMARY KEY AUTO_INCREMENT, cid INT(11) NOT NULL, volume INT(11) NOT NULL, user INT(11), FOREIGN KEY (user) REFERENCES users(id), name VARCHAR(255) NOT NULL)", function(e, r) {
                if (e) {
                    throw e;
                } else {
                    console.log("Tables created");
                }
            })
            db.query("CREATE TABLE IF NOT EXISTS stock_autos (id INT(11) PRIMARY KEY AUTO_INCREMENT, symbol VARCHAR(4) NOT NULL, volume INT(11) NOT NULL, price INT(11) NOT NULL, user int(11), FOREIGN KEY (user) REFERENCES users(id), sell TINYINT(1) NOT NULL, status VARCHAR(255) NOT NULL)", function(e, r) {
                if (e) {
                    throw e;
                } else {
                    console.log("Tables created");
                }
            })
            db.query("CREATE TABLE IF NOT EXISTS crypto_autos (id INT(11) PRIMARY KEY AUTO_INCREMENT, cid INT(11) NOT NULL, volume INT(11) NOT NULL, price INT(11) NOT NULL, user int(11), FOREIGN KEY (user) REFERENCES users(id), sell TINYINT(1) NOT NULL, status VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL)", function(e, r) {
                if (e) {
                    throw e;
                } else {
                    console.log("Tables created");
                }
            })
            db.query("CREATE TABLE IF NOT EXISTS cash (id INT(11) PRIMARY KEY AUTO_INCREMENT, currecny VARCHAR(32), amount INT(11) NOT NULL, user INT(11), FOREIGN KEY (user) REFERENCES users(id), sell TINYINT(1) NOT NULL)", function(e, r) {
                if (e) {
                    throw e;
                } else {
                    console.log("Tables created");
                }
            })
        }
    })
})

module.exports = db;