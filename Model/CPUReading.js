const { resolve } = require("path");
const db = require("../Controller/DBConn")

module.exports = class CPUReading {

    //time stamp yyyy-MM-dd hh-mm-ss

    //each cpu in metrics should be
    /*{
        dateTime: "YYYY-MM-DD HH:MM:SS", 
        label: "cpu",
        system: 80.00,
        user: 20.00,
        total:100.00
    }*/

    static saveReadings(nodeId, metrics) {// cpu arr should contain array of cpu reading object 
        var strSql = "INSERT INTO cpu_usage (dateTime,nodeId,label,system,user,total) VALUES "

        metrics.forEach(cpu => {
            strSql += "(" + db.escape(cpu.dateTime) + "," + db.escape(nodeId) + "," + db.escape(cpu.label)
                + "," + db.escape(cpu.system) + "," + db.escape(cpu.user) + "," + db.escape(cpu.total) + "),"
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
}