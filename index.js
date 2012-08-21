var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;

module.exports = function (files, opts) {
    if (!opts) opts = {};
    if (!files) files = [];
    if (!Array.isArray(files)) files = [ files ];
    if (opts.ext && !/^\./.test(opts.ext)) opts.ext = '.' + opts.ext;
    var emitter = new EventEmitter;
    
    var pending = files.length;
    files.forEach(function (file) {
        var ext = path.extname(file);
        var invalid_ext = (
            ext === '.js' // already a js file, NICE TRY
            || (opts.ext && ext !== opts.ext)
        );
        if (invalid_ext) {
            pending -= 1;
            return;
        }

        var rs = fs.createReadStream(file);
        rs.on('error', emitter.emit.bind(emitter, 'error'));
        var ws = fs.createWriteStream(file + '.js');
        ws.on('error', emitter.emit.bind(emitter, 'error'));
        
        ws.write('module.exports="');
        rs.on('data', function (buf) {
            var s = JSON.stringify(String(buf)).slice(1,-1); // chop off the "s
            ws.write(s);
        });
        rs.on('end', function () {
            ws.end('"\n');
            emitter.emit('export', file);
            if (--pending === 0) emitter.emit('end');
        });
    });
    
    return emitter;
};
