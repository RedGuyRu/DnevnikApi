const Dnevnik = require("..");
const {DateTime} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getPerPeriodMarks().then(e => {
    for (let subjectMark of e) {
        console.log(subjectMark.subject_name,subjectMark.periods.map(e => e.avg_five).join(" "));
    }
}).catch(e => console.log(e))