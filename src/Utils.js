class Utils {
    static average(args) {
        return args.reduce((a, b) => a + b, 0) / args.length || 0;
    }

    static parseMarksWithWeight(marks) {
        let result = [];
        for (let mark of marks) {
            for (let i = 0; i < mark.weight; i++) {
                result.push(mark.mark);
            }
        }
        return result;
    }
}

module.exports = Utils;