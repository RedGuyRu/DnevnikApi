const Dnevnik = require("..");
const {DateTime} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
Dnevnik.Client.getMeshAnswers(15987430).then(e => {
    for (let question of e) {
        console.log(question.question + " " + JSON.stringify(question.answer));
    }
}).catch(e => console.log(e))