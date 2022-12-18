const Dnevnik = require("..");
const {DateTime} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getTimePeriods().then(e => {
    for (let timePeriod of e) {
        console.log(timePeriod.name);
    }
}).catch(e => console.log(e))