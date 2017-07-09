#!/bin/bash

SCRIPTPATH='/opt/sdim/'

# SETUP OF TOR
echo "+ Running Tor Setup"
bash ${SCRIPTPATH}/tor_onion_address.sh

# SLEEP TO WAIT FOR TOR
echo "+ Waiting for Tor to connect"
# Count to 60 seconds and check if Tor is connected. If so, stop the loop and continue
i="0"
while [ $i -lt 60 ]
do
	if [ -f /var/lib/tor/xmpp_SDIM/hostname ] && [ -d /var/lib/tor/xmpp_SDIM/ ]; then
		break
	else	
		sleep 1
		i=$[$i+1]
	fi
done

# SETUP PROSODY VHOST
echo "+ Running Prosody Setup"
bash ${SCRIPTPATH}/prosody_setup.sh

# SETUP LCD PERMISSIONS
echo "+ Setting up LCD Permissions"
bash ${SCRIPTPATH}/lcd_permissions.sh

# RUN NODE WEBINTERFACE/APPLICATION
echo "+ Running Node Application"
su - sdim -c "cd /opt/sdim/webinterface/; npm install -a; npm start"
