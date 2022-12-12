class TimeoutError extends Error {
    constructor() {
        super("Login timeout");
    }
}

module.exports = TimeoutError;