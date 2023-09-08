const path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        filename: 'slugify.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'slugifyMulti',
            type: 'var',
            export: 'default',
        },
    }
};