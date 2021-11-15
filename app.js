const express = require('express');
const cors = require('cors')
const cookieparser = require('cookie-parser');
const session = require('express-session');

const app = express();

app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    })
  );
app.use(cookieparser())
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(session({
    key: "user",
    secret: "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24
    }
}))

const signRoutes = require('./routes/sign');
const buyRoutes = require('./routes/buy');

app.use('/', signRoutes);
app.use('/buy', buyRoutes);


module.exports = app