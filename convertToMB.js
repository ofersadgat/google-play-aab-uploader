module.exports = (size = 0, precision = 2) => Number((size / 1024 / 1024).toFixed(precision));
