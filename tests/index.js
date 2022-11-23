const Dnevnik = require("..");
const {DateTime} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getVisits(DateTime.now().minus({month:1})).then(e => {
    for (let visitDay of e) {
        console.log(visitDay.date.toFormat("dd.MM.yyyy"));
        for (let visit of visitDay.visits) {
            console.log("- "+visit.in.toFormat("HH:mm"));
        }
    }
}).catch(e => console.log(e))