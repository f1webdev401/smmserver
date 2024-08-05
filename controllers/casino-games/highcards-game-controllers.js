require('dotenv').config()
const jwt = require('jsonwebtoken')
const User = require('../../models/user-models')
const HighCardsStatus = require('../../models/casino-games/highcards/highcards-status-model')
const HighCardsBet = require('../../util/highcards/HighCardsClass')
const io = require('../../util/socket-server/socket-server')
// const getAllBetInCard1 = async () => {
//     let allBetsInCard1 = await HighCardsBet.find({choosen_card: "1"},'-choosen_card -__v -_id -user')
//     let allbetsInCard1Total = allBetsInCard1.reduce((sum, bet) => sum + bet.amount, 0)
//     return allbetsInCard1Total
// }
// const getAllBetInCard2 = async () => {
//     let allBetsInCard2 = await HighCardsBet.find({choosen_card: "2"},'-choosen_card -__v -_id -user')
//     let allbetsInCard2Total = allBetsInCard2.reduce((sum, bet) => sum + bet.amount, 0)
//     return allbetsInCard2Total
// }

// Get HighCardsStatus from database 
//return {game_name,status,is_closed,winner}
// const getHighCardsStatus = async () => {
//     let highcards_status  = await HighCardsStatus.findOne({_id:"66a47b45de16c5d471864b93"})
//     return highcards_status
// }
let highCardsBets = new HighCardsBet()

const placeBet = async (req,res) => {
    const token = req.cookies.token
    const {amount,choosen_card,action} = req.body
    if(!token) {
        return res.status(500).json({status:false,message: "Something went wrong"})
    }

    jwt.verify(token,process.env.TOKEN_KEY,async(err,data) => {
        if(err) {
            return res.status(500).json({status:false,message:"Something went wrong line 35"})
        }
        else {
            const user = await User.findById(data.id, '-cashins -withrawals').lean()
            if(user) {
                

                (async() => {
                    try {
                        // test
                    if(action === 'test_return_credits') {
                        await highCardsBets.return_player_bet(user._id)
                        await highCardsBets.resetAllBet()
                        return res.status(200).json({success:true,message: `Return ${user.credits} credits`})
                    }
                // test
                        if(!amount || !choosen_card) {
                            return res.status(400).json({status:false,message:"Error input amount or error choosen card"})
                        }
                        if(parseFloat(amount) > parseFloat(user.credits)) {
                            return res.status(400).json({status:false,message: "Not enough  Credits"})
                        }else {
                            let get_high_cards_stats_ = await highCardsBets.getHighCardsStatus()
                            console.log(get_high_cards_stats_)
                            if(get_high_cards_stats_.is_closed) {
                                return res.status(400).json({status:false, message: "Game closed"})
                            }
                            await highCardsBets.placeBetOn(choosen_card,user._id,amount)
                            const CardBet = await highCardsBets.getAllBetInCard(choosen_card)

                            const player_bet_card1 = await highCardsBets.get_player_bet_card1(user._id)
                            const player_bet_card2 = await highCardsBets.get_player_bet_card2(user._id)

                            const card1AllBet = await highCardsBets.getTotalBetOfCard1() 
                            const card2AllBet = await highCardsBets.getTotalBetOfCard2() 
                            if(choosen_card === "1") {
                                const betsInCard1 = await highCardsBets.getTotalBetOfCard1();
                                console.log(player_bet_card1)
                                io.emit('all bet in card 1',betsInCard1)
                            }
                            if(choosen_card === "2") {
                                const betsInCard2 = await highCardsBets.getTotalBetOfCard2()
                                console.log(player_bet_card2)
                                io.emit('all bet in card 2',betsInCard2)
                            }
                            return res.status(200).json({status:true,message:"Successfully submitted bet",card_bet: CardBet,all_card_bet:[card1AllBet,card2AllBet],player_bet:[player_bet_card1,player_bet_card2]})
                        }
        
                    }catch(e) {
                        console.log(e)
                        return res.status(500).json({status:false,message: "Internal Server error on highcards-game-controllers"})
                    }
                })();
               
            }else {
                return res.status(500).json({status:false,message: "Something went wrong"})
            }
        }
    })
    
}



module.exports = {placeBet}