const OneSignal = require('onesignal-node');     

class OneSignalController{

    //user ids is array of string of the user id
    //message is the string of content
    #client
    constructor(appId,apiKey){
      this.#client = new OneSignal.Client(appId,apiKey)
    }

    async sendNotification(userIds, message){
        var notification = {
            contents: { 
              'en': message,
            }, 
            include_external_user_ids: userIds
          };
         
          // or you can use promise style:
          this.#client.createNotification(notification)
            .then(response => {})
            .catch(e => {});

    }
}

const FUKURO_OS = new OneSignalController('aeb81c01-4529-41bb-b7be-fb6be3dbece7', 'ZTI5MTA5YjEtMTRhYi00ZDFkLWE5MTgtODY4NWI5OGQ0ZjQ1')

module.exports = {
  OneSignalController,
  FUKURO_OS
}

