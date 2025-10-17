const express = require('express');
const env = require('dotenv').config().parsed;


const app = express();
const routes = require('./routes.js');

app.use(express.json());
app.use(routes);
app.listen(env.PORT);