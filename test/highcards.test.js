const mongoose = require('mongoose');
const HighCardsBet = require('../util/highcards/HighCardsClass')
const supertest  = require('supertest')

// jest.mock('../util/highcards/HighCardsClass', () => {
//     return jest.fn().mockImplementation(() => {
//         return {
//             getTotalBetOfCard1: jest.fn().mockResolvedValue(0),
//             getTotalBetOfCard2: jest.fn().mockResolvedValue(0),
//         };
//     });
// });

describe('High Cards Class - js', () => {
    let highcards;
    beforeAll(async () => {
        highcards = new HighCardsBet()
        await mongoose.connect("mongodb+srv://f1webdev401:q0OZuqXwVrLuXuAD@casino.bebszo9.mongodb.net/?retryWrites=true&w=majority&appName=casino",
            {
                bufferCommands: false,
                serverSelectionTimeoutMS: 5000,
            }
        )
    })
    afterAll(async () => {
        await mongoose.disconnect();
    });
    test('should return 0 all bet in card 1', async () => {
        let bet = await highcards.getTotalBetOfCard1();
        expect(bet).toBe(0);
    },20000);
    test('should return 0 all bet in card 2', async () => {
        let bet = await highcards.getTotalBetOfCard2();
        expect(bet).toBe(0);
    },20000);

    test('generate number 1-13',async () => {
        let card = await highcards.generate_number()
        expect([[1,'one'],[2,'two'],[3,'three'],[4,'four'],[5,'five'],[6,'six'],[7,'seven'],[8,'eight'],[9,'nine'],[10,'ten'],[11,'card-jqk'],[12,'card-jqk'],[13,'card-jqk']]).toContainEqual(card)
    },20000)

    test('get the card identifier',async () => {
        let identifier = await highcards.get_card_identifier()
        expect([{suits:"♠️",color:"black"},{suits:"♣️",color: 'black'},{suits:"❤️",color:'red'},{suits:"♦️",color:'red'}]).toContainEqual(identifier)
    },20000)

});
