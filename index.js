require('dotenv').config();
const {createServer} = require('http')
const {Server} = require('socket.io')
const admin = require('firebase-admin')
const express = require('express')
const cors = require('cors')
const allowedOrigins = ['http://localhost:3000', 'https://smmplay.online'];
const app = express()
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
const serviceAccount = {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://casino-208b6-default-rtdb.asia-southeast1.firebasedatabase.app"
})

const db = admin.database()
const httpServer = createServer(app)


const io = new Server(httpServer,{
    cors : {
        origin: ['http://localhost:3000','https://smmplay.online'],
        methods: ["GET","POST"]
    }
})
//q0OZuqXwVrLuXuAD = mongoDb Pass
// connection string = mongodb+srv://f1webdev401:q0OZuqXwVrLuXuAD@casino.bebszo9.mongodb.net/?retryWrites=true&w=majority&appName=casino
let intervalCount = 20;
let intervalId;
let hl_cards = [[1,'one'],[2,'two'],[3,'three'],[4,'four'],[5,'five'],[6,'six'],[7,'seven'],[8,'eight'],[9,'nine'],[10,'ten'],[11,'card-jqk'],[12,'card-jqk'],[13,'card-jqk']]
let resCard1 = 0;
let resCard2 = 0;
let resCard1Identifier;
let resCard2Identifier;
let hl_allbet_card1 = []
let hl_allbet_card2 = []
let winner = 3;
let card_identifier = [{suits:"♠️",color:"black"},{suits:"♣️",color: 'black'},{suits:"❤️",color:'red'},{suits:"♦️",color:'red'}]
let hl_game_stat = "Open";
function getCard() {
    let cardNum = Math.floor(Math.random() * hl_cards.length)
    return hl_cards[cardNum]
}
function getCardIdentifier() {
    let card_i_num = Math.floor(Math.random() * card_identifier.length)
    return card_identifier[card_i_num]
}
function startIntervals() { 
    intervalId = setInterval(() => {
        // console.log('Interval running, count:', intervalCount);
        // Perform your interval task here
        io.emit("hl-starts-in",intervalCount)
        intervalCount--;
        if (intervalCount < 0) {
            hl_game_stat = "Close"
            clearInterval(intervalId);
            // console.log('Interval cleared. Restarting...');
            sendCard() 
            intervalCount = 20
            // Start the intervals again after a short delay
            setTimeout(startIntervals, 15000);  // Adjust delay as needed
        }
    }, 1000);  // Adjust interval time as needed
}

// Start the first round of intervals
startIntervals();
function sendCard() {
    setTimeout(() => {
        resCard1 = getCard()
        resCard2 = getCard()
        resCard1Identifier = getCardIdentifier()
        resCard2Identifier = getCardIdentifier()
        if(hl_allbet_card1.length <= 0 || hl_allbet_card2.length <= 0) {
            io.emit('hl-result-stats',"cancel")
            return;
        }
        io.emit('hl-result-card',{
            card:resCard1,
            identifier:resCard1Identifier
        },{
            card:resCard2,
            identifier:resCard2Identifier
        })
    },5000)
    setTimeout(() => {
        if(hl_allbet_card1.length <= 0 || hl_allbet_card2.length <= 0) {
            io.emit('hl-winner-result',3)
            return;
        }
        if(resCard1[0] === resCard2[0]) {
            winner = 4
            io.emit('hl-winner-result',4)
        }
        else if(resCard1[0] > resCard2[0]) {
            winner = 1
            io.emit('hl-winner-result',1)
            if(hl_allbet_card1.length === 0) {
                return;
            }
            setTimeout(() => {
                for(let i = 0 ; i < hl_allbet_card1.length; i ++) {
                    io.to(hl_allbet_card1[i].socketId).emit("payout-res",{p_detail:(((betpayout()[0] * hl_allbet_card1[i].betAmount) * .90) + hl_allbet_card1[i].betAmount).toFixed(2),p_status:"Win"})
                }
            },2000)
          
        }else {
            winner = 2
            io.emit('hl-winner-result',2)
            if(hl_allbet_card2.length === 0) {
                return;
            }
            setTimeout(() => {
                for(let i = 0 ; i < hl_allbet_card2.length; i ++) {
                    io.to(hl_allbet_card2[i].socketId).emit("payout-res",{p_detail:(((betpayout()[1] * hl_allbet_card2[i].betAmount) * .90) + hl_allbet_card2[i].betAmount).toFixed(2),p_status: "Win"})
                }
            },2000)
          
        }
    },7000)
    setTimeout(() => {
        hlGameFinish()
        hl_game_stat = "Open"
    },15000)
}
function hlGameFinish() {
    hl_allbet_card1 = []
    hl_allbet_card2 = []
    winner = 3;
    resCard1 = 0
    resCard2 = 0
    resCard1Identifier = ""
    resCard2Identifier = ""
    io.emit('hl-bet-card-percentage',0,0,100,100)
    io.emit('hl-result-card',0,0)
    io.emit('hl-winner-result',3)
    io.emit("payoutval1",0)
    io.emit("payoutval2",0)
}
function pushBetData(betdata) {
    if(betdata.card === 'card1') {
        for(let i = 0 ; i < hl_allbet_card1.length; i ++)  {
            if(hl_allbet_card1[i].id === betdata.id) {
                hl_allbet_card1[i].betAmount = parseFloat(hl_allbet_card1[i].betAmount) + parseFloat(betdata.betAmount);
                hl_allbet_card1[i].betAmount = parseFloat(hl_allbet_card1[i].betAmount.toFixed(2));
                return
            }
        }
        hl_allbet_card1.push(betdata)
    }else {
        for(let i = 0 ; i < hl_allbet_card2.length; i ++)  {
            if(hl_allbet_card2[i].id === betdata.id) {
                hl_allbet_card2[i].betAmount = parseFloat(hl_allbet_card2[i].betAmount) + parseFloat(betdata.betAmount);
                hl_allbet_card2[i].betAmount = parseFloat(hl_allbet_card2[i].betAmount.toFixed(2));
                return
            }
        }
        hl_allbet_card2.push(betdata)
    }
}

function SumofAllbet() {
    let hl_overall_sum_bet1 = hl_allbet_card1.reduce((acc,curr) => {
        return acc + curr.betAmount
    },0)
    let hl_overall_sum_bet2 = hl_allbet_card2.reduce((acc,curr) => {
        return acc + curr.betAmount
    },0)
    return [hl_overall_sum_bet1,hl_overall_sum_bet2]
}
let op_payout_card1 = function(){
    if(SumofAllbet()[1] === 0) {
        return 190;
    }
    else if (SumofAllbet()[1]  !== 0 && SumofAllbet()[0] === 0) {
        return SumofAllbet()[1]  * 100
    }
    else {
        return (((SumofAllbet()[1]  / SumofAllbet()[0]) * .90) * 100) + 100
    }
}
let op_payout_card2 = function(){
    if(SumofAllbet()[0] === 0) {
        return 190;
    } 
    else if(SumofAllbet()[0] !== 0 && SumofAllbet()[1]  === 0 ) {
        return SumofAllbet()[0]  * 100
    }
    else {
        return (((SumofAllbet()[0]  / SumofAllbet()[1] ) * .90) * 100) + 100// plus bet
    }
}
function betpayoutPercent() {
    if(hl_allbet_card1.length !== 0) {
        for(let i = 0 ; i < hl_allbet_card1.length ; i ++) {
            if(hl_allbet_card2.length === 0) {
                io.to(hl_allbet_card1[i].socketId).emit("payoutval1",hl_allbet_card1[i].betAmount * .90)
                return
            }
            io.to(hl_allbet_card1[i].socketId).emit("payoutval1",(((betpayout()[0] * hl_allbet_card1[i].betAmount) * .90) + hl_allbet_card1[i].betAmount).toFixed(2))
        }
    }
    if(hl_allbet_card2.length !== 0) {
        
        for(let i = 0 ; i < hl_allbet_card2.length ; i ++) {
            if(hl_allbet_card1.length === 0) {
                io.to(hl_allbet_card2[i].socketId).emit("payoutval2",hl_allbet_card2[i].betAmount * .90)
                return
            }
            io.to(hl_allbet_card2[i].socketId).emit("payoutval2",(((betpayout()[1] * hl_allbet_card2[i].betAmount) * .90) + hl_allbet_card2[i].betAmount).toFixed(2))
        }
    }
}
function betpayout() {
    let payoutratio1 = SumofAllbet()[1].toFixed(2) / SumofAllbet()[0].toFixed(2)
    let payoutratio2 = SumofAllbet()[0].toFixed(2) / SumofAllbet()[1].toFixed(2)
    return [payoutratio1,payoutratio2]
}
io.on('connection',(socket) => {
    console.log(socket.id)
    socket.on('join-game',(socketid) => {
        socket.join(socketid)
    })
    socket.on('hl-place-bet',(betdata) => {
        if(hl_game_stat === "Close") {
            console.log("Game Close")
            return;
        }else {
            let newBetdata = {...betdata}
            newBetdata.betAmount = parseFloat(newBetdata.betAmount)
            pushBetData(newBetdata)
            console.log(hl_allbet_card2)
            console.log(hl_allbet_card1)
            io.emit('hl-bet-card-percentage',SumofAllbet()[0],SumofAllbet()[1],op_payout_card1().toFixed(2),op_payout_card2().toFixed(2))
            betpayoutPercent()
        }
        
    })
    socket.on('join-hl-game',() => {
        io.emit('hl-winner-result',winner)
        io.emit('hl-bet-card-percentage',SumofAllbet()[0],SumofAllbet()[1],op_payout_card1().toFixed(2),op_payout_card2().toFixed(2))
        betpayoutPercent()
    })
})
httpServer.listen(5050 , () => {
    console.log("workign")
})