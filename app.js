const express = require('express');
const cors = require('cors')

const app = express();

app.use(cors())
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const signRoutes = require('./routes/sign');

app.use('/', signRoutes);

module.exports = app