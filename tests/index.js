const Dnevnik = require("..");
const {DateTime, Duration} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getSchedule(DateTime.now().minus(Duration.fromObject({week:1}))).then(e => {
    for (let a of e.activities) {
        if(a.type==="LESSON") {
            console.log(a.begin_time + ": " + a.lesson.subject_name);
        }
    }
})