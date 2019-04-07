'use strict';

/**
 * @author George Borisov <git@gir.me.uk>
 */

const { expect } = require('chai');
const rewire = require('rewire');
const lib = rewire('../../index.js');

describe('index.js', () => {
    it('exports Client class', function () {
        expect(typeof lib.Client).to.equal('function');
    });

    it('Client returns instance of Client by default', (done) => {
        const opts = {};

        lib.__set__('Client', function (opts) {
            expect(opts).to.equal(opts);
            setImmediate(done);
        });

        expect(new lib.Client(opts)).to.be.an('object');
    });

    it('Client returns instance of ReconnectingClient if "opts.reconnect" is set', (done) => {
        const opts = { reconnect: true };

        lib.__set__('ReconnectingClient', function (opts) {
            expect(opts).to.equal(opts);
            setImmediate(done);
        });

        expect(new lib.Client(opts)).to.be.an('object');
    });

    it('exports Server class', () => {
        expect(typeof lib.Server).to.equal('function');
    });
});
