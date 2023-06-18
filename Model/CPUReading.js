const { resolve } = require("path");
const db = require("../Controller/DBConn")

module.exports = class CPUReading {

    static minute = 0; //past  1 hour with 10 sec interval
    static hour = 1; //past 24 hour interval of 5 minute
    static day = 2; //past 1 week interval of 30 minute

    //time stamp yyyy-MM-dd hh-mm-ss

    //each cpu in metrics should be
    /*{
        dateTime: "YYYY-MM-DD HH:MM:SS", 
        label: "cpu",
        system: 80.00,
        user: 20.00,
        interrupt: 10.00 
    }*/

    static saveReadings(nodeId, metrics) {// cpu arr should contain array of cpu reading object 
        var strSql = "INSERT INTO cpu_usage (dateTime,nodeId,label,system,user,interrupt) VALUES "

        metrics.forEach(cpu => {
            strSql += "(" + db.escape(cpu.dateTime) + "," + db.escape(nodeId) + "," + db.escape(cpu.label)
                + "," + db.escape(cpu.system) + "," + db.escape(cpu.user) + "," + db.escape(cpu.interrupt) + "),"
        });
        strSql = strSql.substring(0, strSql.length - 1);
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(result)
                }
            })
        })
    }

    static getReadings(userId,nodeId,period=2){
        //period is int based on the static attribute

        var strSql = "SELECT c.label, AVG(c.user) as user, AVG(c.interrupt) as interrupt, AVG(c.system) as system, "

        if(period == CPUReading.minute){
           strSql += " TIMESTAMP(c.dateTime) - INTERVAL SECOND(c.dateTime) % 10 SECOND AS interval_group "
        }
        if(period == CPUReading.hour){
            strSql += " TIMESTAMP(c.dateTime) - INTERVAL MINUTE(c.dateTime) % 5 MINUTE AS interval_group "
        }
        if(period == CPUReading.day){
            strSql += " TIMESTAMP(c.dateTime) - INTERVAL MINUTE(c.dateTime) % 30 MINUTE AS interval_group "
        }


        strSql += " FROM cpu_usage c JOIN node_dir nd ON c.nodeId = nd.nodeId JOIN node_dir_access nda ON nda.pathId = nd.pathId "

        + " WHERE nda.userId = "+db.escape(userId)+" AND c.nodeId=" + db.escape(nodeId) 

        if(period == CPUReading.minute){
            strSql += " AND  c.dateTime >= DATE_SUB(NOW(), INTERVAL 1 HOUR)"
        }
        if(period == CPUReading.hour){
            strSql += " AND  c.dateTime >= DATE_SUB(NOW(), INTERVAL 24 HOUR)"
        }
        if(period == CPUReading.day){   
            strSql += " AND  c.dateTime >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
        }
        
        strSql+= " GROUP BY  c.label, interval_group  ORDER BY `interval_group` ASC"

        console.log(strSql)
        return new Promise(function (resolve,reject){
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