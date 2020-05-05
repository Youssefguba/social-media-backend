const express = require('express');
const app = express();
const http = require('http').createServer(app);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport')
const morgan = require('morgan');


require('dotenv/config');
require('./startup/prod')(app);
// Passport Config
require('./config/passport')(passport); // pass passport for configuration
// Passport init (must be after establishing the session above)
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// Routes
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const indexRouter = require('./routes/index');
const auth = require('./routes/auth');

mongoose.connect(require('./config/app').db.connectionUri, {useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true})
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// CONNECTION EVENTS
mongoose.connection.once('connected', function() {
    console.log("Database connected to")
})
mongoose.connection.on('error', function(err) {
    console.log("MongoDB connection error: " + err)
})
mongoose.connection.once('disconnected', function() {
    console.log("Database disconnected")
})


app.use(session({
    name: 'sessionId',
    secret: "mysecretkeythatiwillnottellyou",
    saveUninitialized: false, // don't create sessions for not logged in users
    resave: false, //don't save session if unmodified

    // Where to store session data
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl:  6 // = 1 day. ttl means "time to live" (expiration in seconds)
    }),
    // cookies settings
    cookie: {
        secure: false,
        httpOnly: false, // if true, will disallow JavaScript from reading cookie data
        expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour;
    }
}))


app.use(function (req, res, next) {
    res.locals.currentUser = req.user
    next()
})

app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan('dev'));

app.use('/auth', auth);
app.use('/users',  userRouter);
app.use('/posts', postRouter);
app.use("/", indexRouter);
app.use(express.static('/public/images'));

/*
* Handle Favicon Error..
* */
function ignoreFavicon(req, res, next) {
    if (req.originalUrl === '/favicon.ico') {
        res.status(204).json({nope: true});
    } else {
        next();
    }
}
app.use(ignoreFavicon);

const port = process.env.PORT || 8000;

app.listen(port, ()=> {console.log("Hello from our Listener")});
