'use strict';

var through = require("through2"),
    crypto = require("crypto"),
    PluginError = require("gulp-util").PluginError;

var PLUGIN_NAME = "gulp-openssl-encrypt";

module.exports = function(options){
    return through.obj(function(file,encoding,callback){
        options = options || {};
        options.password = options.password || "P@ssw0rd";
        options.algorithm = options.algorithm || "aes-256-cbc";
        options.format = options.format || "openssl"; // openssl or raw;
        options.decrypt = options.decrypt || false;
        var md5 = function(data) {
            var hash = crypto.createHash('md5');
            hash.update(data);
            return new Buffer(hash.digest('hex'),'hex');
        };

        if(file.isNull()){
            return callback(null, file);
        }
        if(file.isStream()){
            this.emit('error', new PluginError(PLUGIN_NAME, 'Stream is not supported!'));
        } else if(file.isBuffer()) {
            if(options.decrypt) {
                if(options.format === "openssl") {

                    if(file.contents.length < 16 || file.contents.slice(0,8).toString() !== 'Salted__') {

                        this.emit('error', new PluginError(PLUGIN_NAME,'This file is not an openssl enrypted file'));
                        return callback("This file is not an openssl enrypted file",null);
                    }

                    let salt = file.contents.slice(8,16);
                    let cryptotext = file.contents.slice(16);
                    let password = new Buffer(options.password);
                    let hash1 = md5(Buffer.concat([password,salt]));
                    let hash2 = md5(Buffer.concat([hash1,password,salt]));
                    let key = Buffer.concat([hash1,hash2]);
                    let iv = md5(Buffer.concat([hash2,password,salt]));
                    let decipher = crypto.createDecipheriv(options.algorithm, key, iv);
                    let chunks = [];

                    chunks.push(decipher.update(cryptotext));

                    chunks.push(decipher.final());

                    file.contents = Buffer.concat(chunks);
                    this.push(file);
                    return callback();
                }
                else {
                    // raw
                    let decipher = crypto.createDecipheriv(options.algorithm,options.password);
                    let chunks = [];
                    chunks.push(decipher.update(file.contents));
                    chunks.push(decipher.final());
                    file.contents = Buffer.concat(chunks);
                    this.push(file);
                    return callback();
                }
            }
            else {
                // encrypt
                if(options.format === "openssl") {
                    let salt = crypto.randomBytes(8);
                    let password = new Buffer(options.password);
                    let hash1 = md5(Buffer.concat([password,salt]));
                    let hash2 = md5(Buffer.concat([hash1,password,salt]));
                    let key = Buffer.concat([hash1,hash2]);
                    let iv = md5(Buffer.concat([hash2,password,salt]));
                    let cipher = crypto.createCipheriv(options.algorithm, key, iv);
                    let chunks = [new Buffer('Salted__'),salt];
                    chunks.push(cipher.update(file.contents));
                    chunks.push(cipher.final());
                    file.contents = Buffer.concat(chunks);
                    this.push(file);
                    return callback();
                }
                else {
                    // raw
                    let cipher = crypto.createCipher(options.algorithm,options.password);
                    let chunks = [];
                    chunks.push(cipher.update(file.contents));
                    chunks.push(cipher.final());
                    file.contents = Buffer.concat(chunks);
                    this.push(file);
                    return callback();
                }
            }
        }

    });
};
