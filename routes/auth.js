const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");


router.get('/', (req, res) => {
    jwt.verify(req.query.token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else if (payload != null) {
            if (payload.user == req.query.email) {
                res.sendStatus(200);
            } else {
            res.sendStatus(404);
            }
        } else {
            res.sendStatus(404);
        }
    });
});


router.get('/admin', (req, res) => {
    jwt.verify(req.query.token, "SECRET", function (err, payload) {
        if (err) {
            res.sendStatus(404);
        } else if (payload != null) {
            if ('admin@admin.com' == req.query.email) {
                res.sendStatus(200);
            } else {
            res.sendStatus(404);
            }
        } else {
            res.sendStatus(404);
        }
    });
});

module.exports = router;
