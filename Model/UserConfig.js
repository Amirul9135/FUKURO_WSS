const db = require("../Controller/DBConn") 

module.exports = class UserConfig{
    static registerNotification(userId,nodeId,resourceType){
        var strSql = "INSERT INTO user_notification (userId,nodeId,resourceType) VALUES "
        + "(" + db.escape(userId) +","+db.escape(nodeId)+","+db.escape(resourceType)+")"
        return new Promise(function(resolve,reject){
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve()
                }
            })
        })

    }

    static removeNotification(userId,nodeId,resourceType){
        var strSql = "DELETE FROM user_notification WHERE userId="+ db.escape(userId) 
        +" AND nodeId="+db.escape(nodeId)+" AND resourceType= "+db.escape(resourceType) 
        return new Promise(function(resolve,reject){
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve()
                }
            })
        })

    }
}