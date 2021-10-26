const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'em2'
});

db.connect((err) => {
    if (err) {
        throw(err)
    }
    console.log('Mysql connected.')
})

module.exports = db;