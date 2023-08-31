const FUKURO = require("../FUKURO")
const CPUReading = require("../Model/CPUReading")
const db = require("./Database")

class MetricController{
    static saveReadings(resId,nodeId,values){
        if(resId = FUKURO.RESOURCE.cpu){
            return CPUReading.save(nodeId,values)
        }
    }

    static fetchHistoricalData(resId,nodeId,interval,duration,date){
        var refDate = " NOW() "
        if(date){
            refDate = " STR_TO_DATE(" + db.escape(date) + ", '%Y-%m-%d %H:%i') "
        }
        var sql = "WITH RECURSIVE intervals AS ( "
            + " SELECT "
            + "  CAST(DATE_FORMAT(TIMESTAMP(DATE_SUB(" + refDate + ", INTERVAL " + db.escape(duration) + " SECOND)), '%Y-%m-%d %H:%i:00') AS DATETIME) AS start_interval, "
            + "  CAST(DATE_FORMAT(TIMESTAMP(DATE_SUB(" + refDate + ", INTERVAL " + db.escape(duration) + " SECOND)) + INTERVAL " + db.escape(interval) + " SECOND, '%Y-%m-%d %H:%i:00') AS DATETIME) AS end_interval "
            + " UNION ALL "
            + " SELECT end_interval, end_interval + INTERVAL " + db.escape(interval) + " SECOND "
            + " FROM intervals "
            + " WHERE end_interval < " + refDate + " ) "
        console.log('sql',sql) 
        if(resId == FUKURO.RESOURCE.cpu){
            return CPUReading.fetchHistorical(nodeId,sql)
        }
    }
}

module.exports = MetricController