 
const db = require("../Controller/Database")

module.exports = class NETReading { 
 

    //each disk reading in metrics should be
    /*{
        dateTime: "YYYY-MM-DD HH:MM:SS",  
        rkByte: 10.0,
        rError: 1,
        rDrop: 0,
        tkByte: 10.0,
        tError: 1,
        tDrop: 0
    }*/
    static save(nodeId,metrics){
        let strSql = "INSERT IGNORE INTO network_usage (dateTime,nodeId,rkByte,rError,rDrop,tkByte,tError,tDrop) VALUES "
        metrics.forEach(net => {
            strSql += "(" + db.escape(net.dateTime) + "," + db.escape(nodeId) 
                + "," + db.escape(net.rkByte) + "," + db.escape(net.rError) + "," + db.escape(net.rDrop) 
                + "," + db.escape(net.tkByte) + "," + db.escape(net.tError) + "," + db.escape(net.tDrop) + "),"
        });
        strSql = strSql.substring(0, strSql.length - 1)  + " ON DUPLICATE KEY UPDATE "
        + " rkByte = (rkByte + VALUES(rkByte)) / 2, "
        + " rError = (rError + VALUES(rError)) / 2, "
        + " rDrop = (rDrop + VALUES(rDrop)) / 2, " 
        + " tkByte = (rkByte + VALUES(rkByte)) / 2, "
        + " tError = (rError + VALUES(rError)) / 2, "
        + " tDrop = (rDrop + VALUES(rDrop)) / 2" 
        return db.query(strSql)
    }  
    static fetchHistorical(nodeId,intervalQuery){
        let strSql = intervalQuery
            + " SELECT "  
            + "   COALESCE(AVG(n.rkByte), 0) AS rkByte, "
            + "   COALESCE(AVG(n.rError), 0) AS rError, "
            + "   COALESCE(AVG(n.rDrop), 0) AS rDrop, "
            + "   COALESCE(AVG(n.tkByte), 0) AS tkByte, "
            + "   COALESCE(AVG(n.tError), 0) AS tError, "
            + "   COALESCE(AVG(n.tDrop), 0) AS tDrop, "
            + "   Intervals.end_interval  AS interval_group "
            + " FROM "
            + "   intervals "
            + " LEFT JOIN network_usage n ON n.nodeId = " + db.escape(nodeId)  
            + "     AND n.dateTime >= intervals.start_interval "
            + "     AND n.dateTime < intervals.end_interval "
            + " GROUP BY "
            + " intervals.end_interval "
            + " ORDER BY "
            + " intervals.end_interval ASC "
            return db.query(strSql)
    } 
}