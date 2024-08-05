const HighCardsBet = require('../util/highcards/HighCardsClass')
const HighCardsStatus = require('../models/casino-games/highcards/highcards-status-model')
const highcardsBet = new HighCardsBet()


async function UpdateHighcardsStatus(key,value) {
    try {
        await HighCardsStatus.updateOne({_id:"66a47b45de16c5d471864b93"},
            {$set: {[key]: value}},
        )
    }catch(e) {
        console.log(e,'Error in Highcards Game Socket Line 10')

    }
}

function StartGameCounter(io) {
    UpdateHighcardsStatus('is_closed',false)
    let count = 30
    const a = setInterval(() => {
        console.log(count)
        io.to('highcards').emit('game counter',count)
        count -= 1
        if(count < 0) {
            clearInterval(a)
            FinishGameCounter()
        }
    },1000)
}

function FinishGameCounter() {
    let card1_number = highcardsBet.generate_number()
    let card2_number = highcardsBet.generate_number()

    UpdateHighcardsStatus('is_closed',true)
    if(highcardsBet.getTotalBetOfCard1() === 0 || highcardsBet.getTotalBetOfCard2() === 0) {
        UpdateHighcardsStatus('status','cancel')
        RestartGameCounter(5000)
        return;
    }
    
    if(card1_number[0] > card2_number[0]) {
        GameWinner(1)
        return;
    }

    if(card1_number[0] > card2_number[0]) {
        GameWinner(2)
        return;
    }
}


function GameWinner(card) {
    if(card === 1) {
        io.to('highcards').emit('highcards winner',1)

    }else {
        io.to('highcards').emit('highcards winner',2)
    }
}

function RestartGameCounter(time) {
    const timeout_interval = setTimeout(() => {
        highcardsBet.resetAllBet()
        StartGameCounter()
        clearTimeout(timeout_interval)
    },time)
}

module.exports = StartGameCounter
