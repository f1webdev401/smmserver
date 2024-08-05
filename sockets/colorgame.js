
// async function colorgameInterval(io,room) {
//     for(let i = 0 ; i < 10 ; i ++) {
//         await new Promise(res => setTimeout(res,200))
//         let randomnum = Math.floor(Math.random() * 6) + 1
//         io.to(room).emit('randomnumber',randomnum)
//     }
//     console.log("done color game")
// }
let colorGameIntervalStarted = false
module.exports = (io,socket) => {
    socket.on('join color game',(room) => {
        socket.join(room)
        console.log("joined to color game")
        if (!colorGameIntervalStarted) {
            colorGameIntervalStarted = true;
            colorgameInterval(io, room).catch(err => {
                console.error("Error in color game interval:", err);
                colorGameIntervalStarted = false;
            });
        }
        
    })

}
let lastNumber = 0;
async function colorgameInterval(io,room){
    while(true) {
        io.to(room).emit("start-color-game",1)
        for(let i = 0; i < 10 ; i++) {
            console.log(i)
            await new Promise(res => setTimeout(res , 500))
            let randomNum = Math.floor(Math.random() * 6) + 1
            if(lastNumber === randomNum) {
                i = i
                continue;
            }
            io.to(room).emit('random-number-color-game',randomNum)
            lastNumber = randomNum
            console.log(randomNum)
        }
        console.log(lastNumber)
        // await new Promise(res => setTimeout(res , 5000))
        io.to(room).emit('random-number-winner',lastNumber)
        io.to(room).emit("start-color-game",2)
        await new Promise(res => setTimeout(res , 10000))
        io.to(room).emit('random-number-winner',0)
    }
}

