const Dnevnik = require("..");
const {DateTime} = require("luxon");

(async () => {
    let auth = new Dnevnik.PuppeteerAuthenticator(process.env.login, process.env.password, {headless: false, totp: process.env.totp});
    await auth.init();
    await auth.authenticate();
    let client = new Dnevnik.Client(auth);
    let profile = await client.getProfile();
    console.log(profile.class_unit.name);
    await auth.close();
})();