const express = require('express');
const path = require('path');
const app = express();

app.use(express.json({ extended: false }));

app.use("/api/node", require("./Controller/REST/NodeAPI"))
app.use("/api/user", require("./Controller/REST/UserAPI"))
app.use("/test", require("./Controller/REST/TestAPI"))

app.get("/api/test", (req, res) => {
    return res.send(new Date().toDateString())
})

app.get("/", function (req, res) {
    return res.status(200).send("test");
})
module.exports = app;