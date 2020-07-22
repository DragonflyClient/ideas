const DRAGONFLY_BACKEND_HOST = "http://localhost:1414"

const express = require("express");
const cors = require("cors");
const monk = require("monk");
const bodyParser = require('body-parser')
const app = express();
const rateLimit = require("express-rate-limit");
const credentials = require("./creds");
const { ObjectId } = require("mongodb");
const db = monk(
   `mongodb://${credentials.db.username}:${credentials.db.password}@45.85.219.34:27017/dragonfly`
);
const feedbacks = db.get("feedback");
const request = require('request');

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

db.then(() => {
   console.log("Connected correctly to the database");
});

app.use(cors());
app.use(bodyParser({ limit: '2mb' }));

app.use(express.json());

app.get("/", (req, res) => {
   res.send("Everything working fine");
});

app.get("/feedback", async function (req, res) {
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

   feedbacks.count(query, function (error, count) {
      feedbacks
         .find(query, {
            limit: parseInt(limit),
            skip: parseInt(skip),
            sort: sortQuery
         })
         .then((feedbacks) => {
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

app.use(
   rateLimit({
      windowMs: 60 * 1000, // every minute
      max: 5,
      message: {
         status: 429,
         msg: "Too many requests",
      },
   })
);

app.get("/auth/upvote", (req, res) => {
   const authorization = req.header("Authorization")
   const id = req.query.id;
   validateToken(authorization).then((account) => {
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

            feedbacks.update({ _id: id }, {
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

app.post("/", (req, res) => {
   if (isValid(req.body)) {
      const feedback = {
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
         feedback.attachments = req.body.attachments
      }

      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (req.body.email !== "" && req.body.email.match(re)) {
         feedback.email = req.body.email;
      }

      feedbacks.insert(feedback);
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

function validateToken(header) {
   const options = {
      url: `${DRAGONFLY_BACKEND_HOST}/auth`,
      method: 'POST',
      headers: {
         'Authorization': header
      }
   }

   return new Promise(function (resolve) {
      request(options, function (error, response, body) {
         if (response.statusCode === 200) {
            const result = JSON.parse(body)
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
      feedbacks.find({ _id: id }).then((found) => callback(found))
   } else {
      error()
   }
}

function isValid(feedback) {
   return (
      feedback.title &&
      feedback.title.toString().trim() !== "" &&
      feedback.message &&
      feedback.message.toString().trim() !== "" &&
      feedback.message.toString().replace(/(<([^>]+)>)/ig, "") !== ""
   );
}