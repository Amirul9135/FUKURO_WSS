 
const db = require("../Controller/Database")

module.exports = class MEMReading { 
 

    //each memory reading in metrics should be
    /*{
        dateTime: "YYYY-MM-DD HH:MM:SS",  
        used: 80.00,
        cached: 20.00,
        buffer: 10.00 
    }*/
    static save(nodeId,metrics){
        let strSql = "INSERT INTO memory_usage (dateTime,nodeId,used,cached,buffer) VALUES "
        metrics.forEach(mem => {
            strSql += "(" + db.escape(mem.dateTime) + "," + db.escape(nodeId) 
                + "," + db.escape(mem.used) + "," + db.escape(mem.cached) + "," + db.escape(mem.buffer) + "),"
        });
        strSql = strSql.substring(0, strSql.length - 1);
        return db.query(strSql)
    } 

    static fetchMemTotal(nodeId,dstart,dend){
        let strSql = "SELECT * FROM node_spec WHERE nodeId=" + db.escape(nodeId)
            + " AND dateTime >= " + db.escape(dstart) + " AND dateTime <=" + db.escape(dend)
            + " ORDER by dateTime DESC"
        return db.query(strSql)
    }

    static fetchHistorical(nodeId,intervalQuery){
        let strSql = intervalQuery
            + " SELECT " 
            + "   COALESCE(AVG(m.used), 0) AS used, "
            + "   COALESCE(AVG(m.cached), 0) AS cached, "
            + "   COALESCE(AVG(m.buffer), 0) AS buffer, "
            + "   Intervals.end_interval  AS interval_group "
            + " FROM "
            + "   intervals "
            + " LEFT JOIN memory_usage m ON m.nodeId = " + db.escape(nodeId)  
            + "     AND m.dateTime >= intervals.start_interval "
            + "     AND m.dateTime < intervals.end_interval "
            + " GROUP BY "
            + " intervals.end_interval "
            + " ORDER BY "
            + " intervals.end_interval ASC "
            return db.query(strSql)
    }
    static fetchHistorical_old(nodeId,interval,duration,date = null){//interval and duration should be in second unit
        // date must be date without second
        var refDate = " NOW() "
        if(date){
            refDate = " STR_TO_DATE(" + db.escape(date) + ", '%Y-%m-%d %H:%i') "
        }
        var strSql = "WITH RECURSIVE intervals AS ( "
            + " SELECT "
            + "  CAST(DATE_FORMAT(TIMESTAMP(DATE_SUB(" + refDate + ", INTERVAL " + db.escape(duration) + " SECOND)), '%Y-%m-%d %H:%i:00') AS DATETIME) AS start_interval, "
            + "  CAST(DATE_FORMAT(TIMESTAMP(DATE_SUB(" + refDate + ", INTERVAL " + db.escape(duration) + " SECOND)) + INTERVAL " + db.escape(interval) + " SECOND, '%Y-%m-%d %H:%i:00') AS DATETIME) AS end_interval "
            + " UNION ALL "
            + " SELECT end_interval, end_interval + INTERVAL " + db.escape(interval) + " SECOND "
            + " FROM intervals "
            + " WHERE end_interval < " + refDate + " ) "
            + " SELECT " 
            + "   COALESCE(AVG(c.user), 0) AS user, "
            + "   COALESCE(AVG(c.interrupt), 0) AS interrupt, "
            + "   COALESCE(AVG(c.system), 0) AS system, "
            + "   Intervals.end_interval  AS interval_group "
            + " FROM "
            + "   intervals "
            + " LEFT JOIN cpu_usage c ON c.nodeId = " + db.escape(nodeId)  
            + "     AND c.dateTime >= intervals.start_interval "
            + "     AND c.dateTime < intervals.end_interval "
            + " GROUP BY "
            + " intervals.end_interval "
            + " ORDER BY "
            + " intervals.end_interval ASC "

        return new Promise(function(resolve,reject){
            db.query(strSql,function(err,result){
                if(err){
                    reject(err)
                }
                else{
                    resolve(result)
                }

            })
        })



    } 
}