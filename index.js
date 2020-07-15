const express = require('express')
const cors = require('cors')
const monk = require('monk')
const app = express()
const rateLimit = require('express-rate-limit')

// db stuff

app.use(cors())

app.use(express.json())

app.get('/', (req, res) => {
    res.send("Everything working fine")
})

function isValid(feedback) {
    return feedback.title && feedback.title.toString().trim() !== '' &&
        feedback.message && feedback.message.toString().trim() !== ''
}
app.use(rateLimit({
    windowMs: 5 * 60 * 1000, // every 5 minutes
    max: 5,
    message: {
        status: 429,
        msg: 'Too many requests'
    }
}))
app.post('/', (req, res) => {
    if (isValid(req.body)) {
        console.log(req.body)
        res.send(req.body)
    } else {
        res.status(422)
        res.json({
            msg: "Please enter a title and a message.",
            status: 422
        })
    }
})

app.listen(3000, () => {
    console.log('Listening on http://localhost:3000')
})