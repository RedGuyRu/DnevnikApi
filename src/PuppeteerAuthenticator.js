const Authenticator = require('./Authenticator');
const Puppeteer = require('puppeteer');
const debug = require('debug')('PuppeteerAuthenticator');
const Totp = require("otplib");
const TimeoutError = require("./errors/TimeoutError");
const IncorrectLoginPassword = require("./errors/IncorrectLoginPassword");
const TOTPRequested = require("./errors/IncorrectLoginPassword");

class PuppeteerAuthenticator extends Authenticator {

    _browser = Puppeteer.Browser.prototype;
    _options = {};
    _login = "";
    _password = "";
    _authFinished = false;

    constructor(login, password, options = {}) {
        super();
        this._options = options;
        this._login = login;
        this._password = password;
        this._options.browser ??= null;
        this._options.headless ??= true;
        this._options.sandbox ??= true;
        this._options.disableAutomationControlled ??= true;
        this._options.browserArgs ??= [];
        this._options.totp ??= null;
    }

    async init() {
        if (this._options.browser === null) {
            let args = [];
            if (!this._options.sandbox) args.push('--no-sandbox');
            if (this._options.disableAutomationControlled) args.push('--disable-blink-features=AutomationControlled');
            for (let browserArg of this._options.browserArgs) {
                args.push(browserArg);
            }
            this._browser = await Puppeteer.launch({
                args,
                headless: this._options.headless
            });
        } else {
            this._browser = this._options.browser;
        }
    }

    async authenticate() {
        this._authFinished = false;
        await this.processAuth();
        return this._authFinished;
    }

    async getStudentId() {
        return this._studentId;
    }

    async getToken() {
        return this._token;
    }

    async trueInputText(page, toInput, inputSelector) {
        let inputted = "";
        while (inputted !== toInput) {
            await page.focus(inputSelector);
            for (let i = 0; i < inputted.length; i++) {
                await page.keyboard.press('Backspace');
            }
            await page.type(inputSelector, toInput, {delay: 100});
            inputted = await page.$eval(inputSelector, (input) => input.value);
        }
    }

    async trueInputAsyncText(page, toInput, inputSelector) {
        let inputted = "";
        while (inputted !== await toInput()) {
            await page.focus(inputSelector);
            for (let i = 0; i < inputted.length; i++) {
                await page.keyboard.press('Backspace');
            }
            await page.type(inputSelector, await toInput(), {delay: 100});
            inputted = await page.$eval(inputSelector, (input) => input.value);
        }
    }

    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    async close() {
        await this._browser.close();
        this._browser = null;
    }

    async processAuth() {
        let context = await this._browser.createBrowserContext();
        let page = await context.newPage();
        try {
            debug("Loading start page");
            await page.goto('https://school.mos.ru');
            await page.waitForSelector("#root > div > div.style_main-container__3z5Nv > main > section > div > div.style_sec-intro_left__2XBWp > div.style_sec-intro_aside__2Be41 > div > div.style_aside-login__3YTaH > div.style_aside-login_action__2KJI4 > div");
            await page.click("#root > div > div.style_main-container__3z5Nv > main > section > div > div.style_sec-intro_left__2XBWp > div.style_sec-intro_aside__2Be41 > div > div.style_aside-login__3YTaH > div.style_aside-login_action__2KJI4 > div");

            debug("Loading oauth page");
            await page.waitForSelector("#login");
            await this.trueInputText(page, this._login, "#login");
            await page.waitForSelector("#password");
            await this.trueInputText(page, this._password, "#password");
            await page.waitForSelector("#bind");

            debug("Authing");
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.continue(); //pass requests after enabling interception
            });
            await page.click("#bind");
            try {
                await page.click("#bind");
            } catch (e) {
            }

            // sms activation
            page.waitForSelector("#sms-code").then(async () => {
                if (this._options.totp !== null) {
                    debug("SMS request, redirecting to TOTP");
                    let url = page.url();
                    await page.goto(`https://login.mos.ru/sps/login/methods2/totp?` + url.substring(url.indexOf("?") + 1, url.length), {
                        referer: "https://school.mos.ru/"
                    });
                } else {
                    debug("SMS request, we cannot do anything");
                    throw new TOTPRequested();
                }
            }).catch((err) => {
                if (err instanceof TOTPRequested) {
                    throw err;
                }
            });

            // totp activation
            page.waitForSelector("#otp").then(async () => {
                if (this._options.totp !== null) {
                    debug("TOTP request");
                    await this.trueInputAsyncText(page, async () => await Totp.generate({secret: this._options.totp}), "#otp");
                    debug("TOTP sent");
                    await page.click("#save");
                } else {
                    debug("TOTP request, we cannot do anything");
                    throw new TOTPRequested();
                }
            }).catch((err) => {
                if (err instanceof TOTPRequested) {
                    throw err;
                }
            });

            // trust this browser
            page.waitForSelector("#content_wrapper > div.top.bc-top > h2", {
                visible: true,
                hidden: false,
                timeout: 60000
            }).then(async () => {
                debug("Trusting this browser");
                await page.waitForSelector("#agree", {visible: true, hidden: false});
                await page.click("#agree");
            }).catch(() => {
            });

            debug("Waiting for finish");
            let state = 0; //0 - wait, 1 - ok, 2 - incorrect password, 3 - mos.ru error
            await Promise.any([new Promise(async res => {
                try {
                    await page.waitForResponse("https://dnevnik.mos.ru/mobile/api/profile", {timeout: 60000})
                    debug("Got profile")
                    state = 1;
                    res(1);
                } catch (e) {
                }
            }), new Promise(async res => {
                try {
                    await page.waitForRequest((url) => {
                        return (url.url().startsWith("https://school.mos.ru/api/family/web/v1/profile"));
                    }, {timeout: 60000})
                    debug("Got family")
                    state = 1;
                    res(1);
                } catch (e) {
                }
            }), new Promise(async res => {
                try {
                    await page.waitForRequest((url) => {
                        return (url.url().startsWith("https://school.mos.ru/api/usersettings/v1/"));
                    }, {timeout: 60000})
                    debug("Got usersettings")
                    state = 1;
                    res(1);
                } catch (e) {
                }
            }), new Promise(async res => {
                try {
                    await page.waitForSelector("#gErrs > blockquote > div.blockquote-message");
                    debug("Password is incorrect")
                    state = 2;
                    res(2);
                } catch (e) {
                }
            }), new Promise(async res => {
                try {
                    await this.sleep(90000);
                    debug("Timeout exeded")
                    state = 3;
                    res(3);
                } catch (e) {
                }
            })]);

            switch (state) {
                case 1: {
                    let cookies = await context.cookies();
                    try {
                        await page.close();
                    } catch (e) {
                    }
                    try {
                        await context.close();
                    } catch (e) {
                    }

                    debug("Finished");
                    let profileId;
                    let profileRoles;
                    let authToken;
                    let userId;
                    for (let cookie of cookies) {
                        switch (cookie.name) {
                            case "profile_id":
                                profileId = cookie.value;
                                break;
                            case "profile_roles":
                                profileRoles = cookie.value;
                                break;
                            case "auth_token":
                                authToken = cookie.value;
                                break;
                            case "user_id":
                                userId = cookie.value;
                                break
                        }
                    }
                    this._authFinished = true;
                    this._studentId = Number.parseInt(profileId.toString());
                    this._token = authToken;
                    break;
                }
                case 2: {
                    throw new IncorrectLoginPassword();
                }
                case 3: {
                    throw new TimeoutError();
                }
            }
        } catch (e) {
            try {
                await page.close();
            } catch (e) {
            }
            try {
                await context.close();
            } catch (e) {
            }
            debug("Can't auth: " + e);
            throw e;
        }
    }


    async _setToken(token) {
        this._token = token;
    }
}

module.exports = PuppeteerAuthenticator;