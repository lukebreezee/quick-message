const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();

const cors = require('cors');
const http = require('http');
const {Server} = require('socket.io');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
  cors(/*{
    origin: [process.env.CLIENT_ORIGIN],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }*/)
);

require('./routes/auth.js')(app);
require('./routes/messaging.js')(app);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:19002',
    methods: ['GET', 'POST'],
  },
});

require('./realTimeEvents.js')(io);

const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`Listening on port ${port}`));
