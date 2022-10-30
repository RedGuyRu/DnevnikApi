const Dnevnik = require("..");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getSubjects().then(e => {
    for (let subject of e) {
        console.log(subject.name);
    }
})