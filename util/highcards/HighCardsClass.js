const HighCardsStatus = require('../../models/casino-games/highcards/highcards-status-model')
const HighCardsBetCollection = require('../../models/casino-games/highcards/highcards-bet-models')
const User = require('../../models/user-models')
class HighCardsBet {
    constructor() {
       this.hl_cards = [[1,'one'],[2,'two'],[3,'three'],[4,'four'],[5,'five'],[6,'six'],[7,'seven'],[8,'eight'],[9,'nine'],[10,'ten'],[11,'card-jqk'],[12,'card-jqk'],[13,'card-jqk']]
       this.card_identifier = [{suits:"♠️",color:"black"},{suits:"♣️",color: 'black'},{suits:"❤️",color:'red'},{suits:"♦️",color:'red'}]
    }
    async getTotalBetOfCard1() {
        let allBetsInCard1 = await HighCardsBetCollection.find({choosen_card: "1"},'-choosen_card -__v -_id -user')
        if(allBetsInCard1) {
            let allbetsInCard1Total = allBetsInCard1.reduce((sum, bet) => sum + bet.amount, 0)
            return allbetsInCard1Total
        }
        return 0
        
    }
    async getTotalBetOfCard2() {
        let allBetsInCard2 = await HighCardsBetCollection.find({choosen_card: "2"},'-choosen_card -__v -_id -user')
        if(allBetsInCard2) {
            let allbetsInCard2Total = allBetsInCard2.reduce((sum, bet) => sum + bet.amount, 0)
            return allbetsInCard2Total
        }
        return 0
       
    }
    async getAllBetInCard(choosen_card) {
        let allBetInCard = await HighCardsBetCollection.find({choosen_card: choosen_card})
        if(allBetInCard) {
            return allBetInCard
        }
        return 0
    }
    async getHighCardsStatus() {
        let highcards_status  = await HighCardsStatus.findOne({_id:"66a47b45de16c5d471864b93"})
        return highcards_status
    }

    async placeBetOn(choosen_card,user_id,amount) {
        let user = await User.findOne({_id:user_id})
        let user_bet = await HighCardsBetCollection.findOne({user:user_id,choosen_card:choosen_card})
        if(user_bet) {
            // Update existing bet
            user_bet.amount += parseFloat(amount);
            user_bet.choosen_card = choosen_card;
            user_bet.user =  user_id
            await user_bet.save();
            await User.updateOne(
                {_id:user_id},
                {$set: {credits: user.credits - parseFloat(amount)}}
            )
        }else {
            user_bet = new HighCardsBetCollection({
                amount: parseFloat(amount),
                choosen_card: choosen_card,
                user: user_id
            });
            await user_bet.save();
            await User.updateOne(
                {_id:user_id},
                {$set: {credits: user.credits - parseFloat(amount)}}
            )
        }
    }
    generate_number() {
        let card_num = Math.floor(Math.random() * 13)
        return this.hl_cards[card_num]
    }
    get_card_identifier() {
        // hearts spade ace clups
        let card_i_num = Math.floor(Math.random() * 3)
        return this.card_identifier[card_i_num]
    }
    async get_player_bet_card1(user_id) {
        let player_bet = await HighCardsBetCollection.findOne({user:user_id,choosen_card: "1"},'-choosen_card -__v -_id -user').lean()
        if(player_bet) {
            return player_bet.amount
        }
        return 0
    }
    async get_player_bet_card2(user_id) {
        let player_bet = await HighCardsBetCollection.findOne({user:user_id,choosen_card: "2"},'-choosen_card -__v -_id -user').lean()
        if(player_bet) {
            return player_bet.amount
        }
        return 0
    }
    async return_player_bet(user_id) {
        let player_bet = await HighCardsBetCollection.find({user:user_id})
        console.log(player_bet,'player bet')
        if(player_bet.length === 0) {
            return;
        }
        let player_bet_amount = 0;
        for(let i = 0 ; i < player_bet.length ; i ++) {
            player_bet_amount +=  player_bet[i].amount
        }
        console.log(player_bet_amount)
        if(player_bet) {
            let user = await User.findOne({_id: user_id})
            if(user) {
                let new_credits = user.credits + player_bet_amount
                await User.updateOne(
                    {_id:user_id},
                    {$set: {credits: new_credits}}
                )
            }
        }
    }
    async get_user(user_id) {
        let user = await User.findOne({_id:user_id})
        return user
    }
    get_payout_ration_card1() {
        return (this.getTotalBetOfCard2 / this.getTotalBetOfCard1)
    }
    get_payout_ration_card2() {
        return (this.getTotalBetOfCard1 / this.getTotalBetOfCard2)
    }
    get_card1_winning_percentage() {
        let win_percentage = (this.getTotalBetOfCard2 / this.getTotalBetOfCard1) * .90
        return win_percentage
    }
    get_card2_winning_percentage() {
        let win_percentage = (this.getTotalBetOfCard1 / this.getTotalBetOfCard2) * .90
        return win_percentage
    }
    async get_player_payout_card_1(user_id) {
        let user_bet = await HighCardsBetCollection.findOne({_id:user_id,choosen_card: "1"})
        let card1_payout = (this.get_card1_winning_percentage * user_bet.amount) + user_bet.amount
        return card1_payout
    }
    async get_player_payout_card_2(user_id) {
        let user_bet = await HighCardsBetCollection.findOne({_id:user_id,choosen_card: "2"})
        let card2_payout = (this.get_card2_winning_percentage * user_bet.amount) + user_bet.amount
        return card2_payout
    }
    async resetAllBet() {
        try {
            //add this 
            //if highcards is not equal to null or some shit
            console.log('working')
            await HighCardsBetCollection.deleteMany({})
            return {status:true,message:"Deleted all Collection"}
        }catch(e) {
            console.log('working')
            console.log(e)
        }
    }
}

module.exports = HighCardsBet