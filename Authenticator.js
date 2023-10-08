const fs = require('fs');

class Authenticator {
    async init() {};
    async authenticate() {return false;};
    async getStudentId() {return null;};
    async getToken() {return null;};
    async close() {};
    async save(path) {
        let data = {
            studentId: await this.getStudentId(),
            token: await this.getToken()
        };
        fs.writeFileSync(path, JSON.stringify(data));
    };
}

module.exports = Authenticator;