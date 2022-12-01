const Dnevnik = require("..");
const {DateTime} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getProgress().then(e => {
    for (let section of e.sections) {
        for (let subject of section.subjects) {
            console.log(subject.subject_name + " " + subject.passed_hours/subject.total_hours*100 + "%");
        }
    }
}).catch(e => console.log(e))