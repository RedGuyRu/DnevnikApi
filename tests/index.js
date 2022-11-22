const Dnevnik = require("..");
const {DateTime} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getNotifications().then(e => {
    for (let notification of e) {
        if(notification.event_type === "create_homework") {
            console.log(notification.new_hw_description);
        }
    }
}).catch(e => console.log(e))