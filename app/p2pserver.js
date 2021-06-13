const WebSocket = require('ws');

const P2P_PORT = process.env.P2P_PORT || 5001;
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS'
};

class P2pserver {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.TransactionPool = transactionPool
        this.sockets = [];
    }
    listen() {
        const server = new WebSocket.Server({ port: P2P_PORT });
        server.on('connection', socket => {

            this.connectSocket(socket);
        });
        this.connectToPeers();

        console.log(`listening for P2P connection on :${P2P_PORT}`);
    }
    connectToPeers() {
        peers.forEach(peer => {
            const Socket = new WebSocket(peer);

            Socket.on('open', () =>
                this.connectSocket(Socket));
        });
    }
    sendTrasactions(socket, transaction) {
        socket.send(JSON.stringify({
            types: MESSAGE_TYPES.transaction,
            transaction
        }));

    }
    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('socket connected');

        this.messageHandler(socket);

        this.sendChain(socket);
    }
    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.types) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replacechain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.TransactionPool.updateOrAddTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.TransactionPool.clear();
                    break;
            }
        });
    }
    sendChain(socket) {
        socket.send(JSON.stringify({
            types: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }));
    }
    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));
    }
    broadcastTransaction(transaction) {
        return this.sockets.forEach(s => this.sendTrasactions(s, transaction));
    }
    broadcastClearTransactions() {
        return this.sockets.forEach(s => s.send(JSON.stringify({
            types: MESSAGE_TYPES.clear_transactions
        })));
    }
}
module.exports = P2pserver;