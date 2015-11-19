"use strict";

var should = require("should"),
    fs = require("fs");

var gulpOpensslEncrypt = require("../"),
    gutil = require("gulp-util");

describe("gulp-openssl-encrypt",function(){
    var expectedDecrypted = new gutil.File({
        path:'test/decrypted.txt',
        cwd: 'test/',
        base: 'test/',
        contents: fs.readFileSync('test/decrypted.txt')
    });

    describe("decrypt",function(){
        it("should decrypt the buffer that was encrypted by openssl",function(done){
            var srcFile = new gutil.File({
                path:'test/encrypted.openssl.txt',
                cwd: 'test/',
                base: 'test/',
                contents: fs.readFileSync('test/encrypted.openssl.txt')
            });
            var stream = gulpOpensslEncrypt({
                password:'abcdefg',
                format: 'openssl',
                algorithm: 'aes-256-cbc',
                decrypt: true
            });
            stream.on('data',function(newFile){
                should.exist(newFile);
                should.exist(newFile.contents);
                String(newFile.contents).should.equal(fs.readFileSync("test/decrypted.txt",'utf8'));
                done();
            });
            stream.write(srcFile);
            stream.end();
        });
        it("should throw error if the password is incorrect",function(done){
            var srcFile = new gutil.File({
                path:'test/encrypted.openssl.txt',
                cwd: 'test/',
                base: 'test/',
                contents: fs.readFileSync('test/encrypted.openssl.txt')
            });
            var stream = gulpOpensslEncrypt({
                password:'111111',
                format: 'openssl',
                algorithm: 'aes-256-cbc',
                decrypt: true
            });
            stream.on('error',function(err){
                should.exist(err);
                err.message.should.equal("Bad decrypt. Password is not correct.");
                done();
            });
            stream.write(srcFile);
            stream.end();
        });
    });
    describe("encrypt",function(){
        it("should encrypt a buffer that can be decryped by openssl",function(done){
            var srcFile = new gutil.File({
                path:'test/decrypted.txt',
                cwd: 'test/',
                base: 'test/',
                contents: fs.readFileSync('test/decrypted.txt')
            });
            var stream = gulpOpensslEncrypt({
                password:'abcdefg',
                format: 'openssl',
                algorithm: 'aes-256-cbc',
                decrypt: false
            });
            stream.on('data',function(newFile){
                should.exist(newFile);
                should.exist(newFile.contents);
                //String(newFile.contents).should.equal(fs.readFileSync("test/decrypted.txt",'utf8'));
                fs.writeFileSync('test/encrypted.txt',newFile.contents);
                done();
            });
            stream.write(srcFile);
            stream.end();
        });
    });
});
