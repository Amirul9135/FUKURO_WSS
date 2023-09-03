 
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
            + "   d.name"
            + "   COALESCE(AVG(d.utilization), 0) AS utilization, "
            + "   COALESCE(AVG(d.readSpeed), 0) AS readSpeed, "
            + "   COALESCE(AVG(d.writeSpeed), 0) AS writeSpeed, "
            + "   Intervals.end_interval  AS interval_group "
            + " FROM "
            + "   intervals "
            + " LEFT JOIN disk_usage d ON d.nodeId = " + db.escape(nodeId)  
            + "     AND d.dateTime >= intervals.start_interval "
            + "     AND d.dateTime < intervals.end_interval "
            + " GROUP BY "
            + " intervals.end_interval "
            + " ORDER BY "
            + " intervals.end_interval ASC "
            return db.query(strSql)
    } 
}