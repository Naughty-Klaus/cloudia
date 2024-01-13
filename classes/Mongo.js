const fs = require('node:fs');
const { join } = require('node:path');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

const mongoose = require('mongoose');
const { mongoServer } = require(`${appDir}/config.json`);

module.exports = async () => {
  return await mongoose.connect(mongoServer);
};