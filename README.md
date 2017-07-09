# sdim.im
SDIM is the abbreviation for Secure Decentralized Instant Messaging.<br>
SDIM is built to offer a simple, secure and privacy respecting alternative to centralized messaging services like WhatsApp, Telegram, Signal or Threema.<br><br>
With SDIM you are part of the XMPP federated network and hosting your own XMPP node. Therefore you should install your SDIM node at a reliable internet connection for the best user experience.<br><br>
If the above mentioned messaging services are secure, there is still metadata collected by the services in a centralized manner. SDIM tries to circumvent situations where metadata about your chats can be collected at network level.<br><br>
SDIM is based on Debian Linux, Tor, Prosody IM and some web technology.

## FAQ

<b>How is security and privacy handled by SDIM?</b>

SDIM is intended to route traffic through Tor. Users should look at XMPP clients that offer OMEMO end-to-end encryption and support for Tor. SDIM uses TLS with self-signed certificates. Users shall compare fingerprints of certificates by now.

<b>Can I review the Code of SDIM?</b>

SDIM is licensed under GNU GPL. You can do whatever GNU General Public License allows you to do.

<b>Which technology is used by SDIM?</b>

SDIM is based on Debian Linux or the Raspberry Pi specific Raspbian. The XMPP server used by SDIM is Prosody IM and the connection to Tor is established via tor client.

<b>Is SDIM able to communicate with other XMPP servers?</b>

SDIM is able to connect to other XMPP servers via server to server connection. However there is a chance to get routed through compromised exit nodes when leaving the Tor network. In addition, the non-SDIM server outside of Tor must have the ability to route packets to the Tor network, otherwise it is not able to establish a server to server connection to your SDIM node. XMPP server operators that want to support SDIM have to install tor and extensions to their XMPP server to handle .onion domain names. For Prosody IM, there is a module called „mod_onions“.
