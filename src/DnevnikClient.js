const Axios = require('axios');
const Authenticator = require('./Authenticator');
const Luxon = require('luxon');
const Utils = require('./Utils');
const {DateTime, Interval} = require("luxon");
const AnswersParser = require("./AnswersParser");

class DnevnikClient {

    _authenticator = Authenticator.prototype;

    constructor(authenticator) {
        this._authenticator = authenticator;
    }

    /**
     *
     * @returns {Promise<Profile>}
     */
    async getProfile(options = {}) {
        options.with_groups ??= false;
        options.with_parents ??= false;
        options.with_assignments ??= false;
        options.with_ec_attendances ??= false;
        options.with_ae_attendances ??= false;
        options.with_home_based_periods ??= false;
        options.with_lesson_comments ??= false;
        options.with_attendances ??= false;
        options.with_final_marks ??= false;
        options.with_marks ??= false;
        options.with_subjects ??= false;
        options.with_lesson_info ??= false;
        let query = "";
        for (let key in options) {
            if (options[key]) query += key + "=true&";
        }
        let res = await Axios.get("https://dnevnik.mos.ru/core/api/student_profiles/" + await this._authenticator.getStudentId() + "?" + query.substring(0, query.length - 1), {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-Token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
            }
        });
        res = res.data;

        res.created_at = res.created_at == null ? null : Luxon.DateTime.fromFormat(res.created_at, "dd.MM.yyyy HH:mm");
        res.updated_at = res.updated_at == null ? null : Luxon.DateTime.fromFormat(res.updated_at, "dd.MM.yyyy HH:mm");
        res.deleted_at = res.deleted_at == null ? null : Luxon.DateTime.fromFormat(res.deleted_at, "dd.MM.yyyy HH:mm");
        res.birth_date = res.birth_date == null ? null : Luxon.DateTime.fromFormat(res.birth_date, "dd.MM.yyyy");
        res.left_on = res.left_on == null ? null : Luxon.DateTime.fromFormat(res.left_on, "dd.MM.yyyy");
        res.enlisted_on = res.enlisted_on == null ? null : Luxon.DateTime.fromFormat(res.enlisted_on, "dd.MM.yyyy");
        res.migration_date = res.migration_date == null ? null : Luxon.DateTime.fromFormat(res.migration_date, "dd.MM.yyyy");
        res.last_sign_in_at = res.last_sign_in_at == null ? null : Luxon.DateTime.fromFormat(res.last_sign_in_at, "dd.MM.yyyy HH:mm");
        res.left_on_registry = res.left_on_registry == null ? null : Luxon.DateTime.fromFormat(res.left_on_registry, "dd.MM.yyyy");

        for (let parent of res.parents) {
            parent.last_sign_in_at = parent.last_sign_in_at == null ? null : Luxon.DateTime.fromFormat(parent.last_sign_in_at, "dd.MM.yyyy HH:mm");
        }

        for (let group of res.groups) {
            group.begin_date = group.begin_date == null ? null : Luxon.DateTime.fromFormat(group.begin_date, "dd.MM.yyyy");
            group.end_date = group.end_date == null ? null : Luxon.DateTime.fromFormat(group.end_date, "dd.MM.yyyy");
        }

        for (let mark of res.marks) {
            mark.date = mark.date == null ? null : Luxon.DateTime.fromFormat(mark.date, "dd.MM.yyyy");
            mark.point_date = mark.point_date == null ? null : Luxon.DateTime.fromFormat(mark.point_date, "dd.MM.yyyy");
        }

        for (let finalMark of res.final_marks) {
            finalMark.created_at = finalMark.created_at == null ? null : Luxon.DateTime.fromFormat(finalMark.created_at, "dd.MM.yyyy HH:mm");
            finalMark.updated_at = finalMark.updated_at == null ? null : Luxon.DateTime.fromFormat(finalMark.updated_at, "dd.MM.yyyy HH:mm");
            finalMark.deleted_at = finalMark.deleted_at == null ? null : Luxon.DateTime.fromFormat(finalMark.deleted_at, "dd.MM.yyyy HH:mm");
        }

        return res;
    }

    /**
     *
     * @returns {Promise<ProfileV2>}
     */
    async getProfileV2() {
        let res = await Axios.get("https://school.mos.ru/api/family/web/v1/profile/", {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-Token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
                "x-mes-subsystem": "familyweb"
            }
        });
        res = res.data;

        res.profile = res.profile||{};
        res.profile.birth_date = res.profile.birth_date == null ? null : Luxon.DateTime.fromFormat(res.profile.birth_date, "dd.MM.yyyy");

        for (let child of res.children) {
            child.birth_date = child.birth_date == null ? null : Luxon.DateTime.fromFormat(child.birth_date, "dd.MM.yyyy");
            child.enrollment_date = child.enrollment_date == null ? null : Luxon.DateTime.fromFormat(child.enrollment_date, "dd.MM.yyyy");
            for (let representative of child.representatives) {
                representative.birth_date = representative.birth_date == null ? null : Luxon.DateTime.fromFormat(representative.birth_date, "dd.MM.yyyy");
            }
        }

        return res;
    }

    async getAverageMarks() {
        let report = await Axios.get("https://dnevnik.mos.ru/reports/api/progress/json?academic_year_id=" + (await DnevnikClient.getCurrentAcademicYear()).id + "&student_profile_id=" + await this._authenticator.getStudentId(), {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId()
            }
        });
        let result = [];
        for (let lesson of report.data) {
            if (lesson.periods.length !== 0) {
                let period = lesson.periods[lesson.periods.length - 1];
                let marks = [];
                for (let mark of period.marks) {
                    marks.push({mark: mark.values[0].five, weight: mark.weight});
                }

                result.push({"name": lesson.subject_name, "mark": Utils.average(Utils.parseMarksWithWeight(marks))});
            }
        }
        return result;
    }

    async getSubjects(lessons = []) {
        let report = await Axios.get("https://dnevnik.mos.ru/core/api/subjects?ids=" + lessons.join(","), {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId()
            }
        });

        return report.data;
    }

    async getMarks(from = DateTime.now(), to = DateTime.now()) {
        let report = await Axios.get("https://dnevnik.mos.ru/core/api/marks?created_at_from=" + from.setZone("Europe/Moscow").toFormat("dd.LL.y") + "&created_at_to=" + to.setZone("Europe/Moscow").toFormat("dd.LL.y") + "&student_profile_id=" + await this._authenticator.getStudentId(), {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId()
            }
        });

        for (let d of report.data) {
            d.created_at = DateTime.fromFormat(d.created_at, "dd.MM.yyyy HH:mm");
            d.updated_at = DateTime.fromFormat(d.updated_at, "dd.MM.yyyy HH:mm");
            d.date = DateTime.fromFormat(d.date, "dd.MM.yyyy");
        }

        return report.data;
    }

    async getHomework(from = DateTime.now(), to = DateTime.now()) {
        let report = await Axios.get("https://dnevnik.mos.ru/core/api/student_homeworks?begin_prepared_date=" + from.setZone("Europe/Moscow").toFormat("dd.LL.y") + "&end_prepared_date=" + to.setZone("Europe/Moscow").toFormat("dd.LL.y") + "&student_profile_id=" + await this._authenticator.getStudentId(), {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId()
            }
        });

        for (let d of report.data) {
            d.created_at = DateTime.fromFormat(d.created_at, "dd.MM.yyyy HH:mm");
            d.updated_at = d.updated_at == null ? null : DateTime.fromFormat(d.updated_at, "dd.MM.yyyy HH:mm");
            d.deleted_at = d.deleted_at == null ? null : DateTime.fromFormat(d.deleted_at, "dd.MM.yyyy HH:mm");

            d.homework_entry.created_at = DateTime.fromFormat(d.homework_entry.created_at, "dd.MM.yyyy HH:mm");
            d.homework_entry.updated_at = d.homework_entry.updated_at == null ? null : DateTime.fromFormat(d.homework_entry.updated_at, "dd.MM.yyyy HH:mm");
            d.homework_entry.deleted_at = d.homework_entry.deleted_at == null ? null : DateTime.fromFormat(d.homework_entry.deleted_at, "dd.MM.yyyy HH:mm");

            d.homework_entry.homework.created_at = DateTime.fromFormat(d.homework_entry.homework.created_at, "dd.MM.yyyy HH:mm");
            d.homework_entry.homework.updated_at = d.homework_entry.homework.updated_at == null ? null : DateTime.fromFormat(d.homework_entry.homework.updated_at, "dd.MM.yyyy HH:mm");
            d.homework_entry.homework.deleted_at = d.homework_entry.homework.deleted_at == null ? null : DateTime.fromFormat(d.homework_entry.homework.deleted_at, "dd.MM.yyyy HH:mm");
            d.homework_entry.homework.date_assigned_on = DateTime.fromFormat(d.homework_entry.homework.date_assigned_on, "dd.MM.yyyy");
            d.homework_entry.homework.date_prepared_for = DateTime.fromFormat(d.homework_entry.homework.date_prepared_for, "dd.MM.yyyy");
        }

        return report.data;
    }

    async getEvents(from = DateTime.now(), to = DateTime.now(), expand = {}, person_id = null) {
        if (person_id == null) {
            let profile = await this.getProfile();
            person_id = profile.person_id;
        }
        let ex = [];
        Object.keys(expand).forEach(key => {
            if (expand[key]) ex.push(key);
        });
        let report = await Axios.get(encodeURI(`https://school.mos.ru/api/eventcalendar/v1/api/events?person_ids=${person_id}&begin_date=${from.setZone("Europe/Moscow").toFormat("yyyy-MM-dd")}&end_date=${to.setZone("Europe/Moscow").toFormat("yyyy-MM-dd")}&expand=${ex.join(",")}`), {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-Token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
                "authorization": "Bearer " + await this._authenticator.getToken(),
                "x-mes-role": "student",
                "x-mes-subsystem": "familyweb"
            }
        });

        for (let event of report.data.response) {
            event.start_at = DateTime.fromISO(event.start_at);
            event.finish_at = DateTime.fromISO(event.finish_at);
            if(event.created_at)
                event.created_at = DateTime.fromISO(event.created_at);
            if(event.updated_at)
                event.updated_at = DateTime.fromISO(event.updated_at);
            if(event.registration_start_at)
                event.registration_start_at = DateTime.fromISO(event.registration_start_at);
            if(event.registration_end_at)
                event.registration_end_at = DateTime.fromISO(event.registration_end_at);
        }

        return report.data;
    }

    async getTeacher(id) {
        let report = await Axios.get("https://dnevnik.mos.ru/core/api/teacher_profiles/" + id, {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId()
            }
        });

        report.data.created_at = DateTime.fromFormat(report.data.created_at, "yyyy-MM-dd");
        report.data.updated_at = report.data.updated_at == null ? null : DateTime.fromFormat(report.data.updated_at, "yyyy-MM-dd");
        report.data.deleted_at = report.data.deleted_at == null ? null : DateTime.fromFormat(report.data.deleted_at, "yyyy-MM-dd");
        for (let building of report.data.buildings) {
            building.created_at = building.created_at == null ? null : DateTime.fromFormat(building.created_at, "yyyy-MM-dd");
            building.updated_at = building.updated_at == null ? null : DateTime.fromFormat(building.updated_at, "yyyy-MM-dd");
            building.deleted_at = building.deleted_at == null ? null : DateTime.fromFormat(building.deleted_at, "yyyy-MM-dd");
        }
        for (let room of report.data.rooms) {
            room.created_at = room.created_at == null ? null : DateTime.fromFormat(room.created_at, "yyyy-MM-dd");
            room.updated_at = room.updated_at == null ? null : DateTime.fromFormat(room.updated_at, "yyyy-MM-dd");
            room.deleted_at = room.deleted_at == null ? null : DateTime.fromFormat(room.deleted_at, "yyyy-MM-dd");
        }

        return report.data;
    }

    async getTeamsLinks(date = DateTime.now()) {
        let schedule = await this.getSchedule(date);

        let links = [];

        for (let lesson of schedule.response) {
            if (lesson.type !== "LESSON") continue;
            if (lesson.lesson.lesson_type !== "REMOTE") continue;
            let report = await Axios.get("https://dnevnik.mos.ru/vcs/links?scheduled_lesson_id=" + lesson.lesson.schedule_item_id, {
                headers: {
                    Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                    "Auth-token": await this._authenticator.getToken(),
                    "Profile-Id": await this._authenticator.getStudentId()
                }
            });
            if (report.status === 204) continue;
            links.push({lesson: lesson, link: report.data._embedded.link_views[0].link_url});
        }

        return links;
    }

    async getPersonDetails() {
        let profile = await this.getProfile();
        let report = await Axios.get(`https://school.mos.ru/api/family/mobile/v1/person-details/?contingent_guid=${profile.person_id}&profile_id=${await this._authenticator.getStudentId()}`, {
            headers: {
                "x-mes-subsystem": "familymp",
                "auth-token": await this._authenticator.getToken()
            }
        });
        report = report.data;

        return report;
    }

    async getSchedule(date = DateTime.now()) {
        let report = await Axios.get(`https://school.mos.ru/api/family/mobile/v1/schedule/?student_id=${await this._authenticator.getStudentId()}&date=${date.toFormat("yyyy-MM-dd")}`, {
            headers: {
                "x-mes-subsystem": "familymp",
                "auth-token": await this._authenticator.getToken()
            }
        });
        report = report.data;

        report.date = DateTime.fromFormat(report.date, "yyyy-MM-dd");

        report.activities.forEach(activity => {
            if(activity.begin_utc) activity.begin_utc = DateTime.fromSeconds(activity.begin_utc,{zone:"utc"});
            if(activity.end_utc) activity.end_utc = DateTime.fromSeconds(activity.end_utc,{zone:"utc"});
        })

        return report;
    }

    async getScheduleShort(dates = [DateTime.now()]) {
        let report = await Axios.get(`https://school.mos.ru/api/family/mobile/v1/schedule/short/?student_id=${await this._authenticator.getStudentId()}&dates=${dates.map(date => date.toFormat("yyyy-MM-dd")).join(",")}`, {
            headers: {
                "x-mes-subsystem": "familymp",
                "auth-token": await this._authenticator.getToken()
            }
        });
        report = report.data.payload;

        report.forEach(day => {
            day.date = DateTime.fromFormat(day.date, "yyyy-MM-dd");
        })

        return report;
    }

    async getAttendance() {
        let report = await Axios.get(`https://school.mos.ru/api/family/mobile/v1/attendance/?student_id=${await this._authenticator.getStudentId()}`, {
            headers: {
                "x-mes-subsystem": "familymp",
                "auth-token": await this._authenticator.getToken()
            }
        });
        report = report.data;
        report.attendance.forEach(attendance => {
            attendance.date = DateTime.fromFormat(attendance.date, "yyyy-MM-dd")
        })
        return report;
    }

    async postAttendance(date, description = "болезнь", reason_id = 6) {
        let report = await Axios.post(`https://school.mos.ru/api/family/mobile/v1/attendance/`, {
            student_id: await this._authenticator.getStudentId(),
            notifications: [{
                date: date.toFormat("yyyy-MM-dd"),
                reason_id,
                description
            }]
        },{
            headers: {
                "x-mes-subsystem": "familymp",
                "auth-token": await this._authenticator.getToken()
            }
        });
        report = report.data;
        return report;
    }

    async deleteAttendance(date) {
        let report = await Axios.delete(`https://school.mos.ru/api/family/mobile/v1/attendance/`, {
            student_id: await this._authenticator.getStudentId(),
            notifications: [{
                date: date.toFormat("yyyy-MM-dd")
            }]
        },{
            headers: {
                "x-mes-subsystem": "familymp",
                "auth-token": await this._authenticator.getToken()
            }
        });
        report = report.data;
        return report;
    }

    async getHomeworks(from = DateTime.now(), to = DateTime.now()) {
        let report = await Axios.get(`https://school.mos.ru/api/family/mobile/v1/homeworks/?student_id=${await this._authenticator.getStudentId()}&from=${from.toFormat("yyyy-MM-dd")}&to=${to.toFormat("yyyy-MM-dd")}`, {
            headers: {
                "x-mes-subsystem": "familymp",
                "auth-token": await this._authenticator.getToken()
            }
        });
        report = report.data.payload;
        return report;
    }

    async getHomeworksShort(from = DateTime.now(), to = DateTime.now()) {
        let report = await Axios.get(`https://school.mos.ru/api/family/mobile/v1/homeworks/short?student_id=${await this._authenticator.getStudentId()}&from=${from.toFormat("yyyy-MM-dd")}&to=${to.toFormat("yyyy-MM-dd")}`, {
            headers: {
                "x-mes-subsystem": "familymp",
                "auth-token": await this._authenticator.getToken()
            }
        });
        report = report.data.payload;
        return report;
    }

    async getUnreadAndImportantMessages() {
        let report = await Axios.get(`https://dnevnik.mos.ru/core/api/messages/count_unread_and_important`, {
            headers: {
                "Auth-Token": await this._authenticator.getToken()
            }
        });
        report = report.data;

        return report;
    }

    async getMenu(date = DateTime.now()) {
        let report = await Axios.get("https://school.mos.ru/api/family/mobile/v1/menu/buffet/?date="+date.toFormat("yyyy-MM-dd"), {
            headers: {
                "x-mes-subsystem": "familymp",
                "auth-token": await this._authenticator.getToken(),
            }
        });
        report = report.data;

        return report.menu;
    }

    async getNotifications() {
        let report = await Axios.get("https://school.mos.ru/api/family/mobile/v1/notifications/search?student_id=" + await this._authenticator.getStudentId(), {
            headers: {
                "Auth-token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
                "x-mes-subsystem": "familymp"
            }
        });
        report = report.data;

        for (let notification of report) {
            notification.datetime = DateTime.fromFormat(notification.datetime, "yyyy-MM-dd HH:mm:ss.SSS");
            notification.created_at = DateTime.fromFormat(notification.created_at, "yyyy-MM-dd HH:mm:ss.SSS");
            notification.updated_at = DateTime.fromFormat(notification.updated_at, "yyyy-MM-dd HH:mm:ss.SSS");

            switch (notification.event_type) {
                case "update_mark":
                case "create_mark": {
                    notification.lesson_date = DateTime.fromFormat(notification.lesson_date, "yyyy-MM-dd HH:mm:ss");
                    break;
                }
                case "create_homework":
                case "update_homework": {
                    notification.new_date_assigned_on = DateTime.fromFormat(notification.new_date_assigned_on, "yyyy-MM-dd HH:mm:ss");
                    notification.new_date_prepared_for = DateTime.fromFormat(notification.new_date_prepared_for, "yyyy-MM-dd HH:mm:ss");
                }
            }
        }

        return report;
    }

    async getVisits(from = DateTime.now(), to = DateTime.now(), useV2Profile = true) {
        let ispp;
        if(useV2Profile) {
            let profile = await this.getProfileV2();
            ispp = profile.children.find(child => child.contract_id).contract_id;
        } else {
            let profile = await this.getProfile();
            ispp = profile.ispp_account;
        }
        let report = await Axios.get("https://school.mos.ru/api/family/web/v1/visits?from=" + from.setZone("Europe/Moscow").toFormat("yyyy-MM-dd") + "&to=" + to.setZone("Europe/Moscow").toFormat("yyyy-MM-dd") + "&contract_id=" + ispp, {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-Token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
                "x-mes-subsystem": "familyweb"
            }
        });
        report = report.data;

        for (let visit of report.payload) {
            visit.date = DateTime.fromFormat(visit.date, "yyyy-MM-dd");
            for (let enter of visit.visits) {
                if (enter.in.includes(":"))
                    enter.in = visit.date.setZone("Europe/Moscow").set({
                        hour: enter.in.split(":")[0],
                        minute: enter.in.split(":")[1]
                    });
                if (enter.out.includes(":"))
                    enter.out = visit.date.setZone("Europe/Moscow").set({
                        hour: enter.out.split(":")[0],
                        minute: enter.out.split(":")[1]
                    });
            }
        }

        return report.payload;
    }

    async getBilling(from = DateTime.now(), to = DateTime.now()) {
        let profile = await this.getProfile();
        let report = await Axios.get("https://dnevnik.mos.ru/mobile/api/billing?from=" + from.setZone("Europe/Moscow").toFormat("yyyy-MM-dd") + "&to=" + to.setZone("Europe/Moscow").toFormat("yyyy-MM-dd") + "&contract_id=" + profile.ispp_account, {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-Token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
            }
        });
        report = report.data;

        for (let bill of report.payload) {
            bill.date = DateTime.fromFormat(bill.date, "yyyy-MM-dd");
            for (let detail of bill.details) {
                detail.time = DateTime.fromFormat(bill.date + " " + detail.time, "yyyy-MM-dd HH:mm");
            }
        }

        return report;
    }

    async getProgress() {
        let profile = await this.getProfile();
        let report = await Axios.get("https://dnevnik.mos.ru/mobile/api/programs/parallel_curriculum/" + profile.curricula.id + "?student_id=" + await this._authenticator.getStudentId(), {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-Token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
            }
        });
        report = report.data;

        return report;
    }

    async getAdditionalEducationGroups() {
        let report = await Axios.get("https://dnevnik.mos.ru/ae/api/ae_groups?student_ids=" + await this._authenticator.getStudentId(), {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-Token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
            }
        });
        report = report.data;

        return report;
    }

    async getPerPeriodMarks() {
        let report = await Axios.get("https://dnevnik.mos.ru/reports/api/progress/json?academic_year_id=" + (await DnevnikClient.getCurrentAcademicYear()).id + "&student_profile_id=" + await this._authenticator.getStudentId(), {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-Token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
            }
        });
        report = report.data;

        for (let subjectMark of report) {
            for (let period of subjectMark.periods) {
                period.start = DateTime.fromFormat(period.start_iso, "yyyy-MM-dd");
                period.end = DateTime.fromFormat(period.end_iso, "yyyy-MM-dd");
            }
        }

        return report;
    }

    async getTimePeriods() {
        let report = await Axios.get("https://dnevnik.mos.ru/core/api/periods_schedules?academic_year_id=" + (await DnevnikClient.getCurrentAcademicYear()).id + "&student_id=" + await this._authenticator.getStudentId(), {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-Token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
            }
        });
        report = report.data;

        for (let rep of report) {
            for (let period of rep.periods) {
                period.begin_date = period.begin_date == null ? null : DateTime.fromFormat(period.begin_date, "yyyy-MM-dd");
                period.end_date = period.end_date == null ? null : DateTime.fromFormat(period.end_date, "yyyy-MM-dd");
            }
        }

        return report;
    }

    async getSchoolInfo() {
        let profile = await this.getProfile();
        let report = await Axios.get(`https://school.mos.ru/api/family/web/v1/school_info?class_unit_id=${profile.class_unit.id}&school_id=${profile.school_id}`, {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + "; student_id=" + await this._authenticator.getStudentId() + ";",
                "Auth-Token": await this._authenticator.getToken(),
                "Profile-Id": await this._authenticator.getStudentId(),
                "authorization": await this._authenticator.getToken(),
                "profile-type": "student",
                "profile-id": await this._authenticator.getStudentId(),
                "x-mes-subsystem": "familyweb"
            }
        });
        report = report.data;

        return report;
    }

    async getSession() {
        let report = await Axios.post("https://dnevnik.mos.ru/lms/api/sessions", {
            auth_token: await this._authenticator.getToken(),
        }, {
            headers: {
                Cookie: "auth_token=" + await this._authenticator.getToken() + ";",
            }
        });
        report = report.data;
        return report;
    }

    static async getAcademicYears() {
        let res = await Axios.get("https://dnevnik.mos.ru/core/api/academic_years");
        res = res.data;
        for (let year of res) {
            year.begin_date = DateTime.fromFormat(year.begin_date, "yy-MM-dd");
            year.end_date = DateTime.fromFormat(year.end_date, "yy-MM-dd");
        }
        return res;
    }

    static async getCurrentAcademicYear() {
        let res = await this.getAcademicYears();
        for (let year of res) {
            if (year.current_year) {
                return year;
            }
        }
        return null;
    }

    static async getMeshAnswers(variant, context_type = "homework") {
        //Статичный токен гостя который удивительным образом имеет доступ к ответам
        let guestToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        let guestId = 1000000000;
        let responsesReport = await Axios.post("https://uchebnik.mos.ru/exam/rest/secure/testplayer/group",
            {"test_type": "training_test", "generation_context_type": context_type, "generation_by_id": variant},
            {
                headers: {
                    Cookie: "auth_token=" + guestToken + "; profile_id=" + guestId + "; udacl=resh; profile_type=demo; user_id=" + guestId + ";"
                }
            });

        if (responsesReport === undefined || responsesReport.status !== 200) {
            return [];
        }
        responsesReport = responsesReport.data;

        let responses = [];

        for (let trainingTask of responsesReport.training_tasks) {
            let q = AnswersParser.parseQuestion(trainingTask.test_task.question_elements)
            let task = {
                question: q.text,
                question_attachments: q.files,
                answer: AnswersParser.parseAnswer(trainingTask.test_task.answer)
            };
            responses.push(task);
        }

        return responses;
    }
}

module.exports = DnevnikClient;