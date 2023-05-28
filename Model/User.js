const db = require("../Controller/DBConn")

module.exports = class User {
    #userId
    #name
    #username
    #password
    #email
    #phone
    #pin
    #isActive

    register() {
        var strSql = "INSERT INTO user(name,username,password,email,phone,pin,isActive) VALUES ("
            + db.escape(this.#name) + "," + db.escape(this.#username) + "," + db.escape(this.#password) + ","
            + db.escape(this.#email) + "," + db.escape(this.#phone) + "," + db.escape(this.#pin) + ", '1')"
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            })
        })
    }

    login() {
        var strSql = "SELECT * FROM user WHERE username=" + db.escape(this.#username) + " AND isActive='1'";
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 1) {
                        resolve(result[0])
                    }
                    else {
                        reject({ message: "NOT_FOUND" })
                    }
                }
            })

        })
    }

    update() {
        var strSql = "UPDATE user SET name=" + db.escape(this.#name)
            + ", username=" + db.escape(this.#username) + ", email=" + db.escape(this.#email) + ", phone="
            + db.escape(this.#phone) + " WHERE userId=" + db.escape(this.#userId)
        return new Promise(function (resolve, reject) {
            db.query(strSql, function (err, result) {
                if (err) {
                    reject(err)
                }
                else[
                    resolve()
                ]
            })
        })
    }

    static findByUserId(userId) {
        var strSQL = "SELECT name,username,email,phone,isActive FROM user WHERE userId=" + db.escape(userId)
        return new Promise(function (resolve, reject) {
            db.query(strSQL, function (err, result) {
                if (err) {
                    reject(err)
                }
                else {
                    result = JSON.parse(JSON.stringify(result))
                    if (result.length == 1) {
                        result[0].userId = userId
                        resolve(result[0])
                    }
                    else {
                        reject({ message: "NOT_FOUND" })
                    }
                }
            })
        })
    }


    constructor(jObj = null) {
        this.#userId = -1;
        this.#name = "";
        this.#username = "";
        this.#password = "";
        this.#email = "";
        this.#phone = "";
        this.#pin = "";
        this.#isActive = "";
        if (jObj != null) {
            if (jObj.hasOwnProperty("userId")) {
                this.#userId = jObj["userId"];
            }
            if (jObj.hasOwnProperty("name")) {
                this.#name = jObj["name"];
            }
            if (jObj.hasOwnProperty("username")) {
                this.#username = jObj["username"];
            }
            if (jObj.hasOwnProperty("password")) {
                this.#password = jObj["password"];
            }
            if (jObj.hasOwnProperty("email")) {
                this.#email = jObj["email"];
            }
            if (jObj.hasOwnProperty("phone")) {
                this.#phone = jObj["phone"];
            }
            if (jObj.hasOwnProperty("pin")) {
                this.#pin = jObj["pin"];
            }
            if (jObj.hasOwnProperty("isActive")) {
                this.#isActive = jObj["isActive"];
            }
        }
    }

    setUserId(userId) {
        this.#userId = userId
    }
    getUserId() {
        return this.#userId;
    }

    setName(name) {
        this.#name = name
    }
    getName() {
        return this.#name;
    }

    setUsername(username) {
        this.#username = username
    }
    getUsername() {
        return this.#username;
    }

    setPassword(password) {
        this.#password = password
    }
    getPassword() {
        return this.#password;
    }

    setEmail(email) {
        this.#email = email
    }
    getEmail() {
        return this.#email;
    }

    setPhone(phone) {
        this.#phone = phone
    }
    getPhone() {
        return this.#phone;
    }

    setPin(pin) {
        this.#pin = pin
    }
    getPin() {
        return this.#pin;
    }

    setIsActive(isActive) {
        this.#isActive = isActive
    }
    getIsActive() {
        return this.#isActive;
    }


}