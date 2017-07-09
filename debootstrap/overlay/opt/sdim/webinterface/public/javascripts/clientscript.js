/**
 * This file contains messages and universal functions used by wizard and settings-page
 */


//Messages
const msg_step1_error = "Error while submitting name and passphrase";
const msg_step2_no_file = "No file selected";
const msg_step2_error = "Error while submitting the config";
const msg_step5_error = "Error while submitting the JID";
const msg_empty_field = "One or more required inputs are empty";
const msg_pp_different = "Passphrases don't match";
const msg_theme_error = "Error while submitting the theme";
const msg_invalid_hostname = "Invalid Hostname";
const msg_name_error = "Error while submitting name";
const msg_pp_error = "Error while submitting passphrase";
const msg_reboot_error = "Error while triggering reboot";
const msg_shutdown_error = "Error while triggering shutdown";
const msg_update_error = "Error while triggering update";
const msg_restarting_services_error = "Error while restarting services";
const msg_jid_error = "Your JID was not created because your onion-domain could not be found";


//Universal Ajax Function
function makeAjaxCall(type, data, url, on_error, on_success) {
    $.ajax({
        type: type,
        data: type === "POST" ? data : null,
        url: url,
        error: function (data) {
            console.log(data);
            if (typeof on_error !== "undefined") { //fire error callback if defined
                on_error(data);
            }
        },
        success: function (data) {
            if (data.expired) { //if session expired
                location.reload();
            }
            console.log(data);
            if (typeof on_success !== "undefined") { //fire success callback if defined
                on_success(data);
            }
        }
    });
}

//dirty method to copy text to clipboard: append input with text, select it, copy it, delete input
function copyToClipboard(textToCopy) {
    var temp = $("<input>");
    $("body").append(temp);
    temp.val(textToCopy).select();
    document.execCommand("copy");
    temp.remove();
}