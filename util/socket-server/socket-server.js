const {Server} = require('socket.io')

let io;

function initSocketServer(httpServer) {
    io = new Server(httpServer,{
        cors: {
            origin: ['http://localhost:3000', 'https://smmplay.online', 'http://localhost:3008'],
            credentials: true
        }
    })
    return io
}

function getSocketServer() {
    if(!io) {
        throw new Error('Socket io not initialize error line 17')
    }

    return io
}

module.exports = {initSocketServer,getSocketServer}