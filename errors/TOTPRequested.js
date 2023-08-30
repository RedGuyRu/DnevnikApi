class IncorrectLoginPassword extends Error {
    constructor() {
        super("TOTP requested");
    }
}

module.exports = IncorrectLoginPassword;