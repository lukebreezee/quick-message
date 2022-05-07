const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db.js');

dotenv.config();

const app = express();
exports.app = app;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
  cors({
    origin: [process.env.CLIENT_ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);

require('./routes/auth.js');
require('./routes/messaging.js');

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
