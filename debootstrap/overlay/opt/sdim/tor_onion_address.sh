#!/bin/bash

# Check if Tor directory exists and reconfigure Tor if not
if [ ! -d "/var/lib/tor/xmpp_SDIM/" ]; then
	dpkg-reconfigure tor
	systemctl restart tor
fi
