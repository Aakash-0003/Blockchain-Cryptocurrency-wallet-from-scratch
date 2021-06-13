const { INITIAL_BALANCE } = require('../config');
const ChainUtil = require('../chain-util');
//const TransactionPool = require('./transactionPool');
const Transaction = require('./transaction');
//const blockchain = require('../blockchain');

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {
        return `WALLET-
     PUBLIC KEY:${this.publicKey}
     BALANCE   :${this.balance}`
    }
    sign(data) {
        return this.keyPair.sign(data);
    }

    static blockchainWallet() {
        const BlockchainWallet = new this();
        BlockchainWallet.address = "BLOCKCHAIN_WALLET";
        return BlockchainWallet;
    }
    createTransaction(recipient, amount, blockchain, transactionPool) {
        this.balance = this.calculateBalance(blockchain);

        if (amount > this.balance) {
            console.log('unsufficient balance');
            return;
        }
        let transaction = transactionPool.existingTransactions(this.publicKey);
        if (transaction) {
            transaction.update(this, recipient, amount);
        } else {
            transaction = Transaction.newtransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction);
        }
        return transaction;
    }
    calculateBalance(blockchain) {
        let balance = this.balance;
        let transactions = [];
        blockchain.chain.forEach(block => block.data.forEach(t => {
            transactions.push(t);

        }));

        const walletInputTs = transactions
            .filter(transaction => transaction.input.address === this.publicKey);

        let startTime = 0;

        if (walletInputTs.length > 0) {
            const recentInputT = walletInputTs.reduce(
                (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
            );

            balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
            startTime = recentInputT.input.timestamp;
        }

        transactions.forEach(transaction => {
            if (transaction.input.timestamp > startTime) {
                transaction.outputs.find(output => {
                    if (output.address === this.publicKey) {
                        balance += output.amount;
                    }
                });
            }
        });

        return balance;
    }
}
module.exports = Wallet;