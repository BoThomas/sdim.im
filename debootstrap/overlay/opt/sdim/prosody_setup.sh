#!/bin/bash

ONION_ADDRESS=$(cat /var/lib/tor/xmpp_SDIM/hostname)
echo "$ONION_ADDRESS" > /tmp/onion_vhost

# Configure Vhost with Onion domain
cat <<EOF > /etc/prosody/conf.d/onion_vhost.cfg.lua
VirtualHost "$ONION_ADDRESS"
        ssl = {
                key = "/var/lib/prosody/${ONION_ADDRESS}.key";
                certificate = "/var/lib/prosody/${ONION_ADDRESS}.crt";
        }
	modules_enabled = { "onions"; };
EOF

cat <<EOF > /etc/prosody/conf.d/muc.cfg.lua
Component "conference.$ONION_ADDRESS" "muc";
EOF

cat <<EOF > /etc/prosody/conf.d/proxy.cfg.lua
Component "proxy.$ONION_ADDRESS" "proxy65";
EOF

# Create Certificate if not existing
if [ ! -f "/var/lib/prosody/${ONION_ADDRESS}.key" ] || [ ! -f "/var/lib/prosody/${ONION_ADDRESS}.crt" ]; then
	echo "Creating new certificate..."
	rm -rf /var/lib/prosody/${ONION_ADDRESS}.* > /dev/null 2>&1
	prosodyctl cert generate ${ONION_ADDRESS} << EOF
4096
.
.
.
.


EOF
fi

# Restart Prosody to activate the new vhost
/etc/init.d/prosody restart
