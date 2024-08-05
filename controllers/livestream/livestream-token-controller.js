require('dotenv').config()
const {RtcTokenBuilder,RtcRole} = require('agora-access-token')

const generateToken = async (req,res) => {
    const channelName = "Livestreaming"
    const uid = parseInt(req.query.uid, 10);
    const role = req.query.role === "publisher" ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER
    const expirationTimeInSeconds = 3600;

    const currentTimestamp = Math.floor(Date.now() / 1000)
    const privilageExpiredTs = currentTimestamp + expirationTimeInSeconds

    const token = RtcTokenBuilder.buildTokenWithUid(process.env.APP_ID,process.env.APP_CERTIFICATE,channelName,uid,role,privilageExpiredTs)
    console.log(token)
    res.send({token})
}

module.exports = generateToken