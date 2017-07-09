#!/bin/bash
###########################################################
# BASIC OS SETUP
###########################################################
echo -e "127.0.0.1\tsdim-node" >>  "/etc/hosts"

echo "-- Updating chroot environment"
apt-key add /apt_key1.key
apt-key add /apt_key2.key
apt-get update
apt-get -y --force-yes upgrade
apt-get install -y --force-yes -o Dpkg::Options::="--force-confold" openssh-server sudo raspi-config curl binutils bash netbase isc-dhcp-client git resolvconf ntp curl apt-transport-https python make g++ mercurial
apt-get clean

echo "-- Setting rot password in chroot environment"
echo "root:root123" | chpasswd

###########################################################
# SDIM FRAMEWORK
###########################################################
echo "-- Adding "sdim" User to chroot environment"
useradd -s /bin/bash -m sdim
echo "sdim:sdim123" | chpasswd

cd /home/sdim/
# Setup the NodeJS Repository
echo "deb https://deb.nodesource.com/node_7.x jessie main" > /etc/apt/sources.list.d/nodesource.list
echo "deb-src https://deb.nodesource.com/node_7.x jessie main" >> /etc/apt/sources.list.d/nodesource.list
curl -s https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add -

# Install NodeJS
apt-get update
apt-get -y --force-yes install nodejs 

# Install Prosody and Tor
echo "deb http://deb.torproject.org/torproject.org jessie main" > /etc/apt/sources.list.d/tor.list
echo "deb-src http://deb.torproject.org/torproject.org jessie main" >> /etc/apt/sources.list.d/tor.list
gpg --keyserver keys.gnupg.net --recv A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 
gpg --export A3C4F0F979CAA22CDBA8F512EE8CBC9E886DDD89 | apt-key add -
apt-get update

echo "-- Installing all parts of the SDIM project"
mkdir -p /usr/lib/prosody/modules && cd /usr/lib/prosody/modules
hg clone https://hg.prosody.im/prosody-modules/ prosody-modules
apt-get install -y --force-yes -o Dpkg::Options::="--force-confold" prosody tor deb.torproject.org-keyring lua-bitop

chown -R prosody:prosody /usr/lib/prosody/

echo "ONION ADDRESS FOR BUILD: $(cat /var/lib/tor/xmpp_SDIM/hostname)"

rm -rf /var/lib/tor/xmpp_SDIM/ /var/log/tor
chmod +x /etc/rc.local

chmod 440 /etc/sudoers

chown sdim:sdim -R /opt/sdim
su - sdim -c "cd /opt/sdim/webinterface/; npm install -a"
