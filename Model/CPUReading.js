const { resolve } = require("path");
const db = require("../Controller/DBConn")

module.exports = class CPUReading {

    //time stamp yyyy-MM-dd hh-mm-ss

    //each cpu should be
    /*{
        timeStamp: "YYYY-MM-DD HH:MM:SS",
        nodeId: 1,
        label: "cpu",
        system: 80.00,
        user: 20.00,
        total:100.00
    }*/

    static saveReadings(cpuArr) {// cpu arr should contain array of cpu reading object 
        var strSql = "INSERT INTO cpu_usage (timeStamp,nodeId,label,system,user,total) VALUES "

        cpuArr.forEach(cpu => {
            strSql += "(" + db.escape(cpu.timeStamp) + "," + db.escape(cpu.nodeId) + "," + db.escape(cpu.label)
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