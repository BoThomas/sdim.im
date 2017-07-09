/**
 * This file contains the configuration of the wizard and needed listeners/functions for each step
 */

$(function () {
    //Initialize wizard via jquery.steps.js
    //https://github.com/rstaib/jquery-steps
    var wizard = $("#wizard");
    wizard.steps({
        headerTag: "h2",
        bodyTag: "section",
        transitionEffect: "slideLeft",
        startIndex: 0,
        labels: {
            finish: "finish",
            next: "nextStep",
            previous: "previousStep"
        },
        onStepChanging: function (event, currentIndex, newIndex) {
            if (currentIndex === 0 && newIndex === 1) { //on leaving 1. step

                var name = $("#pi-name").val().trim();
                var newpp = $("#new-pp").val();
                var conpp = $("#confirm-pp").val();

                if (!name || !newpp || !conpp) { //check if inputs empty
                    alert(msg_empty_field);
                    return false;
                }
                else if (newpp !== conpp) { //compare passphrases
                    alert(msg_pp_different);
                    return false;
                }
                else { //submit
                    submitNameAndPassphrase(name, newpp);
                    return true;
                }
            }

            if (currentIndex === 2 && newIndex === 3) { //on leaving 3. step
                $("#darkTheme").prop("checked", sessionStorage.theme === "dark");
            }
            if (currentIndex === 3 && newIndex === 4) { //in leaving 4. step
                saveTheme();
            }
            return true;
        },
        onStepChanged: function (event, currentIndex, priorIndex) {
            if (currentIndex === 2) { //on beginning of 3. step
                loadOnionAddress();
            }
        },
        onFinishing: function (event, currentIndex) {
            var jid_username = $("#jid_username").val().trim();
            var jid_pp = $("#jid_pp").val();
            var jid_confirm = $("#jid_confirm").val();

            if (!jid_username || !jid_pp || !jid_confirm) { //check if inputs empty
                alert(msg_empty_field);
                return false;
            }
            else if (jid_pp !== jid_confirm) { //compare passphrases
                alert(msg_pp_different);
                return false;
            }
            else {
                return true;
            }
        },
        onFinished: function (event, currentIndex) {
            submitJIDandEnd($("#jid_username").val().trim(), $("#jid_pp").val());
        }
    });


    /* -- Functions for steps -- */

    //Step 1: Submit RaspName and Webinterface-passphrase to Node-Server (via ajax POST)
    function submitNameAndPassphrase(name, pp) {
        makeAjaxCall("POST", {
            name: name,
            pp: pp
        }, "/wizard/name_pp", function () {
            alert(msg_step1_error);
        });
    }

    //Step 2: Submit Config to Node-Server (via ajax POST)
    $("#submit_config").click(function (e) {
        e.preventDefault();

        var file = $("#config_file")[0].files[0]; //get selected file

        if (typeof file !== "undefined") { //if a file is selected

            var fr = new FileReader();
            fr.onload = function (e) {
                var file_as_json = JSON.parse(e.target.result);

                makeAjaxCall("POST", file_as_json, "/config", function () {
                    alert(msg_step2_error);
                }, function (data) {
                    alert(data.success);
                });
            };
            fr.readAsText(file); //trigger fr.onload

            //listen on success of ajax call and change theme according to response
            $(document).ajaxSuccess(function (event, xhr, settings) {
                if (settings.url === "/config") {
                    changeTheme(JSON.parse(xhr.responseText).theme);
                }
            });
        }
        else {
            alert(msg_step2_no_file);
        }

        return false;
    });

    //Step 3: Load Onion-Address from Node-Server to html-input-placeholder (via ajax GET)
    function loadOnionAddress() {
        makeAjaxCall("GET", null, "/wizard/onion_address", function (data) {
            console.log(data);
            $("#onion_address").attr("placeholder", "not found");
        }, function (data) {
            $("#onion_address").attr("placeholder", data.address);
            sessionStorage.onion = data.address;
        });
    }

    //Step 3: Copy Onion-Address to Clipboard
    $("#copy_onion_address").click(function () {
        copyToClipboard($("#onion_address").attr("placeholder")); //Call client-script function
    });

    //Step 4: Submit Theme-selection to Node-Server (via ajax POST)
    function saveTheme() {
        makeAjaxCall("POST",{theme: sessionStorage.theme}, "/theme", function () {
            alert(msg_theme_error);
        });
    }

    //Step 5: Copy JID to Clipboard
    $("#copy_jid").click(function () {
        copyToClipboard($("#jid_preview").attr("placeholder")); //Call client-script function
    });

    //Step 5: Create JID Account (via ajax POST) and end Wizard
    function submitJIDandEnd(name, pp) {
        if (sessionStorage.onion && sessionStorage.onion !== "not found") {
            makeAjaxCall("POST", {
                name: name,
                pp: pp,
                onion: sessionStorage.onion
            }, "/wizard/jid_end", function () {
                alert(msg_step5_error);
            }, function (data) {
                alert(data.success);
                makeAjaxCall("GET", null, "/wizard/reboot");
                window.location.replace("/");
            });
        }
        else {
            alert(msg_jid_error);
        }
    }

    /* ---- */

    //Listen on dark-theme-switch
    $("#darkTheme").click(function () {
        changeTheme(sessionStorage.theme === "light" ? "dark" : "light");
    });

    //Swap out Theme
    function changeTheme(to) {
        var old = sessionStorage.theme;
        $("#theme").attr("href", "stylesheets/" + to + ".css");
        $(".image").each(function () {
            var link = $(this).attr("src").replace(old, to);
            $(this).attr("src", link);
        });
        sessionStorage.setItem("theme", to);
    }

    //preview JID
    $("#jid_username").on("change paste keyup", function () {
        var preview = $("#jid_preview");
        var name = $("#jid_username").val().trim();

        if (name) {
            var onion = (sessionStorage.onion && sessionStorage.onion !== "not found" ? sessionStorage.onion : "no_onion_domain");
            preview.attr("placeholder", name + "@" + onion);
        }
        else {
            preview.attr("placeholder", "your jid");
        }
    });

    //prevent spaces
    $("#jid_username").on({
        keydown: function (e) {
            if (e.which === 32)
                return false;
        }
    });
});