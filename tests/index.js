const Dnevnik = require("..");
const {DateTime} = require("luxon");

(async () => {
    //let auth = new Dnevnik.PuppeteerAuthenticator(process.env.login, process.env.password, {headless: false, totp: process.env.totp});
    //let auth = new Dnevnik.PredefinedAuthenticator(process.env.student_id, process.env.token);
    let auth = new Dnevnik.FileAuthenticator("auth.json");
    await auth.init();
    await auth.authenticate();
    let client = new Dnevnik.Client(auth);
    await auth.refresh();
    await auth.save("auth.json");

    //console.log(await Dnevnik.Client.getAcademicYears());
    //console.log(await Dnevnik.Client.getCurrentAcademicYear());

    //console.log(await client.getSession());
    //console.log(await client.getProfile());
    //console.log(await client.getAverageMarks());
    //console.log(await client.getSubjects());
    //console.log(await client.getMarks(DateTime.now().minus({days: 7}), DateTime.now()));
    //console.log(await client.getHomework(DateTime.now(),DateTime.now()));
    //console.log(await client.getSchedule(DateTime.now().minus({days: 3})));
    //console.log(await client.getTeacher(4974274));
    //console.log(await client.getTeamsLinks(DateTime.now()))
    //console.log(await client.getMenu(DateTime.now().minus({day:2})))
    //console.log(await client.getPersonDetails());
    //console.log(await client.getUnreadAndImportantMessages());
    //console.log(await client.getSchedule());
    //console.log(await client.getScheduleShort());
    //console.log(await client.getAttendance());
    //console.log(await client.postAttendance(DateTime.now().plus({hour:5}), "Больничный"));
    //console.log(await client.deleteAttendance(DateTime.now().plus({hour:5})));
    //console.log(await client.getHomeworks(DateTime.now().minus({day:7}), DateTime.now()));
    //console.log(await client.getHomeworksShort(DateTime.now().minus({day:7}), DateTime.now()));
    console.log(await client.getSchoolInfo());
    //TODO: find new endpoint console.log(await client.getVisits(DateTime.now(),DateTime.now()));
    //TODO: find new endpoint console.log(await client.getBilling(DateTime.now(), DateTime.now()));
    //TODO: find new endpoint console.log(await client.getProgress());
    //console.log(await client.getAdditionalEducationGroups());
    //console.log(await client.getPerPeriodMarks());
    //console.log(await client.getTimePeriods())

    await auth.close();
})();
