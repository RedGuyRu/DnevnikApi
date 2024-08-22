class IncorrectLoginPassword extends Error {
    constructor() {
        super("Incorrect login or password");
    }
}

module.exports = IncorrectLoginPassword;