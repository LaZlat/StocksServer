const express = require('express');
const cors = require('cors')

const app = express();

app.use(
    cors({
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    })
  );

app.use(express.urlencoded({extended: true}));
app.use(express.json());

const signRoutes = require('./routes/sign');
const buyRoutes = require('./routes/buy');
const authRoutes = require('./routes/auth');
const portRoutes = require('./routes/portfolio');

app.use('/', signRoutes);
app.use('/buy', buyRoutes);
app.use('/auth', authRoutes);
app.use('/port', portRoutes);

module.exports = app