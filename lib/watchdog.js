'use strict';

/**
 * @author George Borisov <git@gir.me.uk>
 * @copyright George Borisov 2019
 * @license LGPL-3.0
 */

const WebSocket = require('ws');
const defaultPingInterval = 2000;

function ping (socket, i) {
    if (socket.readyState > WebSocket.OPEN) {
        return;

    } else if (socket.readyState === WebSocket.OPEN) {
        socket.ping();
    }

    setTimeout(() => ping(socket), i);
}

function watchdog (socket, i) {
    if (socket.readyState > WebSocket.OPEN) {
        return;
    }

    socket._hb -= 1;

    if (socket._hb <= 0) {
        socket.emit('error', new Error('Watchdog timeout'));
        socket.terminate();
        return;
    }

    setTimeout(() => watchdog(socket), i);
}

module.exports = function (socket, pingInterval) {
    pingInterval = pingInterval || defaultPingInterval;

    socket._hb = 2;

    socket.on('ping', function () {
        socket._hb = 2;
        socket.pong();
    });

    socket.on('pong', function () {
        socket._hb = 2;
    });

    ping(socket, pingInterval);
    watchdog(socket, pingInterval);
};
