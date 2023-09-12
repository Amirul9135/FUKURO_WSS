 
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
        let strSql = "INSERT IGNORE INTO memory_usage (dateTime,nodeId,used,cached,buffer) VALUES "
        metrics.forEach(mem => {
            strSql += "(" + db.escape(db.toLocalSQLDateTime(mem.dateTime)) + "," + db.escape(nodeId) 
                + "," + db.escape(mem.used) + "," + db.escape(mem.cached) + "," + db.escape(mem.buffer) + "),"
        });
        strSql = strSql.substring(0, strSql.length - 1)  + " ON DUPLICATE KEY UPDATE "
        + " used = (used + VALUES(used)) / 2, "
        + " cached = (cached + VALUES(cached)) / 2, "
        + " buffer = (buffer + VALUES(buffer)) / 2" 
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
            + "   intervals.end_interval  AS interval_group "
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
}