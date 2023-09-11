const express = require('express');
const path = require('path');
const app = express();
const UserAPI = require("./Controller/REST/UserAPI")
const NodeAPI = require("./Controller/REST/NodeAPI")
const ConfigAPI = require("./Controller/REST/ConfigAPI")
const MetricsAPI = require("./Controller/REST/MetricsAPI")

app.use(express.json({ extended: false }));

app.use("/api/node", new NodeAPI().routes())
app.use("/api/user", new UserAPI().routes())
app.use("/api/config", new ConfigAPI().routes())
app.use("/api/metric", new MetricsAPI().routes())
//app.use("/test", require("./Controller/REST/TestAPI"))

app.get("/api/test", (req, res) => {
    console.log("test ping on "+new Date().toDateString())
    return res.send(new Date().toDateString())
})


const db = require("./Controller/Database")
app.get("/", function (req, res) {
    //kalau script td run die masuk sini nnt log bwh tu
    console.log('test req');
    console.log(req.body)
    db.query("SELECT * FROM cpu_usage  where nodeId = '1' LIMIT 10").then((result)=>{
        console.log(result)
    })
    db.query("SELECT * FROM cpu_usage  where nodeId = '8' LIMIT 10").then((rs)=>{
        console.log(rs)
    })
    var dt = req.body.dt
    var str = req.body.string

    console.log(Date(dt))
    console.log(Date(str))
    return res.status(200).send("test");
})
module.exports = app; 