const CPU = require("../../../Model/CPUReading")

/*
This module handle the operation of recieving and process message from node client
expected format of content would be
{
    readings:{
        cpu:[],  //cpuObj{dateTime:yyyy-mm-dd hh:mm:ss,label:'sdsa',system:0.0,user:0.0,interrupt:0.0}
        mem:[],  //memObj{dateTime:yyyy-mm-dd hh:mm:ss,total:0,used:0,cached:0}
        disk:[], //not yet
        net:     //not yet
    }
}
*/
module.exports = function onMessage(ws, message) { 
    try{
        message = JSON.parse(message) 
        if (message.hasOwnProperty("readings")) {
            console.log("readings") 
            if (message.readings["cpu"]) {
                //save cpu readings  
                CPU.saveReadings(ws.client.data.nodeId, message.readings.cpu).catch(function (err) {
                    console.log(err)
                }) 
                ws.client.app.forEach(activeApp => {
                    if (activeApp.client.metric.cpu) {
                        activeApp.send(JSON.stringify({ cpu: message.readings.cpu }))
                    }
                });
            }
            if (message.readings["mem"]) {
                //save memory readings
    
            }
            if (message.readings["disk"]) {
                //save disk utilization
    
            }
            if (message.readings["net"]) {
                //save network usage
    
            }
        }
    }catch(e){
        console.log("bad message")
    }
    

    console.log("node message " + message)
}
