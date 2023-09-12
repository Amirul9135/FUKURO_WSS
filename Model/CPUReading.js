 
const db = require("../Controller/Database")

module.exports = class CPUReading { 
 

    //each cpu in metrics should be
    /*{
        dateTime: "YYYY-MM-DD HH:MM:SS",  
        system: 80.00,
        user: 20.00,
        interrupt: 10.00 
    }*/
    static save(nodeId,metrics){
        let strSql = "INSERT INTO cpu_usage (dateTime,nodeId,system,user,interrupt) VALUES "
        metrics.forEach(cpu => {
            strSql += "(" + db.escape(db.toLocalSQLDateTime(cpu.dateTime)) + "," + db.escape(nodeId) 
                + "," + db.escape(cpu.system) + "," + db.escape(cpu.user) + "," + db.escape(cpu.interrupt) + "),"
        });
        strSql = strSql.substring(0, strSql.length - 1) + " ON DUPLICATE KEY UPDATE "
        + " system = (system + VALUES(system)) / 2, "
        + " user = (user + VALUES(user)) / 2, "
        + " interrupt = (interrupt + VALUES(interrupt)) / 2" 
        return db.query(strSql)
    } 

    static fetchHistorical(nodeId,intervalQuery){
        let strSql = intervalQuery
            + " SELECT " 
            + "   COALESCE(AVG(c.user), 0) AS user, "
            + "   COALESCE(AVG(c.interrupt), 0) AS interrupt, "
            + "   COALESCE(AVG(c.system), 0) AS system, "
            + "   intervals.end_interval  AS interval_group "
            + " FROM "
            + "   intervals "
            + " LEFT JOIN cpu_usage c ON c.nodeId = " + db.escape(nodeId)  
            + "     AND c.dateTime >= intervals.start_interval "
            + "     AND c.dateTime < intervals.end_interval "
            + " GROUP BY "
            + " intervals.end_interval "
            + " ORDER BY "
            + " intervals.end_interval ASC "
            return db.query(strSql)
    } 
    // data here is a single instance of cpu metric    
    static notification(data){

    }

}