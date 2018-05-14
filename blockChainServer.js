/*




*/

'use strict';
/* Libraries needed to run this program . */

var CryptoJS   = require("crypto-js");
var express    = require("express");
var bodyParser = require("body-parser");
var WebSocket  = require("ws");
var os         = require("os");
var evilscan   = require("evilscan");

/* List of Nodes are filled with IP addresses that are connected VIA P2P. */

var list_of_nodes = [];
var http_port = 9090;
var p2p_port = 3333;

/* Options are parameters for the scanning of nodes */

var options = {
   target:'192.168.43.0/24',
   port:'3333',
   status:'O', // Timeout, Refused, Open, Unreachable
   banner:false
};

/* Scanner will use the evilscan library to find any connections trying to be made to the port (P2P), and
will populate the list_of_nodes array with the appropriate IP address */

var scanner = new evilscan(options);

scanner.on('result',function(data) {
   // fired when item is matching options
   list_of_nodes.push("ws://" + data.ip + ":" + p2p_port);
});

/* If error is detected it will throw an error */

scanner.on('error',function(err) {
   throw new Error(data.toString());
});

/* Once the scanning is done ,it removes the first index to get rid of the initial user's IP that gets added to the array
in the scan.It will then automatically connect the list of nodes together autmoatically.*/

scanner.on('done',function() {
   list_of_nodes.splice(0,1);
   connectToPeers(list_of_nodes);
});

scanner.run();

/*  OS Info that is displayed from the User  */

var platform = os.platform();
var hostname = os.hostname();
var network  = os.networkInterfaces();

/* Every block has an index, previous hash , timestamp, data, hash, username and the public key,
while the private key is saved onto the user's computer'*/

class Block {
    constructor(index, previousHash, timestamp, data, hash, username, publicKey) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
        this.username = username;
        this.publicKey = publicKey;
    }
}

/* Sockets contain all the IP addresses of the nodes that are currently connected */

var sockets = [];

/* Message Type is used for message handling when a block is joined. */

var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

/* Genesis Block with random information */

var createFirstBlock = () => {
    return new Block(0, "0", 1465154705, "myfirstblock", "2E8BD15FF97B58A060100365F5EA8BA5F4EEFDEC586DD3653C6262A7DA391F5A", "myusername", "mypublickey");
};
/* This starts the blockchain containing the genesis block when the program is initiated */

var blockchain = [createFirstBlock()];

/* Handles all the HTTP Requests ranging from outputting system OS info,all the blocks in the  blockchain, the size of the blockchain, adding nodes,
  and display all the IP addresses of the nodes that are connected (P2P) */

var initHttpServer = () => {
    var app = express();
    app.use(bodyParser.json());

/* Outputs the system info of the user's system and the load average */

    app.get('/systemInfo', (req, res) => {
           var loadaverage =   os.loadavg();
           res.setHeader('Content-Type', 'application/json');
           res.send(JSON.stringify({platform, hostname, list_of_nodes, network, loadaverage}));
     });

/* Returns all the blocks that are currently in the updated blockchain */

    app.get('/getBlockchain', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(blockchain))
    });

/* Returns the size(integer) */

    app.get('/getBlockchainSize', (req, res) => {
        var BlockchainLength=blockchain.length;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({BlockchainLength}));
    });

/* Passes the necessary data to the generated block and will be broadcasted throughout the network */

    app.post('/addBlock', (req, res) => {
        var newBlock = generateNextBlock(req.body.data, req.body.username, req.body.publickey);
        addBlock(newBlock);
        broadcast(responseLatestMsg());
        console.log('block added: ' + JSON.stringify(newBlock));
        res.send();
    });

/* Returns the IP addresses or the nodes that are connected */

    app.get('/getNodes', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });

/* If the scan is not working or a user somehow can't join, there is an option to manually connect the users */

    app.post('/addNode', (req, res) => {
        connectToPeers([req.body.node]);
        res.send();
    });

/* Listening on the HTTP_PORT for any requests */

    app.listen(http_port, () => {
        console.log('HTTP SERVER : ' + http_port)
    });
};

/* Starts the server for handling P2P connection utilizing websockets */

var initP2PServer = () => {
    var server = new WebSocket.Server({port: p2p_port});
    server.on('connection', ws => initConnection(ws));
    console.log('P2P COMM : ' + p2p_port);

};

/* Once a connection has occured it gets pushed into the socket array , and  outputs the latest blockchain that will be passed on to the new
connected node */

var initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

/*  Handles various messages, which will issue switch cases that passes into the handleblockchain function for further actions */

var initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

/* Handles error where if a connection is closed , it will be removed from the sockets array  and announce its closed */

var initErrorHandler = (ws) => {
    var closeConnection = (ws) => {
        console.log('Connection failed to node: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

/* The data collected in addition to the username and public key will be used to generate the nextblock */

var generateNextBlock = (blockData, username, publickey) => {
    var previousBlock = getLatestBlock();
    var nextIndex = previousBlock.index + 1;
    var nextTimestamp = new Date().getTime() / 1000;
    var nextHash = calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash, username, publickey);
};

/* returns SHA256 hash for the block by using its index,previous hash, time-stamp , and data */

var calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.timestamp, block.data);
};

var calculateHash = (index, previousHash, timestamp, data) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};


/* This function sees if the newBlock is valid before adding it to the blockchain */

var addBlock = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock);
    }
};

var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('Block with invalid index');
        return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('Block has invalid previous hash');
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('Block with invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
        return false;
    }
    return true;
};

/* Connects each of the peers to each other  , otherwise returns connection error */

var connectToPeers = (newNodes) => {
    newNodes.forEach((nodes) => {
        var ws = new WebSocket(nodes);
        console.log("node :" + nodes )
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('Connection error, invalid IP : ' + nodes)
        });
    });
};


/* This handles the necessary actions for the blockchain when a block is received */

var handleBlockchainResponse = (message) => {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = getLatestBlock();
/* If the index from the latest block of the index is higher than the old block and has the correct hash it will be added to the blockchain and
broadcasted */
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('Blockchain is most likely behind. We have: ' + latestBlockHeld.index + ' Received ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log('Appending to Blockchain');
            blockchain.push(latestBlockReceived);
            broadcast(responseLatestMsg());
/* If a new user joins it will receive the most updated blockchain */

        } else if (receivedBlocks.length === 1) {
            console.log('Quering Blockchain from nodes');
            broadcast(queryAllMsg());

/* If the received blockchain is much longer than current blockchain , it will replace and update the blockchain */

        } else {
            console.log('Received blockchain is longer than current blockchain');
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('Received blockchain is not longer than current blockchain. Do nothing');
    }
};

/* Replaces the chain if the length of the receieved blocks are longer than the most recent blockchain. */

var replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
        console.log('Received valid Blockchain... Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        broadcast(responseLatestMsg());
    } else {
        console.log('Received invalid Blockchain');
    }
};

/* Checks to see if the blockchain is valid */

var isValidChain = (blockchainToValidate) => {

/* If the genesis block is not the same as the original one , it will be invalidated */

    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(createFirstBlock())) {
        return false;
    }

/* Checks every block and if every block is validated , it returns true */

    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
};

/* Outputs the latest block */

var getLatestBlock = () => blockchain[blockchain.length - 1];

/* Queries the response responseLatestMsg */

var queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});

/* Queries the responseLatestMsg */

var queryAllMsg = () => ({'type': MessageType.QUERY_ALL});

/* Passes the blockchain for the handleBlockChain Response to see if it can replace the chain or needs update */

var responseChainMsg = () =>({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchain)
});

/* Passes the latest block to the handleBlockChain Response to see if it can be appended */

var responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});

var write = (ws, message) => ws.send(JSON.stringify(message));
var broadcast = (message) => sockets.forEach(socket => write(socket, message));

connectToPeers(list_of_nodes);
initHttpServer();
initP2PServer();
