/**
 * This file contains the routing of all POST and GET requests on the server-side and handles light weight logic
 * (most of the tasks are delegated to the server-script module)
 */

var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');

var ss = require('../server/serverscript');

const saltRounds = 10; //bcrypt

// ------------------------- MAIN ROUTER -------------------------
router.get("/", function (req, res, next) {

    var theme = ss.readSettings("theme");
    if (typeof theme === "undefined") {
        theme = "light";
    }

    if (ss.readSettings("installed")) { //if wizard is already completed
        if (req.session.loggedIn) { //if user is logged in
            res.render("settings",
                {
                    title: 'SDIM | Settings',
                    theme: theme,
                    hostname: ss.getHostname(),
                    onion: ss.getOnionHostname(),
                    jid: ss.getJID()
                }
            ); //show settings (home)
        } else {
            res.render("login", {title: "SDIM | Login", theme: theme}); //show login
        }
    }
    else {
        req.session.wizard = true;
        res.render("wizard", {title: "SDIM | Wizard", theme: theme}); //show wizard
    }
});
// ---------------------------------------------------------------

//Function to send "Session Expired"
function sessionExpired(res) {
    res.json({success: "Session expired - reload", status: 401, expired: true});
}

// ---------------------------------------------------------------

/* Ajax Calls login/logout */

router.post("/login", function (req, res, next) {

    if (bcrypt.compareSync(req.body.pp, ss.readSettings("passphrase"))) {
        req.session.regenerate(function (err) {
            req.session.loggedIn = true;
            res.json({success: "login successful", status: 200});
        });
    }
    else { //wrong passphrase
        res.status(401);
        res.send("Wrong passphrase!");
    }

});

router.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
        res.redirect("/");
    });
});


/* Ajax Calls wizard*/

router.post("/wizard/name_pp", function (req, res, next) {
    if (req.session.wizard) {
        ss.setHostname(req.body.name); //set hostname
        ss.writeSettings("passphrase", bcrypt.hashSync(req.body.pp, saltRounds)); //write pp to settings
        res.json({success: "Name and passphrase send", status: 200});
    }
    else {
        sessionExpired(res);
    }
});

router.get("/wizard/onion_address", function (req, res, next) {
    if (req.session.wizard) {
        res.json({address: ss.getOnionHostname(), success: "Onion Address send", status: 200});
    }
    else {
        sessionExpired(res);
    }
});

router.post("/wizard/jid_end", function (req, res, next) {
    if (req.session.wizard) {
        ss.createJID(req.body.name, req.body.pp, req.body.onion);
        ss.writeSettings("installed", true); //mark as installed (= disable wizard)
        res.json({success: "Your JID was created. Pi will restart now", status: 200});
    }
    else {
        sessionExpired(res);
    }
});

router.get("/wizard/reboot", function (req, res, next) { //is triggered from client after jid_end succeeded
    if (req.session.wizard) {
        ss.rebootPi();
    }
});


/* Ajax Calls wizard & settings-page */

router.post("/config", function (req, res, next) {
    if (req.session.wizard || req.session.loggedIn) {
        ss.processUploadedConfig(req.body);
        res.json({success: "Config send", theme: req.body.theme, status: 200});
    }
    else {
        sessionExpired(res);
    }
});

router.post("/theme", function (req, res, next) {
    if (req.session.wizard || req.session.loggedIn) {
        ss.writeSettings("theme", req.body.theme); //save theme
        res.json({success: "Theme send", status: 200});
    }
    else {
        sessionExpired(res);
    }
});


/* Ajax Calls settings-page */

router.post("/settings/name", function (req, res, next) {
    if (req.session.loggedIn) {
        ss.setHostname(req.body.name); //set hostname
        res.json({success: "Name send (restart required)", status: 200});
    }
    else {
        sessionExpired(res);
    }
});

router.post("/settings/pp", function (req, res, next) {
    if (req.session.loggedIn) {
        ss.writeSettings("passphrase", bcrypt.hashSync(req.body.pp, saltRounds)); //write pp to settings
        res.json({success: "Name and passphrase send", status: 200});
    }
    else {
        sessionExpired(res);
    }
});

router.get("/settings/reboot_pi", function (req, res, next) {
    if (req.session.loggedIn) {
        ss.rebootPi();
        res.json({success: "Pi will now reboot", status: 200});
    }
    else {
        sessionExpired(res);
    }
});

router.get("/settings/shutdown_pi", function (req, res, next) {
    if (req.session.loggedIn) {
        ss.shutdownPi();
        res.json({success: "Pi will now shut down", status: 200});
    }
    else {
        sessionExpired(res);
    }
});

router.get("/settings/update", function (req, res, next) {
    if (req.session.loggedIn) {
        ss.triggerPackageUpdate();
        res.json({success: "Update will start now. Do not power off the Pi! (update-log at the bottom)", status: 200});
    }
    else {
        sessionExpired(res);
    }
});

router.get("/settings/restart_services", function (req, res, next) {
    if (req.session.loggedIn) {
        ss.restartServices();
        res.json({success: "Services will restart now", status: 200});
    }
    else {
        sessionExpired(res);
    }
});

//TODO: implement routes for exporting and importing of settings.json (delegate to server-script)
//TODO: implement routes for managing Prosody users (delegate to server-script)

module.exports = router;
