const Authenticator = require('./Authenticator');
const fs = require('fs');

class FileAuthenticator extends Authenticator {

    _studentId;
    _token;

    constructor(file) {
        super();
        let data = JSON.parse(fs.readFileSync(file).toString());
        this._studentId = data.studentId;
        this._token = data.token;
    }

    async authenticate() {
        return true;
    }

    async getStudentId() {
        return this._studentId;
    }

    async getToken() {
        return this._token;
    }


    async _setToken(token) {
        this._token = token;
    }
}

module.exports = FileAuthenticator;