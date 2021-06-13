const Block = require('./block');

class blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }
    addblock(data) {
        const block = Block.mineblock(this.chain[this.chain.length - 1], data);
        this.chain.push(block);
        return block;
    }
    isValidChain(chain) {
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;

        for (let i = 1; i < chain.length; i++) {
            const block = chain[i];
            const lastblock = chain[i - 1];

            if (block.lasthash !== lastblock.hash || block.hash !== Block.blockhash(block)) {
                return false;
            }
        }
        return true;
    }
    replacechain(newchain) {
        if (newchain.length <= this.chain.length) {
            console.log('the new chain is shorter than current chain');
            return;
        } else if (!this.isValidChain(newchain)) {
            console.log('the new chain is not valid');
            return;
        }
        console.log('chain is replaced');
        this.chain = newchain;

    }


}
module.exports = blockchain;