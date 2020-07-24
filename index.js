const DRAGONFLY_BACKEND_HOST = "https://api.inceptioncloud.net"

const express = require("express");
const cors = require("cors");
const monk = require("monk");
const bodyParser = require('body-parser')
const app = express();
const rateLimit = require("express-rate-limit");
const credentials = require("./creds");
const { ObjectId } = require("mongodb");
const db = monk(`mongodb://${credentials.db.username}:${credentials.db.password}@45.85.219.34:27017/dragonfly`);
const ideas = db.get("ideas");
const request = require('request');
const cookieParser = require('cookie-parser')

Array.prototype.remove = function () {
    let what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
Array.prototype.contains = function (obj) {
    let i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

db.then(() => console.log("Connected to the database"));

app.use(cors({
    origin: ['https://inceptioncloud.net', 'null'],
    credentials: true
}));
app.use(bodyParser({ limit: '500kb' }));
app.use(express.json());
app.use(cookieParser())

app.get("/", (req, res) => {
    res.redirect("https://inceptioncloud.net/dragonfly/ideas")
});

app.get("/overview", async function (req, res) {
    const limit = req.query.limit || 0;
    const skip = req.query.skip || 0;
    const order = parseInt(req.query.order) || 1;
    const language = req.query.language || "all";
    const type = req.query.type || "all"
    const upvotesOrder = parseInt(req.query.upvotesorder)
    const authorization = req.header("Authorization")
    const account = await validateToken(authorization)

    const sortQuery = {}
    const query = {}

    if (language !== "all") {
        query.lang = language
    }
    if (type !== "all") {
        query.type = type
    }

    if (upvotesOrder && upvotesOrder !== 0) {
        sortQuery.upvotesAmount = upvotesOrder
    }
    sortQuery.createdMs = order

    ideas.count(query, function (error, count) {
        ideas.find(query, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            sort: sortQuery
        }).then((feedbacks) => {
            let result = feedbacks;

            result.forEach(element => {
                if (account) {
                    element.upvoted = element.upvotes.contains(account.identifier)
                }
                element.upvotes = null
                element.email = null
            })

            if (count <= parseInt(skip) + parseInt(limit)) {
                result.push({ end: true })
            }

            res.json(result);
        });
    });
});

app.get("/id", async function (req, res) {
    const id = req.query.id;
    const authorization = req.header("Authorization")
    const account = await validateToken(authorization)
    getEntriesById(id,
        found => {
            if (found.length === 0) {
                res.status(404)
                res.json({
                    status: 404,
                    msg: 'Feedback not found',
                    id
                })
                return
            }

            const info = found[0]
            const upvotes = found[0].upvotes || []
            info.email = null
            info.upvotes = null

            if (account) {
                info.upvoted = upvotes.contains(account.identifier)
            }

            res.json(info)
        },
        () => {
            res.status(404)
            res.json({
                status: 404,
                msg: 'Feedback not found',
                id
            })
        })
});

app.use(rateLimit({
    windowMs: 60 * 1000, // every minute
    max: 5,
    message: {
        status: 429,
        msg: "Too many requests",
    },
}));

app.get("/upvote", (req, res) => {
    const token = req.cookies["dragonfly-token"]
    const id = req.query.id;
    validateToken(token).then((account) => {
        if (account && id) {
            getEntriesById(id, (entry) => {
                const upvotes = entry[0].upvotes || []
                let added
                if (upvotes.contains(account.identifier)) {
                    upvotes.remove(account.identifier)
                    added = false
                } else {
                    upvotes.push(account.identifier)
                    added = true
                }

                ideas.update({ _id: id }, {
                    $set: {
                        upvotes: upvotes,
                        upvotesAmount: upvotes.length
                    }
                })
                res.json({
                    success: true,
                    added: added,
                    upvotesAmount: upvotes.length
                })
            }, () => {
                res.json({
                    success: false,
                    error: "No entry found"
                })
            })
        } else if (!account) {
            res.json({
                success: false,
                error: "Unauthenticated"
            })
        } else if (!id) {
            res.json({
                success: false,
                error: "Invalid ID"
            })
        }
    })
})

app.post("/submit", (req, res) => {
    if (isValid(req.body)) {
        const idea = {
            type: req.body.type,
            title: req.body.title,
            message: req.body.message,
            created: new Date(),
            createdMs: new Date().getTime(),
            lang: req.body.lang,
            upvotes: [],
            upvotesAmount: 0
        };

        if (req.body.attachments && req.body.attachments.length > 0) {
            idea.attachments = req.body.attachments
        }

        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (req.body.email !== "" && req.body.email.match(re)) {
            idea.email = req.body.email;
        }

        ideas.insert(idea);
        res.send(req.body);
    } else {
        res.status(422);
        res.json({
            msg: "Please enter a title and a message.",
            status: 422,
        });
    }
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
});

function validateToken(token) {
    const options = {
        url: `${DRAGONFLY_BACKEND_HOST}/auth`,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }

    return new Promise(function (resolve) {
        request(options, function (error, response, body) {
            console.log(response.statusCode)
            if (response.statusCode === 200) {
                const result = JSON.parse(body)
                console.log("result", result)
                if (result.success) {
                    resolve(result)
                    return
                }
            }

            resolve(null)
        })
    })
}

function getEntriesById(id, callback, error) {
    const validId = ObjectId.isValid(id);
    if (validId) {
        ideas.find({ _id: id }).then((found) => callback(found))
    } else {
        error()
    }
}

function isValid(idea) {
    return (
        idea.title &&
        idea.title.toString().trim() !== "" &&
        idea.message &&
        idea.message.toString().trim() !== "" &&
        idea.message.toString().replace(/(<([^>]+)>)/ig, "") !== ""
    );
}