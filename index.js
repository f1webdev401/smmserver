require('dotenv').config();
const { createServer } = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;

const { initSocketServer, getSocketServer } = require('./util/socket-server/socket-server');
const StartGameCounter = require('./sockets/highcards-game-socket')
const allowedOrigins = ['http://localhost:3000', 'https://smmplay.online', 'http://localhost:3008',"http://192.168.1.237:3000"];

if (cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker process ${worker.process.pid} died. Restarting`);
        cluster.fork();
    });
} else {
    const app = express();
    const httpServer = createServer(app);
    const io = initSocketServer(httpServer);

    app.use(cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/api/users', require('./routes/user-routes'));
    app.use('/api/users-agent', require('./routes/user-agent-routes'));
    app.use('/api/casino/highcards', require('./routes/casino-games/highcards-routes'));
    app.use('/api/livestream',require('./routes/livestream/livestream-token'))
    // 'socket routes'
    const colorgame = require('./sockets/colorgame');
    const { highcardsgame, startIntervals } = require('./sockets/highcards');

    mongoose.connect("mongodb+srv://f1webdev401:q0OZuqXwVrLuXuAD@casino.bebszo9.mongodb.net/?retryWrites=true&w=majority&appName=casino", {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
        console.log('connected to the database');
        httpServer.listen(5050, () => {
            console.log(`Worker process ${process.pid} is listening on port 5050`);
        });
        // StartGameCounter(io);
        // startIntervals(io);
        // io.on('connection', (socket) => {
        //     colorgame(io, socket);
        //     highcardsgame(io, socket);
        // });
    })
    .catch((err) => {
        console.log("error database", err);
    });
}
