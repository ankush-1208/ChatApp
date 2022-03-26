const moment = require("moment");

// function returns an object with the message data
// we will use this in the front end to display the message
function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format("h:mm a"),
  };
}

module.exports = formatMessage;
