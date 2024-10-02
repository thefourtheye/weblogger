const { format, transports } = require('winston');
const { combine, timestamp, prettyPrint, splat, json } = format;
const winston = require('winston');

winston.configure({
  format: combine(splat(), json(), timestamp(), prettyPrint()),
  transports: [
    new transports.File({ filename: 'sirulogger.log' }),
    new transports.Console()
  ]
});

export default winston;
