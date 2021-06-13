const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');
const P2pServer = require('./p2pserver');
const Wallet = require('../Wallet/index');
const TransactionPool = require('../Wallet/transactionPool');
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const Miner = require('./miner');


const app = express();
const tp = new TransactionPool();
const wallet = new Wallet();
const bc = new Blockchain();
const p2pserver = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pserver);
app.use(bodyParser.json());

app.get('/blocks', (req, res) => {
    res.json(bc.chain);
});
app.get('/publickey', (req, res) => {
    res.json({ PUBLIC_KEY: wallet.publicKey });
});
app.get('/transactions', (req, res) => {
    res.json(tp.transactions);
});

app.post('/transact', (req, res) => {
    const { recipient, amount } = req.body;
    const transactions = wallet.createTransaction(recipient, amount, bc, tp);
    p2pserver.broadcastTransaction(transactions);
    res.redirect('/transactions');
});
app.get('/mine-transactions', (req, res) => {
    const block = miner.mine();
    console.log(`Block added:${block.toString()}`);
    res.redirect('/blocks');
});

app.post('/mine', (req, res) => {
    const block = bc.addblock(req.body.data);
    console.log(`new block added: ${block.toString()}`);

    p2pserver.syncChains();

    res.redirect('/blocks');
});

app.listen(HTTP_PORT, () => console.log(`server running ${HTTP_PORT}`));
p2pserver.listen();