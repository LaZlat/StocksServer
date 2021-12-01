const express = require('express');
const cors = require('cors')
const Axios = require('axios')

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
const sellRoutes = require('./routes/sell');
const authRoutes = require('./routes/auth');
const portRoutes = require('./routes/portfolio');
const autoRoutes = require('./routes/auto');
const settRoutes = require('./routes/sett');
const adminRoutes = require('./routes/admin');



app.use('/', signRoutes);
app.use('/buy', buyRoutes);
app.use('/sell', sellRoutes);
app.use('/auth', authRoutes);
app.use('/port', portRoutes);
app.use('/auto', autoRoutes);
app.use('/sett', settRoutes);
app.use('/admin', adminRoutes);

module.exports = app