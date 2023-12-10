const eventAddresses = require("./eventAddresses");
const eventAbi = require("./eventAbi.json");
const ballotAddresses = require("./ballotAddresses");
const ballotAbi = require("./ballotAbi.json");
const boxAbi = require("./boxAbi.json");

const states = {
    0: "SETUP",
    1: "VOTING_PERIOD",
    2: "RESULTS",
};

const results = {
    0: "FOR",
    1: "AGAINST",
    2: "TIE",
};

module.exports = { eventAddresses, eventAbi, ballotAddresses, ballotAbi, boxAbi, states, results };
