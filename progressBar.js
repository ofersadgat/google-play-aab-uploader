const _colors = require('colors');

module.exports = {
  format: `${_colors.red(' {bar}')} {percentage}% | {value}/{total}MB`,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
};
