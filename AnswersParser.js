const util = require("util");
const latexToUnicode = require('latex-to-unicode');
const debug = require("debug")("AnswersParser");

String.prototype.insert = function (index, string) {
    if (index > 0) {
        return this.substring(0, index) + string + this.substring(index);
    }

    return string + this;
};

class AnswersParser {
    static parseQuestion(question = []) {
        let result = {text: "", files: []};
        for (let questionElement of question) {
            switch (questionElement.type) {
                case "content/text": {
                    result.text = this.parseOptionText(questionElement);
                    break;
                }
                case "content/atomic":
                    result.files.push(questionElement.relative_url);
                    break;
                case "content/file":
                    result.files.push(questionElement.file.relative_url);
                    break;
                default:
                    debug("Question type not defined! context: " + JSON.stringify(questionElement));
                    break;
            }
        }
        return result;
    }

    static parseAnswer(answer) {
        let result = {};
        switch (answer.type) {
            case "answer/number":
                result.number = answer.right_answer.number;
                result.type = "number";
                break;
            case "answer/single":
                result.text = this.parseOption(answer.options, answer.right_answer.id);
                result.type = "text";
                break;
            case "answer/match": {
                result.map = {};
                for (let matchKey in answer.right_answer.match) {
                    if (answer.right_answer.match.hasOwnProperty(matchKey)) {
                        let res = [];
                        for (let answ of answer.right_answer.match[matchKey]) {
                            res.push(this.parseOption(answer.options, answ));
                        }
                        result.map[this.parseOption(answer.options, matchKey)] = res;
                    }
                }
                result.type = "map";
                break;
            }
            case "answer/multiple": {
                result.texts = [];
                for (let id of answer.right_answer.ids) {
                    result.texts.push(this.parseOption(answer.options, id));
                }
                result.type = "texts";
                break;
            }
            case "answer/free":
                result.type = "free";
                break;
            case "answer/groups": {
                result.map = {};
                for (let group of answer.right_answer.groups) {
                    let res = [];
                    for (let answ of group.options_ids) {
                        res.push(this.parseOption(answer.options, answ));
                    }
                    result.map[this.parseOption(answer.options, group.group_id)] = res;
                }
                result.type = "map";
                break;
            }
            case "answer/string":
                result.text = answer.right_answer.string;
                result.type = "text";
                break;
            case "answer/table": {
                result.map = {};
                try {
                    for (let CellId in answer.right_answer.cells) {
                        let res = [];
                        if (answer.options[0].content[0].table.cells[CellId] !== undefined) {
                            for (let answ of Object.values(answer.options[0].content[0].table.cells[CellId])) {
                                res.push(answ);
                            }
                        }
                        for (let answ of Object.values(answer.right_answer.cells[CellId])) {
                            res.push(answ);
                        }
                        result.map[CellId] = res;
                    }
                } catch (e) {
                    debug("Strange object received, " + e.message + "\n" + util.inspect(answer, false, null, true));
                }
                result.type = "map";
                break;
            }
            case "answer/order": {
                result.texts = [];
                for (let id of answer.right_answer.ids_order) {
                    result.texts.push(this.parseOption(answer.options, id));
                }
                result.type = "texts";
                break
            }
            case "answer/inline/choice/single": {
                result.texts = [];
                for (let posId of answer.right_answer.text_position_answer) {
                    let textPosition = answer.text_position.find(pos => pos.position_id === posId.position_id);
                    result.texts.push(this.parseOption(textPosition.options, posId.id));
                }
                result.type = "texts";
                break;
            }
            default:
                debug("Answer type not defined! context: " + util.inspect(answer, false, null, true));
                break;
        }
        return result;
    }

    static parseOption(options, id) {
        let option = options[options.findIndex(p => p.id === id)];
        return (this.parseOptionText(option) + " " +
            option.content.filter(p => p.type === "content/file").map(p => "https://uchebnik.mos.ru/webtests/exam" + p.file.relative_url).join(" ") + " " +
            option.content.filter(p => p.type === "content/atomic").map(p => p.relative_url).join(" ")).trim();
    }

    static parseOptionText(option) {
        let text = option.text + "";
        let offset = 0;
        for (let contentElement of option.content) {
            switch (contentElement.type) {
                case "content/math":
                    let txt = " " + latexToUnicode(contentElement.content) + " ";
                    text = text.insert(contentElement.position + offset, txt);
                    offset += txt.length;
                    break;
            }
        }
        text = text.split("­").join("");
        return text;
    }
}

module.exports = AnswersParser;