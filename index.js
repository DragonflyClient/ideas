const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())

app.use(express.json())

app.get('/', (req, res) => {
    res.send("Hello World")
})

app.post('/', (req, res) => {
    console.log(req.body)
    res.send(req.body)
})

app.listen(3000, () => {
    console.log('Listening on http://localhost:3000')
})