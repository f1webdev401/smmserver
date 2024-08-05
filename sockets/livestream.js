module.exports = (io,socket) => {
    socket.on("joinroom",(room) => {
        socket.join(room)
    })
    socket.on("send message",(message) => {
        io.to(message.room).emit('message',message)
    })
    socket.on("disconnecting",() => {
        console.log("disconnecting")
    })
}