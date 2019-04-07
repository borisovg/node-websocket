'use strict';

/**
 * @author George Borisov <git@gir.me.uk>
 */

const { expect } = require('chai');
const { EventEmitter } = require('events');
const rewire = require('rewire');
const watchdog = rewire('../../../lib/watchdog.js');

describe('lib/watchdog.js', () => {
    const socket = new EventEmitter();

    it('exports a function', () => {
        expect(watchdog).to.be.a('function');
    });

    it('emits error and terminates connection if no PONG within 2 cycles', (done) => {
        watchdog.__set__('defaultPingInterval', 10);

        let pings = 0;
        let error;

        socket.on('error', (err) => {
            error = err;
        });

        socket.ping = () => {
            pings += 1;
        };

        socket.readyState = 1;

        socket.terminate = () => {
            expect(error.message).to.equal('Watchdog timeout');
            expect(pings).to.be.at.least(2);
            expect(socket._hb).to.equal(0);
            socket.readyState = 3;
            done();
        };

        watchdog(socket);
    });

    it('resets heartbeat state when PING message received', (done) => {
        socket.pong = () => {
            expect(socket._hb).to.equal(2);
            done();
        };

        socket.emit('ping');
    });

    it('does not send PING if socket is in CONNECTING state', (done) => {
        let error;

        socket.on('error', (err) => {
            error = err;
        });

        socket.ping = () => {
            throw new Error('this should not happen');
        };

        socket.readyState = 0;

        socket.terminate = () => {
            expect(error.message).to.equal('Watchdog timeout');
            socket.readyState = 3;
            done();
        };

        watchdog(socket);
    });
});
