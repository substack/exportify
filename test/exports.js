var test = require('tap').test;
var exportify = require('../');
var fs = require('fs');
var path = require('path');
var existsSync = fs.existsSync || path.existsSync;

(function () {
    // clean out the directory
    var files = fs.readdirSync(__dirname + '/files');
    files.forEach(function (file) {
        if (/\.js$/.test(file)) {
            fs.unlinkSync(__dirname + '/files/' + file);
        }
    });
})();

var txt = {
    a : fs.readFileSync(__dirname + '/files/a.txt', 'utf8'),
    b : fs.readFileSync(__dirname + '/files/b.txt', 'utf8'),
};

test('package up some files', function (t) {
    t.plan(5);
    
    var files = [ 'a.txt', 'b.txt' ]
        .map(function (file) { return __dirname + '/files/' + file })
    ;
    var ex = exportify(files);
    
    var exported = [];
    ex.on('export', function (file) {
        exported.push(file);
    });
    ex.on('end', function () {
        process.nextTick(function () {
            t.same(exported.sort(), files.sort());
            t.ok(existsSync(__dirname + '/files/a.txt.js'));
            t.ok(existsSync(__dirname + '/files/b.txt.js'));
            t.equal(txt.a, require('./files/a.txt.js'));
            t.equal(txt.b, require('./files/b.txt.js'));
        });
    });
});

test('target a single extension', function (t) {
    t.plan(3);
    
    var files = [ 'a.txt', 'c.foo' ]
        .map(function (file) { return __dirname + '/files/' + file })
    ;
    var ex = exportify(files, {
        ext: 'txt'
    });
    
    var exported = [];
    ex.on('export', function (file) {
        exported.push(file);
    });
    ex.on('end', function () {
        process.nextTick(function () {
            t.ok(exported.length === 1);
            t.ok(existsSync(__dirname + '/files/a.txt.js'));
            t.ok(!existsSync(__dirname + '/files/c.foo.js'));
        });
    });
});
