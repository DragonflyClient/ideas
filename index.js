const express = require('express')
const cors = require('cors')
const monk = require('monk')
const app = express()
const rateLimit = require('express-rate-limit')
const credentials = require('./creds')
const db = monk(`mongodb://${credentials.db.username}:${credentials.db.password}@45.85.219.34:27017/dragonfly`);
const feedbacks = db.get('feedback')

db.then(() => {
    console.log('Connected correctly to the database')
})

app.use(cors())

app.use(express.json())

app.get('/', (req, res) => {
    res.send("Everything working fine")
})

function isValid(feedback) {
    return feedback.title && feedback.title.toString().trim() !== '' &&
        feedback.message && feedback.message.toString().trim() !== ''
}


app.get('/feedback', (req, res) => {
    const limit = req.query.limit || 0
    const skip = req.query.skip || 0
    feedbacks.count({}, function (error, count) {

        feedbacks.find({}, { limit: parseInt(limit), skip: parseInt(skip) })
            .then(feedbacks => {

                const result = feedbacks.reverse()
                if (count <= parseInt(skip) + parseInt(limit)) {
                    result.push({
                        end: true
                    })
                }

                res.json(result)
            })
    });
})

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
        res.send(req.body)
        const feedback = {
            type: req.body.type,
            title: req.body.title,
            message: req.body.message,
            created: new Date(),
            createdMs: new Date().getTime()
        }
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (req.body.email !== '' && req.body.email.match(re)) {
            feedback.email = req.body.email
        }
        feedbacks
            .insert(feedback)
        console.log(feedback)
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