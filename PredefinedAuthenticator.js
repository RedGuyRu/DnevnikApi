const Authenticator = require('./Authenticator');

class PredefinedAuthenticator extends Authenticator {

    _studentId;
    _token;

    constructor(studentId, token) {
        super();
        this._studentId = studentId;
        this._token = token;
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
}

module.exports = PredefinedAuthenticator;