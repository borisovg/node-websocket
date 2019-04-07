'use strict';

/**
 * @author George Borisov <git@gir.me.uk>
 */

const { expect } = require('chai');
const WebSocket = require('ws');
const lib = require('../../../index.js');

describe('lib/Client.js', () => {
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
            url: `ws://localhost:${port}`,
        });

        client.on('open', done);
    });

    it('re-emits "error" event', (done) => {
        client.once('error', (err) => {
            expect(err.message).to.equal('spanner');
            done();
        });

        client._socket.emit('error', new Error('spanner'));
    });

    it('re-emits "message" event', (done) => {
        client.on('message', (data) => {
            expect(data).to.equal('foo');
            done();
        });

        sockets.values().next().value.send('foo');
    });

    it('.close() closes connection', () => {
        client.close();
    });

    it('.send() queues and sends messages', (done) => {
        client = new lib.Client({
            pingInterval: 50,
            url: `ws://localhost:${port}`,
        });

        client.send('foo');

        client.once('open', () => {
            client.send('bar');
        });

        server.once('connection', (s) => {
            s.once('message', (data) => {
                expect(data).to.equal('foo');

                s.once('message', (data) => {
                    expect(data).to.equal('bar');
                    client.close();
                    done();
                });
            });
        });
    });

    it('emits error if maxQueueLength exceeded', (done) => {
        client = new lib.Client({
            maxQueueLength: 1,
            pingInterval: 50,
            url: `ws://localhost:${port}`,
        });

        client.on('open', () => {
            client.on('close', () => {
                client.send('foo');

                client.on('error', (err) => {
                    expect(err.message).to.equal('Queue length exceeded');
                    done();
                });

                client.send('bar');
            });

            client.close();
        });
    });

    it('.terminate() terminates the connection', (done) => {
        client = new lib.Client({
            pingInterval: 50,
            url: `ws://localhost:${port}`,
        });

        client.on('open', () => {
            client.terminate();
            done();
        });
    });
});
