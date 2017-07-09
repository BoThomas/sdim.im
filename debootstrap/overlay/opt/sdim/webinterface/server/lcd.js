/**
 * This file contains functions to display information on the pi hardware-display
 */

//-------------------- Pi-Hardware-Display --------------------
// Idea from: http://thejackalofjavascript.com/rpi-16x2-lcd-print-stuff/
// Library:   https://www.npmjs.com/package/lcd
var ss = require('./serverscript');
var Lcd = require('lcd'),
    lcd = new Lcd({
        rs: 4,
        e: 17,
        data: [24, 22, 23, 18],
        cols: 16,
        rows: 2
    });

lcd.on('ready', function () {
    var str1 = "   IP:    " + getIp();
    var str2 = "   ONION: " + ss.getOnionHostname();

    lcd.setCursor(0, 0);
    lcd.print(str1);

    lcd.once('printed', function () {
        lcd.setCursor(0, 1);
        lcd.print(str2);
    });

    scrollToLeft(600);
});

function scrollToLeft(timeout) {
    setTimeout(function () {
        lcd.scrollDisplayLeft();
        scrollToLeft(timeout);
    }, timeout);
}

function getIp() {
    var ifaces = require('os').networkInterfaces();
    var ip = '0.0.0.0';

    for (var dev in ifaces) {
        if (ifaces.hasOwnProperty(dev)) {
            for (var i = 0; i < ifaces[dev].length; i++) {
                if (ifaces[dev][i].family === 'IPv4' && ifaces[dev][i].address !== '127.0.0.1' && !ifaces[dev][i].internal) {
                    ip = ifaces[dev][i].address;
                    break;
                }
            }
        }
    }
    return ip;
}

// If ctrl+c is hit, free resources and exit.
process.on('SIGINT', function () {
    lcd.clear();
    lcd.close();
});

process.on('SIGTERM', function () {
    lcd.clear();
    lcd.close();
});
