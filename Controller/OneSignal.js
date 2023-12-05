const OneSignal = require('onesignal-node');    
const config = require("config"); 

class OneSignalController{

    //user ids is array of string of the user id
    //message is the string of content
    #client
    constructor(appId,apiKey){
      this.#client = new OneSignal.Client(appId,apiKey)
    }

    async sendNotification(userIds,title, message,data){ 
        var notification = {
            headings: { en: title },
            contents: { 
              'en': message,
            }, 
            include_external_user_ids: userIds, 
            data:data
          };
          console.log("notification",notification)
          // or you can use promise style:
          this.#client.createNotification(notification)
            .then(response => {console.log("notification sent")})
            .catch(e => {console.log("one signal err " + e)}); 

    }
}

const FUKURO_OS = new OneSignalController(config.get("OSId"), config.get("OSKey")) 
module.exports = {
  OneSignalController,
  FUKURO_OS
}

