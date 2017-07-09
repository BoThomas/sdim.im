/**
 * This file contains backend-functions to run on the Pi (it is exported as node-module and used in routes.js)
 */

var fs = require("fs");
var exec = require("child_process");

//execute a script on pi
var executeScript = function (path_or_command, on_success, on_error) {

    try {
        writeToLog("#### executing: sudo " + path_or_command);
        exec.execSync("sudo " + path_or_command);
        if (typeof on_success !== "undefined") {
            on_success();
        }
    }
    catch (e) {
        console.log(e);
        writeToLog(e);
        if (typeof on_error !== "undefined") {
            on_error();
        }
    }
};

//get onion address from pi
var getOnionHostname = function () {
    var filename = getPath("tor_hostname");
    if (fs.existsSync(filename)) {
        return fs.readFileSync(filename, 'utf8').replace(/[^\x20-\x7E]+/g, '');
    } else {
        return "not found"
    }
};

//get path to a script from mapping file
var getPath = function (path_descriptor) {
    var mappingJSON = require("../paths.json");
    return mappingJSON[path_descriptor];
};

//write something to the settings file
var writeSettings = function (descriptor, value) {
    var settings = require(settingsFile);
    if (!fs.existsSync(settingsFile)) {
        fs.writeFileSync(settingsFile, "{}");
    }
    settings[descriptor] = value;
    fs.writeFileSync(settingsFile, JSON.stringify(settings), 'utf8');
};

//read something from the settings file
var readSettings = function (descriptor) {
    if (!fs.existsSync(settingsFile)) {
        fs.writeFileSync(settingsFile, "{}");
    }
    var settings = require(settingsFile);
    return settings[descriptor];
};

//process a uploaded config TODO: restore things like onion-domain & prosody users
var processUploadedConfig = function (config) {
    //restore theme
    writeSettings("theme", config.theme);
};

//export the config as file
var exportConfig = function () {
    //TODO: export Config (read all important web, onion & prosody settings, parse as JSON and return)
};

//read the Hostname from the Pi or return "not found"
var getHostname = function () {
    var hostname;
    try {
        hostname = fs.readFileSync(getPath("hostname_file"), 'utf8');
    }
    catch (e) {
        console.log(e);
        writeToLog(e);
        hostname = "not found"
    }
    return hostname;
};

//create a JID via Prosody
var createJID = function (name, pp, onion) {
    executeScript("prosodyctl register " + name + " " + onion + " " + pp, function () {

    });
    var jid = "" + name + "@" + onion;
    writeSettings("jid", jid);
};

//read JID from settings
var getJID = function () {
    var jid = readSettings("jid");
    if (!jid) {
        jid = "not found"
    }
    return jid;
};


//TODO: add functions to manage Prosody users

/*--------------------------------------------------------------*/

var rebootPi = function () {
    executeScript("sync");
    executeScript("sleep 5");
    executeScript("reboot");
};
var shutdownPi = function () {
    executeScript("sync");
    executeScript("shutdown -r -t 5");
};
var triggerPackageUpdate = function () {
    executeScript(getPath("autoupdate_script"));
};
var setHostname = function (hostname) {
    executeScript('/opt/sdim/setHostname.sh ' + hostname.trim())
};
var writeToLog = function (message) {
    fs.appendFileSync(logfile, "*webInt* " + message + "\n");
    //TODO: use a consistent logging format (see SDIM scripts) & timestamps
};
var restartServices = function () {
    executeScript("systemctl restart prosody");
};
/*--------------------------------------------------------------*/

const logfile = getPath("logfile");
const settingsFile = getPath("settings_file");

//getOnionHostname = function(){return "ofkztzcopimx34la.onion"};  //mock-up onion-domain

module.exports = {
    executeScript: executeScript,
    getOnionHostname: getOnionHostname,
    getPath: getPath,
    writeSettings: writeSettings,
    readSettings: readSettings,
    processUploadedConfig: processUploadedConfig,
    rebootPi: rebootPi,
    shutdownPi: shutdownPi,
    triggerPackageUpdate: triggerPackageUpdate,
    setHostname: setHostname,
    getHostname: getHostname,
    writeToLog: writeToLog,
    restartServices: restartServices,
    createJID: createJID,
    getJID: getJID
};