const Dnevnik = require("..");
const {DateTime, Duration} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getHomework(DateTime.now().minus(Duration.fromObject({week:1}))).then(e => {
    for (let subject of e) {
        console.log(subject.homework_entry.homework.subject.name + " " + subject.homework_entry.description);
    }
})