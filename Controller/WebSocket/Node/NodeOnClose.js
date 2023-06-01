module.exports = function onClose(ws) {

    //query db, notify node down
    console.log(ws)
    console.log("node closed")
}

