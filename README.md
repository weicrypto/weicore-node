Weicore Node
============

A Wei full node for building applications and services with Node.js. A node is extensible and can be configured to run additional services. At the minimum a node has an interface to [Wei Core (weid) v0.13.0](https://github.com/weipay/wei/tree/v0.13.0.x) for more advanced address queries. Additional services can be enabled to make a node more useful such as exposing new APIs, running a block explorer and wallet service.

## Usages

### As a standalone server

```bash
git clone https://github.com/weicrypto/weicore-node
cd weicore-node
npm install
./bin/weicore-node start
```

When running the start command, it will seek for a .weicore folder with a weicore-node.json conf file.
If it doesn't exist, it will create it, with basic task to connect to weid.

Some plugins are available :

- Insight-API : `./bin/weicore-node addservice @weicrypto/insight-api`
- Insight-UI : `./bin/weicore-node addservice @weicrypto/insight-ui`

You also might want to add these index to your wei.conf file :
```
-addressindex
-timestampindex
-spentindex
```

### As a library

```bash
npm install @weicrypto/weicore-node
```

```javascript
const weicore = require('@weicrypto/weicore-node');
const config = require('./weicore-node.json');

let node = weicore.scaffold.start({ path: "", config: config });
node.on('ready', function() {
    //Wei core started
    weid.on('tx', function(txData) {
        let tx = new weicore.lib.Transaction(txData);
    });
});
```

## Prerequisites

- Wei Core (weid) (v0.13.0) with support for additional indexing *(see above)*
- Node.js v8+
- ZeroMQ *(libzmq3-dev for Ubuntu/Debian or zeromq on OSX)*
- ~20GB of disk storage
- ~1GB of RAM

## Configuration

Weicore includes a Command Line Interface (CLI) for managing, configuring and interfacing with your Weicore Node.

```bash
weicore-node create -d <wei-data-dir> mynode
cd mynode
weicore-node install <service>
weicore-node install https://github.com/yourname/helloworld
weicore-node start
```

This will create a directory with configuration files for your node and install the necessary dependencies.

[comment]: <> (todo update later)
Please note that [Dash Core](https://github.com/dashpay/dash/tree/master) needs to be installed first.

For more information about (and developing) services, please see the [Service Documentation](docs/services.md).

## Add-on Services

There are several add-on services available to extend the functionality of Bitcore:

- [Insight API](https://github.com/weicrypto/insight-api/tree/master)

## Documentation

- [Upgrade Notes](docs/upgrade.md)
- [Services](docs/services.md)
  - [Weid](docs/services/weid.md) - Interface to Wei Core
  - [Web](docs/services/web.md) - Creates an express application over which services can expose their web/API content
- [Development Environment](docs/development.md) - Guide for setting up a development environment
- [Node](docs/node.md) - Details on the node constructor
- [Bus](docs/bus.md) - Overview of the event bus constructor
- [Release Process](docs/release.md) - Information about verifying a release and the release process.


## Setting up dev environment (with Insight)

Prerequisite : Having a weid node already runing `weid --daemon`.

Weicore-node : `git clone https://github.com/weicrypto/weicore-node -b develop`
Insight-api (optional) : `git clone https://github.com/weicrypto/insight-api -b develop`

Install them :
```
cd weicore-node && npm install \
 && cd ../insight-ui && npm install \
 && cd ../insight-api && npm install && cd ..
```

Symbolic linking in parent folder :
```
npm link ../insight-api
npm link ../insight-ui
```

Start with `./bin/weicore-node start` to first generate a ~/.weicore/weicore-node.json file.
Append this file with `"@weicrypto/insight-api"` in the services array.

## License

Code released under [the MIT license](https://github.com/weicrypto/weicore-node/blob/master/LICENSE).

Copyright 2021 Wei Core Group, Inc.

- dashcoin: Copyright 2016-2020 Dash Core Group, Inc.

- bitcoin: Copyright (c) 2009-2015 Bitcoin Core Developers (MIT License)
