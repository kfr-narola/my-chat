var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv');  
var cors = require('cors');
var RedisClient = require('./services/redis');
const RedisStore = require("connect-redis").default;
var session = require('express-session');
require('./services/socket');

// Set up Global configuration access
dotenv.config();

var corsOptions = {
  origin: process.env.FRONT_SERVER,
  credentials: true,
  methods: ['GET','POST','HEAD','PUT','PATCH','DELETE'],
}
var app = express();

var socket = {}

app.use(logger('dev'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('*', cors(corsOptions))

app.use(cookieParser());

let redisStore = new RedisStore({
  client: RedisClient,
  prefix: "myapi:",
})

const sessionMiddleware = session({
  store: redisStore,
  resave: true, // required: force lightweight session keep alive (touch)
  saveUninitialized: true, // recommended: only save session when data exists
  secret: process.env.SESSION_SECRET_KEY,
})

app.use(sessionMiddleware)

var nonUsersRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const AuthUser = require('./middleware/AuthUser');

app.use('/api/v1', nonUsersRouter);
app.use('/api/v1', AuthUser ,usersRouter);

module.exports = { app, sessionMiddleware };
