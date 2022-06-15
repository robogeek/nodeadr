# nodeadr
OpenADR implementation in TypeScript for Node.js (partial)

This repository contains an initial stab at OpenADR for Node.js written in TypeScript.  At the moment it only supports implementing a PULL-mode Virtual End Node (VEN).  It has only been tested against the OpenLEADR Virtual Top Node (VTN).

At the moment it implements a small subset of OpenADR 2.0b:

* It can use _oadrCreatePartyRegistration_ to connect with a VTN.
* The `start` method sets up a job scheduler, which is meant to be the means for scheduling report execution.
* The `start` method initializes a Poll job, to send _OadrPoll_ requests to the VTN.
* The `poll` method has the initial bones of dispatching Poll responses to handler functions.

This means it does not:

* Listen to Event's from the VTN
* Register reports with the VTN
* Handle other Registration tasks
* Support canceling Registration or Report operations

This library also does not contain enough to implement a VTN.

This library was created by studying the following OpenADR implementations:

* https://github.com/OpenLEADR/openleadr-python
* https://github.com/bbartling/openadrtester
* https://github.com/Argonne-National-Laboratory/node-red-contrib-oadr-ven

The latter is written in Node.js, but is also written for the NodeRED environment.  NodeADR is meant to be used in generic Node.js, and not be limited to NodeRED.

A trivial example:

```js
import * as VEN from './dist/client.js';

const VEN_NAME = process.env['VEN_NAME'];
const VEN_ID   = process.env['VEN_ID'];
const VTN_URL  = process.env['VTN_URL'];

const ven = new VEN.OpenADRClient(VEN_NAME, VEN_ID, VTN_URL);

await ven.start()
```

This sets up the VEN, and starts the scheduler.  The only job, as said above, is OadrPoll.

