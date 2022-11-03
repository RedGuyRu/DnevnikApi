const Dnevnik = require("..");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getTeacher(2483049).then(e => {
    console.log(e.user.first_name+" "+e.user.middle_name);
}).catch(e => console.log(e))