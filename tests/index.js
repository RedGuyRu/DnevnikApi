const Dnevnik = require("..");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getProfile().catch(e => console.error(e)).then(e => console.log(e.user_name));