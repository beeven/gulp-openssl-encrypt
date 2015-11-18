gulp-openssl-encrypt
========

> A encrypt/decrypt plugin for gulp 3, generating files that can be encrypt or decrypt by openssl/travis

Usage
-----------
install  ```gulp-openssl-encrypt``` as a development dependency
```bash
npm install ---save-dev gulp-openssl-encrypt
```
Add it to your ```gulpfile.js```

### To encrypt a file
```javascript
var encrypt = require("gulp-openssl-encrypt");
gulp.task('encrypt',function(){
    gulp.src(['plaintext.txt'])
        .pipe(encrypt({
            password: 'password',
            format: 'openssl',
            decrypt: 'false',
            algorithm: 'aes-256-cbc'
        }))
        .pipe(gulp.dest('plaintext.txt.enc'));
});
```
Then you can decrypt it with openssl
```bash
openssl aes-256-cbc -k 'password' -in plaintext.txt.enc -out plaintext.decrypted.txt -d
```

### To decrypt a file
Generate an encrypted file with openssl
```bash
openssl aes-256-cbc -k 'password' -in plaintext.txt -out plaintext.txt.enc
```
Then decrypt the file with gulp-openssl-encrypt
```javascript
var encrypt = require("gulp-openssl-encrypt");
gulp.task('encrypt',function(){
    gulp.src(['plaintext.txt.enc'])
        .pipe(encrypt({
            password: 'password',
            format: 'openssl',
            decrypt: 'true',
            algorithm: 'aes-256-cbc'
        }))
        .pipe(gulp.dest('plaintext.txt'));
});
```

API
---------

### gulp-openssl-encrypt(options)

#### options.password
Type: ```String```
Default: P@ssw0rd
The password to encrypt/decrypt the file

### options.format
Type: ```String```
Default: 'openssl'
The output format, ```openssl``` for openssl compatible, which is salted by default. Use ```raw``` if you don't want to add salt.

### options.algorithm
Type: ```String```
Default: 'aes-256-cbc'
The algorithm use encrypt/decrypt the file. ```algorithm``` is dependent on OpenSSL, examples are 'aes192', etc. On recent releases, openssl list-cipher-algorithms will display the available cipher algorithms.

### options.decrypt
Type: ```boolean```
Default: false
Use ```true``` if you want to decrypt the file.
