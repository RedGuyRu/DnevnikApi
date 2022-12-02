const Dnevnik = require("..");
const {DateTime} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getAdditionalEducationGroups().then(e => {
    for (let additionalEducationGroup of e) {
        console.log(additionalEducationGroup.name);
    }
}).catch(e => console.log(e))