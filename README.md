This project is an example of a backend for a site with users follwing each other.
You can see how Neo4j can be used with a minimal wrapper around it's HTTP API and how you can use ES6 Promises for writing and testing
completely callbackless code.

Stack used is:

1. Node.js 0.12
2. Bluebird Promises
3. Neo4j (without any package just the request http node client for interfacing with the Rest API)
4. Mocha testing framework
5. Chai-as-promised
6. Babel transpiler


Running it:

1. download and run the no4j community edition server.
2. clone this repo
3. edit config/default.json
4. npm install
5. npm test test/*
