class TOTPRequested extends Error {
    constructor() {
        super("TOTP requested");
    }
}

module.exports = TOTPRequested;