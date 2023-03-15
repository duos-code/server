const generateRandom = () => {
    return Math.random().toString(26).slice(10) + "-" +
        Math.random().toString(26).slice(10) + "-" +
        Math.random().toString(26).slice(10);
}
module.exports = generateRandom;