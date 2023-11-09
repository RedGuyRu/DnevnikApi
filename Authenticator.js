const fs = require('fs');
const axios = require("axios");

class Authenticator {
    async init() {
    };

    async authenticate() {
        return false;
    };

    async getStudentId() {
        return null;
    };

    async getToken() {
        return null;
    };

    async close() {
    };

    async save(path) {
        let data = {
            studentId: await this.getStudentId(),
            token: await this.getToken()
        };
        fs.writeFileSync(path, JSON.stringify(data));
    };

    async refresh() {
        let req = await axios.get("https://school.mos.ru/v2/token/refresh", {
            headers: {
                cookies: "cluster=0; aupd_current_role=2%3A1",
                Authorization: "Bearer " + (await this.getToken())
            }
        });

        await this._setToken(req.data);
    }

    async _setToken(token) {
    }
}

module.exports = Authenticator;