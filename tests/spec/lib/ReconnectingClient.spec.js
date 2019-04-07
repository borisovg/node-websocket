'use strict';

/**
 * @author George Borisov <git@gir.me.uk>
 */

const { expect } = require('chai');
const WebSocket = require('ws');
const lib = require('../../../index.js');

describe('lib/ReconnectingClient.js', () => {
    const port = 10001;
    const sockets = new Set();
    let client, server;

    before((done) => {
        server = new WebSocket.Server({ port }, done);

        server.on('connection', (s) => {
            sockets.add(s);

            s.on('close', () => {
                sockets.delete(s);
            });
        });
    });

    after((done) => {
        server.close(done);
    });

    it('connects to server', (done) => {
        client = new lib.Client({
            pingInterval: 50,
            reconnect: true,
            url: `ws://localhost:${port}`,
        });

        expect(client._maxDelay).to.equal(30000);
        expect(client._minDelay).to.equal(1000);

        client.once('open', () => {
            client.close();
            done();
        });
    });

    it('reconnects to server', (done) => {
        let flag = false;

        client = new lib.Client({
            pingInterval: 50,
            reconnect: { },
            url: `ws://localhost:${port}`,
        });

        client.once('open', () => {
            client.once('reconnect', () => {
                flag = true;
            });

            client.once('open', () => {
                expect(flag).to.equal(true);
                done();
            });

            sockets.values().next().value.terminate();
        });

    });

    it('does not reconnect if explicitly closed', () => {
        client.close();
    });
});
