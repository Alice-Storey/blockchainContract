## Introduction
Blockchain contract is an application that leverages blockchain technology to distribute contracts between users on a unsecure network in a secure manner. The application is divided in 2 parts; user interface with a backend database and a controller to manage node to node communication. The purpose of the user interface is for auditing purposes and to display information about the contracts associated with the user. The application user interface will also be used to interact with the blockchain on the node where the user is logged in. The interface will also be used to display a list of users registered and their public key. This application will be designed and fully tested on a local network.

## Requirements
##### - Frontend Engine
```
  - NodeJS v10.0.0
  - blockChainServer
    - Port 9090
  - blockChainUI
    - Port 8080
```

##### - Back-End Engine
```
  - Docker 18.03.1-ce-mac65 (24312)
  - MySQL 5.7.21
  - Admin port 3333
```

##### - NPM Libraries :
```
  "body-parser": "^1.16.1",
  "crypto-js": "3.1.9-1",
  "ejs": "^2.5.6",
  "evilscan": "^1.6.1",
  "express": "^4.14.1",
  "express-session": "^1.15.1",
  "multer": "^1.3.0",
  "mysql": "^2.13.0",
  "req-flash": "0.0.3",
  "request": "^2.85.0",
  "ws": "0.4.31",
  "request": "2.85.0"
```

##### - Database Design

```
CREATE TABLE `blockchaincontract`.`contracts` (
  `id_contracts` INT NOT NULL AUTO_INCREMENT,
  `received` VARCHAR(45) NULL,
  `send` VARCHAR(45) NULL,
PRIMARY KEY (`id_contracts`));

CREATE TABLE IF NOT EXISTS `blockchaincontract`.`users` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `first_name` text NOT NULL,
  `last_name` text NOT NULL,
  `user_name` varchar(20) NOT NULL,
  `email` text NOT NULL,
  `password` varchar(15) NOT NULL,
  `public_key` varchar(4096) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=4 ;

```

## Installation
### Linux only
How to install NodeJS
```
  Step 1: curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
  Step 2: sudo apt-get install -y nodejs
  Step 3: Go into the directory of the project. Run 'npm install' and it will install all the dependencies of the program
  Step 4: Run 'node blockChainServer.js'
  Step 5: Run 'node blockChainUI.js'
```
### Mac Only
How to install NodeJS
```

```

### Windows only
```

```

## Example
```

```

## HTTP API

##### Get blockchain
```
curl http://localhost:8080/getBlockChain
```

##### Add block
```
curl -H "Content-type:application/json" --data '{"data" : "TEST BLOCK 0", "username" : "alice", "publickey" : "mypublickey"}' http://localhost:8080/addBlock
```

##### Add node
```
curl -H "Content-type:application/json" --data '{"node" : "ws://localhost:3333"}' http://localhost:8080/addNode
```

#### Get nodes
```
curl http://localhost:8080/getNodes
```

#### Get System Info
```
curl http://localhost:8080/getNodes
```
