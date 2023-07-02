const OneSignal = require('onesignal-node');    

const client = new OneSignal.Client('aeb81c01-4529-41bb-b7be-fb6be3dbece7', 'ZTI5MTA5YjEtMTRhYi00ZDFkLWE5MTgtODY4NWI5OGQ0ZjQ1');

module.exports = class OneSignalController{

    //user ids is array of string of the user id
    //message is the string of content

    static async sendNotification(userIds, message){
        const notification = {
            contents: { 
              'en': message,
            }, 
            include_external_user_ids: userIds
          };
        
          try {
            const response = await client.createNotification(notification);
            console.log(response.body.id);
          } catch (e) {
            if (e instanceof OneSignal.HTTPError) {
              // When status code of HTTP response is not 2xx, HTTPError is thrown.
              console.log(e.statusCode);
              console.log(e.body);
            }
          }
          
          // or you can use promise style:
          client.createNotification(notification)
            .then(response => {})
            .catch(e => {});

    }
}
