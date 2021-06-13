const chainutil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {
    constructor(timestamp, lasthash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lasthash = lasthash;
        this.hash = hash;
        this.data = data;
        this.difficulty = difficulty || DIFFICULTY;
        this.nonce = nonce;
    }
    toString() {
        return `Block -
    timestamp :${this.timestamp}
    lasthash  :${this.lasthash}
    hash      :${this.hash}
    nonce     :${this.nonce}
    difficulty:${this.difficulty}
    data      :${ this.data}`;
    }
    static genesis() {
        return new this('genesis time', '----', 'h89dcjdiowido0dj0332h2or', [], 0, DIFFICULTY);
    }
    static mineblock(lastblock, data) {
        let timestamp, hash;
        const lasthash = lastblock.hash;
        let { difficulty } = lastblock;
        let nonce = 0;
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastblock, timestamp);
            hash = Block.hash(timestamp, lasthash, data, nonce, difficulty);
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp, lasthash, hash, data, nonce, difficulty);
    }
    static hash(timestamp, lasthash, data, nonce, difficulty) {
        return chainutil.hash(`${timestamp}${lasthash}${data}${nonce}${difficulty}`).toString();
    }
    static blockhash(block) {
        const { timestamp, lasthash, data, nonce, difficulty } = block;
        return Block.hash(timestamp, lasthash, data, nonce, difficulty);
    }
    static adjustDifficulty(lastblock, currentTime) {
        let { difficulty } = lastblock;
        difficulty = lastblock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
        return difficulty;
    }

}
module.exports = Block;