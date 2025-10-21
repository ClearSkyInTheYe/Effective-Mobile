const express = require('express');
const env = require('dotenv').config().parsed;
const morgan = require('morgan');


const app = express();
const routes = require('./routes.js');

if (env.STAGE !== 'production') {
  app.use(morgan('dev'));         
} else {
  app.use(morgan('combined'));  
}

app.use(express.json());
app.use(routes);
app.listen(env.PORT);