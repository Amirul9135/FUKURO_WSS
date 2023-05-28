//Validator class by Amirul
//cara guna
//1 - require dlu dlm js file yg nk pakai
//2 - assign ke variable const nama = require tu
//3 - dlm middleware list call nama.check
// checkString untuk string, checkNumber untuk nombor
// check secukup rasa, last middleware call nama.validate()

class ValidateStr {
    constructor() {
    }

    validate() {
        //validate previous checks from the req object and return response 
        return function (req, res, next) {
            if (req.validationErrors == null) {
                next();
            }
            else {
                res.status(400).send({ validationError: req.validationErrors });
                req.validationErrors = null;
                return;
            }
        }
    }
    checkString(fieldName, limit, msg) {
        //1st param is always field name to be checked
        //2nd param can be either json of min/max OR string of message
        //3rd param is always message
        //cara pakai: call dlm middleware list
        //objectname.checkString(param1,param2,param3)
        //param 1 ni field ape yg nk check dlm request body JSON
        //param 2 ni kalau letak {min:nombor,max:nombor} xpon bole letak custom message tros
        //kalau nk check ada ke x je xperlu limit/msg xpe
        //kalau nk specify max sahaja/min sahaja pon bole {max:nombor}
        if (typeof limit === "string") {
            msg = limit;
            limit = null;
        }
        return this.#fullCheckStr(fieldName, limit, msg);
    }

    #fullCheckStr(fieldName, limit, msg) {
        //check the specified field wether it exist/match criteria
        //default/input error message will be appended to req if any
        return function (req, res, next) {
            var jsonArr = [];
            if (!Array.isArray(req.body)) {
                jsonArr.push(req.body);
            }
            else {
                jsonArr = req.body;
            }
            jsonArr.forEach(jsonObject => {
                if (jsonObject[fieldName] != null && jsonObject[fieldName].length > 0) {
                    if (limit != null) { //only check length if limit is specified 
                        if (limit.min == null) {//if min null assume 1
                            limit.min = 1;
                        }
                        var error = false;
                        var message = "invalid length ";
                        if (limit.max != null && jsonObject[fieldName].length > limit.max) {
                            error = true;
                            message += "limit exceeded";
                        }
                        if (jsonObject[fieldName].length < limit.min) {
                            error = true;
                            message += "less than minimum";
                        }
                        if (error) {
                            if (msg != null) {
                                message = msg;
                            }
                            if (req.validationErrors != null) {
                                req["validationErrors"][fieldName] = message;
                            }
                            else {
                                req.validationErrors = JSON.parse('{"' + fieldName + '":"' + message + '"}');
                            }
                        }
                    }
                }
                else {
                    var message = "incomplete/empty";
                    if (msg != null) {
                        message = msg;
                    }
                    if (req.validationErrors != null) {
                        req["validationErrors"][fieldName] = message;
                    }
                    else {
                        req.validationErrors = JSON.parse('{"' + fieldName + '":"' + message + '"}');
                    }
                }
            });
            next();
        }
    }


    checkNumber(fieldName, limit, msg) {
        if (typeof limit === "string") {
            msg = limit;
            limit = { min: null, max: null }
        }
        return this.#fullCheckNum(fieldName, limit, msg);
    }

    #fullCheckNum(fieldName, limit, msg) {
        return function (req, res, next) {
            var jsonArr = [];
            if (!Array.isArray(req.body)) {
                jsonArr.push(req.body);
            }
            else {
                jsonArr = req.body;
            }
            jsonArr.forEach(jsonObject => {
                if (jsonObject[fieldName] != null) {
                    if (/^[0-9]+\.?[0-9]*$/.test(jsonObject[fieldName])) {
                        var valid = true;
                        if (limit.min != null && jsonObject[fieldName] < limit.min) {
                            valid = false;
                        }
                        if (limit.max != null && jsonObject[fieldName] > limit.max) {
                            valid = false;
                        }
                        if (!valid) {
                            var message = "Number out of valid range";
                            if (msg != null)
                                message = msg;

                            if (req.validationErrors != null) {
                                req["validationErrors"][fieldName] = message;
                            }
                            else {
                                req.validationErrors = JSON.parse('{"' + fieldName + '":"' + message + '"}');
                            }
                        }

                    }
                    else {
                        var message = "Field value is not a number";
                        if (msg != null)
                            message = msg;

                        if (req.validationErrors != null) {
                            req["validationErrors"][fieldName] = message;
                        }
                        else {
                            req.validationErrors = JSON.parse('{"' + fieldName + '":"' + message + '"}');
                        }
                    }
                }
                else {
                    //empty
                    var message = "Field is empty";
                    if (msg != null)
                        message = msg;

                    if (req.validationErrors != null) {
                        req["validationErrors"][fieldName] = message;
                    }
                    else {
                        req.validationErrors = JSON.parse('{"' + fieldName + '":"' + message + '"}');
                    }
                }
            })
            next();
        }
    }
}

module.exports = new ValidateStr();