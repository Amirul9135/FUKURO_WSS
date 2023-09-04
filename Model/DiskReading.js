 
const db = require("../Controller/Database")

module.exports = class DiskReading { 
 

    //each disk reading in metrics should be
    /*{
        dateTime: "YYYY-MM-DD HH:MM:SS",  
        name: 'sda',
        utilization: 20.00,
        readSpeed: 10.00,
        writeSpeed: 0
    }*/
    static save(nodeId,metrics){
        let strSql = "INSERT IGNORE INTO disk_usage (dateTime,nodeId,name,utilization,readSpeed,writeSpeed) VALUES "
        metrics.forEach(dsk => {
            strSql += "(" + db.escape(dsk.dateTime) + "," + db.escape(nodeId) + "," + db.escape(dsk.name)
                + "," + db.escape(dsk.utilization) + "," + db.escape(dsk.readSpeed) + "," + db.escape(dsk.writeSpeed) + "),"
        });
        strSql = strSql.substring(0, strSql.length - 1) + " ON DUPLICATE KEY UPDATE "
        + " utilization = (utilization + VALUES(utilization)) / 2, "
        + " readSpeed = (readSpeed + VALUES(readSpeed)) / 2, "
        + " writeSpeed = (writeSpeed + VALUES(writeSpeed)) / 2" 
        return db.query(strSql)
    } 
 
    static fetchHistorical(nodeId,intervalQuery,diskname){
        let strSql = intervalQuery
            + " SELECT "  
            + "   COALESCE(AVG(d.utilization), 0) AS utilization, "
            + "   COALESCE(AVG(d.readSpeed), 0) AS readSpeed, "
            + "   COALESCE(AVG(d.writeSpeed), 0) AS writeSpeed, "
            + "   Intervals.end_interval  AS interval_group " 
            + " FROM "
            + "   intervals "
            + " LEFT JOIN disk_usage d ON d.nodeId = " + db.escape(nodeId)  
            + "     AND d.name = " + db.escape(diskname)
            + "     AND d.dateTime >= intervals.start_interval "
            + "     AND d.dateTime < intervals.end_interval " 
            + " GROUP BY "
            + " intervals.end_interval "
            + " ORDER BY "
            + " intervals.end_interval ASC "
            return db.query(strSql)
    } 
}