const Dnevnik = require("..");
const {DateTime} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getBilling(DateTime.now().minus({month:5}), DateTime.now().plus({month:1})).then(e => {
    console.log(e.balance/100)
}).catch(e => console.log(e))