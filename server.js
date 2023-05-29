const express = require('express');
const path = require('path');
const app = express();

app.use(express.json({ extended: false }));

app.use("/api/node", require("./Controller/NodeAPI"))
app.use("/api/user", require("./Controller/UserAPI"))

app.get("/", function (req, res) {
    return res.status(200).send("test");
})
module.exports = app;