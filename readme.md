# PeerShare

PeerShare is a P2P file sharing website that uses WebRTC technologies to allow uses to send and receive files without going through any servers.

PeerShare is mainly built on Javascript and [jQuery](http://jquery.com/), and uses [PeerJS](http://peerjs.com/) as a WebRTC API

# Features

Enables sharing files of any size between two (modern) browsers, the sender can share the file to multiple peers at one time, and can see what's going on with the in-page console. The peers cannot currently see the transfer speed during transfer, but once the transfer is completed both peers can see the overall time and the average speed of the transfer.

# Installation

PeerShare is quick and easy to install, it doesn't require PHP or MySQL, it just needs a HTTP server ready to serve up html, js and css files and then you need a [PeerServer API Key](http://peerjs.com/peerserver) or you can setup your own [PeerJS Server](https://github.com/peers/peerjs-server). The API key needs to be entered into js/peershare.js for the system to function correctly.

# Demo

You can try out a live demo of PeerShare at [peershare.cuonic.com](http://peershare.cuonic.com)

# Problems

If there are any bugs, issues, feature requests, installation problems feel free to post an issue in the [GitHub Repository](https://github.com/cuonic/PeerShare)