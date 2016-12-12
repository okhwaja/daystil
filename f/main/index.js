/* Import dependencies, declare constants */
let ipRegex = require('ip-regex'),
    moment = require('moment-timezone'),
    Promise = require('bluebird');

let request = Promise.promisifyAll(require('request'));

let GEO_IP_URL='http://freegeoip.net/json'

/**
* Your function call
* @param {Object} params Execution parameters
*   Members
*   - {Array} args Arguments passed to function
*   - {Object} kwargs Keyword arguments (key-value pairs) passed to function
*   - {String} remoteAddress The IPv4 or IPv6 address of the caller
*
* @param {Function} callback Execute this to end the function call
*   Arguments
*   - {Error} error The error to show if function fails
*   - {Any} returnValue JSON serializable (or Buffer) return value
*/

// gets the timezone of the user's address
// Returns a Promise that resolves to a timezone on success
function getTimeZone(remoteAddress) {

    return Promise.resolve().then(function() {

        if (ipRegex({exact: true}).test(remoteAddress)) {

            return request
                .getAsync(GEO_IP_URL + '/' + remoteAddress)
                .then(function(res) {
                    if (res.statusCode != 200) {
                        throw res.body;
                    }

                    let data = JSON.parse(res.body);
                    return data.time_zone;
                })
                .catch(function(err) {
                    return err;
                })
        } else {
            throw `Unrecognized IP Address: ${remoteAddress}`;
        }
    });
}

function validateInputs(params) {
    return Promise.resolve().then(function() {
        let date = params.kwargs.date;

        if (date == undefined) {
            throw 'Please specify a date argument';
        } 
        if (Date.parse(date) == NaN) {
            throw `date: ${date} is not valid. Try specifying a date in format: YYYY-MM-DD`;
        }
    });
}

function generateDisplay(args) {
    let timezoneStr = args.timezone,
        date = args.date;

    let userDate = new Date();
    let destinationDate = moment.tz(date, timezoneStr).toDate();

    let daysTil = Math.ceil((destinationDate - userDate) / (1000 * 60 * 60 * 24)); // ms in a day

    return `Days until ${destinationDate.toDateString()}: ${daysTil}`;
}

module.exports = (params, callback) => {
    validateInputs(params).then(function() {
        // should be params.remoteAddress
        return getTimeZone('2601:646:0:3135:a0ed:d0e6:b1f2:1ac7')
    }).then(function(timezoneStr) {
        var args = {};
        args.timezone = timezoneStr;
        args.date = params.kwargs.date;
        return generateDisplay(args);
    }).then(function(res) {
        callback(null, res);
    }).catch(function(err) {
        callback(err, null);
    })
}
