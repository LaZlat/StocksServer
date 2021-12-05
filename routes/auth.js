const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");


router.get('/', (req, res) => {
    jwt.verify(req.query.token, "SECRET", function (err, payload) {
        if (err) {
            res.status(404).send('Not Found')
        } else if (payload != null) {
            if (payload.user == req.query.email) {
                res.status(200).send('OK');
            } else {
                res.status(404).send('Not Found')
            }
        } else {
            res.status(404).send('Not Found')
        }
    });
});


router.get('/admin', (req, res) => {
    jwt.verify(req.query.token, "SECRET", function (err, payload) {
        if (err) {
            res.status(404).send('Not Found')
        } else if (payload != null) {
            const token = jwt.decode(req.query.token)
            if ('admin@admin.com' == token.user) {
                res.status(200).send('OK');
            } else {
                res.status(404).send('Not Found')
            }
        } else {
            res.status(404).send('Not Found')
        }
    });
});

module.exports = router;
