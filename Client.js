const Axios = require('axios');
const Authenticator = require('./Authenticator');
const Luxon = require('luxon');
const Utils = require('./Utils');
const {DateTime} = require("luxon");

class Client {

    _authenticator = Authenticator.prototype;

    constructor(authenticator) {
        this._authenticator = authenticator;
    }

    async getProfile() {
        let res = await Axios.get("https://dnevnik.mos.ru/core/api/student_profiles/" + await this._authenticator.getStudentId(), {
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

        return res;
    }

    async getAverageMarks() {
        let report = await Axios.get("https://dnevnik.mos.ru/reports/api/progress/json?academic_year_id=" + (await Client.getCurrentAcademicYear()).id + "&student_profile_id=" + await this._authenticator.getStudentId(), {
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
}

module.exports = Client;