const os = require('os')

const platform = os.platform()

module.exports = platform === 'win32' ? require('./win') : (platform === 'darwin' ? require('./darwin') : require('./unix'))
