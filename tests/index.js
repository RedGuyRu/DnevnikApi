const Dnevnik = require("..");
const {DateTime} = require("luxon");

let client = new Dnevnik.Client(new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token));
client.getMenu().then(e => {
    for (let meal of e) {
        console.log(meal.meals.map(e => e.name).join(", "));
    }
}).catch(e => console.log(e))