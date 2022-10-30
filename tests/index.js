const Dnevnik = require("..");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getAverageMarks().catch(e => console.error(e)).then(e => {
    e.forEach(m => console.log(m.name + " " + m.mark));
});