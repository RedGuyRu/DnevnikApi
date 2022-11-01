const Dnevnik = require("..");
const {DateTime, Duration} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getMarks(DateTime.now().minus(Duration.fromObject({week:1}))).then(e => {
    for (let subject of e) {
        console.log(subject.subject_id + ": " + subject.values[0].grade.five);
    }
})