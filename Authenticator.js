class Authenticator {
    async init() {};
    async authenticate() {return false;};
    async getStudentId() {return null;};
    async getToken() {return null;};
    async close() {};
}

module.exports = Authenticator;