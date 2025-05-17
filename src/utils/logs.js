const { inspect } = require('node:util');

const color = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',

  red: '\x1b[31m',
  orange: '\x1b[38;5;202m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  pink: '\x1b[38;5;213m',
  torquise: '\x1b[38;5;45m',
  purple: '\x1b[38;5;57m',
};

function pad(n) {
  return n < 10 ? '0' + n : n;
}

function getTimestamp() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function write(message = '', levelColor = color.yellow, levelName = 'INFO', useColors = true, useErrorConsole = false) {
  let msgStr;
  if (typeof message === 'string') {
    msgStr = message;
  } else {
    msgStr = inspect(message, { depth: 3, colors: useColors });
  }
  const lines = msgStr.split('\n');
  const prefix = `${levelColor}${color.bold}[${levelName}]${color.reset} ${color.yellow}[${getTimestamp()}]${color.reset} - `;
  const out = useErrorConsole ? console.error : console.log;

  lines.forEach((line, i) => {
    if (i === 0) {
      out(prefix + line);
    } else {
      out('  ' + line);
    }
  });
}

function info(msg) {
  write(msg, color.yellow, 'INFO');
}
function warn(msg) {
  write(msg, color.orange, 'WARN');
}
function error(msg) {
  write(msg, color.red, 'ERROR', false, true);
}
function success(msg) {
  write(msg, color.green, 'SUCCESS');
}
function debug(msg) {
  write(msg, color.blue, 'DEBUG');
}
function logging(msg) {
  write(msg, color.pink, 'LOG');
}
function torquise(msg) {
  write(msg, color.torquise, 'TORQUISE');
}
function purple(msg) {
  write(msg, color.purple, 'PURPLE');
}

module.exports = { getTimestamp, write, info, warn, error, success, debug, logging, torquise, purple, color };
