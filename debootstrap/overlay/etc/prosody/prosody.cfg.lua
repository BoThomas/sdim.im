admins = { }
plugin_paths = { "/usr/lib/prosody/modules/prosody-modules" }
modules_enabled = {
                "roster";
                "saslauth";
                "tls";
                "dialback";
                "disco";
                "private";
                "vcard";
                "pep";
                "register";
                "posix";
                "smacks";
                "smacks_offline";
                "carbons";
                "mam";
                "mam_archive";
                "csi";
                "cloud_notify";
                "blocking";
                "privacy_lists";
                "pep_vcard_avatar";
                "http";
                "throttle_presence";
                "pinger";
				"listusers";
};

modules_disabled = {
};

allow_registration = false;

daemonize = true;

pidfile = "/var/run/prosody/prosody.pid";

c2s_require_encryption = true;
s2s_secure_auth = false;

authentication = "internal_hashed";

ssl = {
	        key = "/etc/prosody/certs/localhost.key";
	        certificate = "/etc/prosody/certs/localhost.cert";
}

Include "conf.d/*.cfg.lua";
