const Block = require('./block');

describe('Block', () => {
    let data, lastblock, block;
    beforeEach(() => {
        data = 'jncjk';
        lastblock = Block.genesis();
        block = Block.mineblock(lastblock, data);
    });
    it('sets the `data` to input', () => {
        expect(block.data).toEqual(data);
    });
    it('`lasthash` is the hash of the last block', () => {
        expect(block.lasthash).toEqual(lastblock.hash);
    });
    it('generates a hash that matches difficulty', () => {
        expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
    });
    it('lowers the difficulty for slowly mined blocks', () => {
        expect(Block.adjustDifficulty(block, block.timestamp + 360000)).toEqual(block.difficulty - 1);
    });
});