const Blockchain = require('./index');
const Block = require('./block');
const Wallet = require('../Wallet');

describe('Blockchain', () => {
    let bc;
    beforeEach(() => {
        bc = new Blockchain();
        bc2 = new Blockchain();

    });
    it('first block is genesis', () => {
        expect(bc.chain[0]).toEqual(Block.genesis());
    });
    it('block is added', () => {
        const data = 'aakash';
        bc.addblock(data);
        expect(bc.chain[bc.chain.length - 1].data).toEqual(data);
    });

    it('chain is valid', () => {
        bc2.addblock('aak');
        expect(bc2.isValidChain(bc2.chain)).toBe(true);
    });
    it('invalid the genesis corrupted', () => {
        bc2.chain[0].data = 'ejfno';
        expect(bc2.isValidChain(bc2.chain)).toBe(false);

    });
    it('invalidate the corrupt chain', () => {
        bc2.addblock('aak');
        bc2.chain[1].data = 'not aak';
        expect(bc2.isValidChain(bc2.chain)).toBe(false);

    });
    it('replaces the chain with valid one', () => {
        //bc2.addblock("aak");//
        bc.replacechain(bc2.chain);

        expect(bc.chain).toEqual(bc2.chain);

    });
    it('doesnt replace the invalid chain', () => {
        bc.addblock("dew");
        bc.replacechain(bc2.chain);

        expect(bc.chain).not.toEqual(bc2.chain);
    });

});