const Dnevnik = require("..");
const {DateTime} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getTeamsLinks(DateTime.now().minus({day:1})).then(e => {
    for (let teamsLink of e) {
        console.log(teamsLink.link);
    }
}).catch(e => console.log(e))