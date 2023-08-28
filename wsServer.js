let WSServer = require('ws').Server;
let server = require('http').createServer();
let app = require("./server"); 
const UserCache = require('./Controller/UserCache')
const jwtsCache = require('node-persist');
const ConnectionHandler = require("./Controller/WebSocket/ConnectionHandler")
const wsConnection = new ConnectionHandler()

let wss = new WSServer({ //create web socket OVER http
    server: server
});
server.on('request', app);//mount app

//wss.on('connection', wsConnection.onConnect);
wss.on('connection', wsConnection.onConnect);

server.listen(5000, async function () {
    await UserCache.load()
    await jwtsCache.init({
        dir: 'data/jwts',
        stringify: JSON.stringify,
        parse: JSON.parse,
    });;
    await jwtsCache.forEach(data => {
        if (!global.jwts)
            global.jwts = {};
        global.jwts[data.key] = data.value;
    });
    console.log("server Up");
})