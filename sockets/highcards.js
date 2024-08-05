const db = require('../database/database')
const HighCardsStatus = require('../models/casino-games/highcards/highcards-status-model')
const HighCardsBet = require('../util/highcards/HighCardsClass')

let highcardsBet = new HighCardsBet()
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
function combinedAllBets() {
let joinedAllBet = [...hl_allbet_card1 , ...hl_allbet_card2]
let hash  = {}
for(let i = 0 ; i < joinedAllBet.length ; i ++) {
    let user = joinedAllBet[i]
    if(hash[user.id]) {
        hash[user.id].betAmount += user.betAmount
        hash[user.id].card = user.card;
    }else {
        hash[user.id] = {...user}
    }
}
let combinedBets = Object.values(hash);
return combinedBets
}
function getCard() {
let cardNum = Math.floor(Math.random() * hl_cards.length)
return hl_cards[cardNum]
}
function getCardIdentifier() {
let card_i_num = Math.floor(Math.random() * card_identifier.length)
return card_identifier[card_i_num]
}

async function UpdateHighcardsStatus(key,value) {
    try {

        await HighCardsStatus.updateOne({_id:"66a47b45de16c5d471864b93"},
            {$set: {[key]: value}},
        )
    }catch(e) {
        console.log(e)
    }
}
 function startIntervals(io) { 
intervalId = setInterval(() => {
    // console.log('Interval running, count:', intervalCount);
    // Perform your interval task here
    console.log(intervalCount)
    io.emit("hl-starts-in",intervalCount)
    intervalCount--;
    if (intervalCount < 0) {
            
        UpdateHighcardsStatus('is_closed',true)
        hl_game_stat = "Close"
        console.log('close')
        clearInterval(intervalId);
        // console.log('Interval cleared. Restarting...');
        sendCard(io) 
        intervalCount = 20
        // Start the intervals again after a short delay
        setTimeout(() => startIntervals(io), 15000);  // Adjust delay as needed
    }
}, 1000);  // Adjust interval time as needed
}

// Start the first round of intervals
 function sendCard(io){
setTimeout( () => {
    (async () => {
        try {
            resCard1 = highcardsBet.generate_number()
            resCard2 = highcardsBet.generate_number()
            console.log(resCard1)
            console.log(resCard2)
        // resCard1 = hl_cards[0]
        //     resCard2 =hl_cards[0]
            resCard1Identifier = highcardsBet.get_card_identifier()
            resCard2Identifier = highcardsBet.get_card_identifier()
            console.log('card 1 identifier',resCard1Identifier)
            console.log('card 2 identifier',resCard2Identifier)
            if(hl_allbet_card1.length <= 0 || hl_allbet_card2.length <= 0) {
                UpdateHighcardsStatus('status','cancel')
                await highcardsBet.resetAllBet()
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
        }catch(e) {
            console.log(e)
        }
    })();
   
},5000)
setTimeout(() => {
    if(hl_allbet_card1.length <= 0 || hl_allbet_card2.length <= 0) {
        io.emit('hl-winner-result',3)
        if(hl_allbet_card1.length <= 0 && hl_allbet_card2.length !== 0) {
            for(let i = 0 ; i < hl_allbet_card2.length ; i ++) {
                InputDrawFunc(hl_allbet_card2[i].id,hl_allbet_card2[i].betAmount) 
            }
        }
        if(hl_allbet_card2.length <= 0 && hl_allbet_card1.length !== 0) {
            for(let i = 0 ; i < hl_allbet_card1.length ; i ++) {
                InputDrawFunc(hl_allbet_card1[i].id,hl_allbet_card1[i].betAmount) 
            }
        }
        console.log("cancel")
        return;
    }
    if(resCard1[0] === resCard2[0]) {
        winner = 4
        io.emit('hl-winner-result',4)
        UpdateHighcardsStatus('winner','draw')

        console.log(combinedAllBets(),'asda123')
        for(let i = 0 ; i < combinedAllBets().length ; i ++) {
            InputDrawFunc(combinedAllBets()[i].id,combinedAllBets()[i].betAmount) 
        }
    }
    else if(resCard1[0] > resCard2[0]) {
        winner = 1
        io.emit('hl-winner-result',1)
        UpdateHighcardsStatus('winner','card1')
        if(hl_allbet_card1.length === 0) {
            return;
        }
        setTimeout(() => {
            for(let i = 0 ; i < hl_allbet_card1.length; i ++) {
                let payoutTotal = parseFloat(((betpayout()[0] * hl_allbet_card1[i].betAmount) * .90) + hl_allbet_card1[i].betAmount)
                InputBetWinFunc(hl_allbet_card1[i].id,payoutTotal)
                io.to(hl_allbet_card1[i].socketId).emit("payout-res",{p_detail:(((betpayout()[0] * hl_allbet_card1[i].betAmount) * .90) + hl_allbet_card1[i].betAmount).toFixed(2),p_status:"Win"})

            }
        },2000)
      
    }else {
        winner = 2
        io.emit('hl-winner-result',2)
        UpdateHighcardsStatus('winner','card2')
        if(hl_allbet_card2.length === 0) {
            return;
        }
        setTimeout(() => {
            for(let i = 0 ; i < hl_allbet_card2.length; i ++) {
                let payoutTotal = parseFloat((((betpayout()[1] * hl_allbet_card2[i].betAmount) * .90) + hl_allbet_card2[i].betAmount))
                InputBetWinFunc(hl_allbet_card2[i].id,payoutTotal)
                io.to(hl_allbet_card2[i].socketId).emit("payout-res",{p_detail:(((betpayout()[1] * hl_allbet_card2[i].betAmount) * .90) + hl_allbet_card2[i].betAmount).toFixed(2),p_status: "Win"})
            }
        },2000)
      
    }
},7000)
setTimeout(() => {
    hlGameFinish(io)
    console.log('open')
    hl_game_stat = "Open"
    UpdateHighcardsStatus('is_closed',false)
},15000)
}


function hlGameFinish(io) {
hl_allbet_card1 = []
hl_allbet_card2 = []
winner = 3;
resCard1 = 0
resCard2 = 0
resCard1Identifier = ""
resCard2Identifier = ""
UpdateHighcardsStatus('winner','none')

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

function InputBetFunc(user) {
    db.ref(`users/${user.id}`).once('value')
    .then((res) => {
        let userSnapshot = res.val()
        if(parseFloat(userSnapshot.credits) < parseFloat(user.betAmount)) {
            console.log("usercredits not enough")
            return false;
        }
        db.ref(`users/${user.id}`).update({
            credits: parseFloat(userSnapshot.credits) -  parseFloat(user.betAmount)
         })
         .then((res) => {
            console.log("success")
         })
         .catch((err) => {
         })
    }).catch((err) => {
        console.log("error")
    })
    return true
}
function InputBetWinFunc(id,totalwin) {
     db.ref(`users/${id}`).once('value')
     .then((res) => {
         let userSnapshot = res.val()
         db.ref(`users/${id}`).update({
            credits: parseFloat(userSnapshot.credits) +  totalwin
         })
         .then((res) => {
            console.log("success")
            return true;
         })
         .catch((err) => {
            return false
         })
     }).catch((err) => {
         console.log("error")
         return false
     })

}

function InputDrawFunc(id,currentBet) {
db.ref(`users/${id}`).once('value')
     .then((res) => {
         let userSnapshot = res.val()
         db.ref(`users/${id}`).update({
            credits: parseFloat(userSnapshot.credits) +  currentBet
         })
         .then((res) => {
            console.log("success")
            return true;
         })
         .catch((err) => {
            return false
         })
     }).catch((err) => {
         console.log("error")
         return false
     })
}

const highcardsgame = (io,socket) => {
   
socket.on('join-game',(socketid) => {
    socket.join(socketid)
})
socket.on('hl-place-bet',(betdata) => {
    if(hl_game_stat === "Close") {
        console.log("Game Close")
        io.to(betdata.socketId).emit("hl-close-game",true)
        return;
    }else {
        io.to(betdata.socketId).emit("hl-close-game",false)
        if(betdata.betAmount === "") {
            return;
        }
        if(parseFloat(betdata.betAmount) < 10) {
            return;
        }
        console.log(betdata.socketId)
        console.log(betdata)
        if(!InputBetFunc(betdata)) {
            console.log("errrrrrrrrrrrr")
            return;
        }
        InputBetFunc(betdata)
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
    if(hl_game_stat === "Close") {
        if(betdata) {
            io.to(betdata.socketId).emit("hl-close-game","Game Close")
        }
    }
    io.emit('hl-winner-result',winner)
    io.emit('hl-bet-card-percentage',SumofAllbet()[0],SumofAllbet()[1],op_payout_card1().toFixed(2),op_payout_card2().toFixed(2))
    betpayoutPercent()
})
}

module.exports = {highcardsgame,startIntervals}
