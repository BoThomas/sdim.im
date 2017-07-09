/**
 * This file contains Listeners and functionality for every element of the SDIM Settings-Page
 */

$(function () {

    //-- Log --

    const socket = io(); //connect
    var first_line = true;
    var log_buffer = "";

    //listener
    socket.on('server-log', function (data) {
        //cut of first line (could be incomplete because entry-point in logfile is set via byte value)
        if (first_line) {
            first_line = false;
            return;
        }
        //append log-line to buffer
        log_buffer += data.msg + "\n";
    });

    //append buffer every second
    setInterval(function () {
        if (log_buffer !== "") {
            $("#log").append(log_buffer);
            log_buffer = "";
            var text_area = document.getElementById("log");
            text_area.scrollTop = text_area.scrollHeight;
        }
    }, 1000);
    //-- end Log --

    //-------------------------------------------------------------------------------

    //Update hostname
    $("#update_hostname").click(function () {
        var hostname = $("#pi-name").val().trim();
        if (hostname === "") {
            alert(msg_invalid_hostname);
        }
        else {
            makeAjaxCall(
                "POST", {
                    name: hostname
                }, "/settings/name", function () {
                    alert(msg_name_error);
                }, function (data) {
                    alert(data.success);
                });
        }
    });

    //Copy Onion-Address to Clipboard
    $("#copy_onion_address").click(function () {
        copyToClipboard($("#onion_address").attr("placeholder")); //Call clientscript function
    });

    //Update passphrase
    $("#update_passphrase").click(function () {

        var new_passphrase = $("#new_passphrase");
        var confirm = $("#confirm");
        var new_passphraseV = new_passphrase.val();
        var confirmV = confirm.val();

        if (!new_passphraseV || !confirmV) {
            alert(msg_empty_field);
        }
        else if (new_passphraseV !== confirmV) {
            alert(msg_pp_different);
        }
        else {
            makeAjaxCall("POST", {
                pp: new_passphraseV
            }, "/settings/pp", function () {
                alert(msg_pp_error);
            }, function (data) {
                alert(data.success);
            });
            new_passphrase.val("");
            confirm.val("");
        }
    });

    //Restart services
    $("#restart_services").click(function () {
        makeAjaxCall("GET", null, "/settings/restart_services", function () {
            alert(msg_restarting_services_error);
        }, function (data) {
            alert(data.success);
        });
    });

    //Reboot Pi
    $("#reboot_pi").click(function () {
        makeAjaxCall("GET", null, "/settings/reboot_pi", function () {
            alert(msg_reboot_error);
        }, function (data) {
            alert(data.success);
        });
    });

    //Shutdown Pi
    $("#shutdown_pi").click(function () {
        makeAjaxCall("GET", null, "/settings/shutdown_pi", function () {
            alert(msg_shutdown_error);
        }, function (data) {
            alert(data.success);
        });
    });

    //Listen on dark-theme-switch
    $("#darkTheme").click(function () {

        var to = sessionStorage.theme === "light" ? "dark" : "light";
        sessionStorage.setItem("theme", to);

        makeAjaxCall("POST", {theme: to}, "/theme", function () {
            alert(msg_theme_error);
        }, function () {
            $("#theme").attr("href", "stylesheets/" + to + ".css");
            $("body").css("background-color", (to === "dark" ? "#606060" : "#F9F9F9"));
        });
    });

    //Trigger Update
    $("#update").click(function () {
        makeAjaxCall("GET", null, "/settings/update", function () {
            alert(msg_update_error);
        }, function (data) {
            alert(data.success);
        });
    });

    //Import Config
    $("#import").click(function () {
        alert("not implemented");
        //TODO: implement importing of settings via settings-page
    });

    //Export Config
    $("#export").click(function () {
        alert("not implemented");
        //TODO: implement exporting of settings via settings-page
    });

    //TODO: implement managing Prosody users via settings-page
});