/* Import dependencies, declare constants */
let Promise = require('bluebird'),
    ipRegex = require('ip-regex');

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

module.exports = (params, callback) => {
    getTimeZone('2601:646:0:3135:a0ed:d0e6:b1f2:1ac7')
        .then(function(res) {
            callback(null, res);
        }).catch(function(err) {
            callback(err, null);
        })
}

// module.exports = (params, callback) => {

//     let date = params.kwargs.date;
//     var error;
//     console.log(params.args, params.kwargs, params.remoteAddress)

//     if (date == undefined) {
//         error = 'Please specify a date argument';
//     } else if (Date.parse(date) == NaN) {
//         error = `date: ${date} is not valid. Try specifying a date in format: YYYY-MM-DD`;
//     }

//     if (error) {
//         return callback(error, null);
//     }

//     let parsedDate = new Date(date),
//         currentTime = Date.now();

//     let daysTil = Math.ceil((parsedDate - currentTime) / (1000 * 60 * 60 * 24)); // ms in a day

//     callback(null, `Days until ${parsedDate.toDateString()}: ${daysTil}`);
// };
