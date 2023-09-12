const FUKURO = require("../FUKURO")
const CPUReading = require("../Model/CPUReading")
const MEMReading = require("../Model/MEMReading")
const DiskReading = require("../Model/DiskReading")
const NETReading = require("../Model/NETReading")
const db = require("./Database")

class MetricController{
    static saveReadings(resId,nodeId,values){
        if(resId == FUKURO.RESOURCE.cpu){
            return CPUReading.save(nodeId,values)
        }
        else if (resId == FUKURO.RESOURCE.mem){
            return MEMReading.save(nodeId,values)
        }
        else if( resId == FUKURO.RESOURCE.dsk){
            return DiskReading.save(nodeId,values)
        }
        else if (resId == FUKURO.RESOURCE.net){
            return NETReading.save(nodeId,values)
        }
    }

    static fetchHistoricalData(resId,nodeId,interval,sDate,enDate,diskonly){
        console.log(sDate)
        let start =  (sDate == null)? " NOW() ": db.escape(db.toLocalSQLDateTime(sDate))
        console.log(start)
        let end  = (enDate == null)? " NOW() ": db.escape(db.toLocalSQLDateTime(enDate)) 
        interval = db.escape(interval);
        let sql = "WITH RECURSIVE intervals AS ( "
            + " SELECT  " 
                + " CAST(DATE_FORMAT("+start+  ", '%Y-%m-%d %H:%i:%s') AS DATETIME) AS start_interval, "   	//first start	  	
                + " CAST(DATE_FORMAT("+start+" + INTERVAL "+interval+" SECOND, '%Y-%m-%d %H:%i:%s') AS DATETIME) AS end_interval " 	// plus second interval for first end
            + " UNION ALL  "
            + " SELECT end_interval, end_interval + INTERVAL "+interval+" SECOND  FROM intervals  WHERE end_interval <  "+end+" ) " // until end date
        console.log('sql',sql) 
        if(resId == FUKURO.RESOURCE.cpu){
            return CPUReading.fetchHistorical(nodeId,sql)
        }
        else if(resId == FUKURO.RESOURCE.mem){
            return MEMReading.fetchHistorical(nodeId,sql)
        }
        else if(resId == FUKURO.RESOURCE.net){
            return NETReading.fetchHistorical(nodeId,sql)
        }
        else if(resId == FUKURO.RESOURCE.dsk){
            return DiskReading.fetchHistorical(nodeId,sql,diskonly)
        }
    }
}

module.exports = MetricController