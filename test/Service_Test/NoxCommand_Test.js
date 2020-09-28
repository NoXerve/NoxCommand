/**
 * @file NoxFile tester file. [NoxFileTest.js]
 * @author idoleat <dppss92132@gmail.com>
 * @copyright 2019-2020 nooxy. All Rights Reserved.
 * @description Start testing by enter command "node NoxFileTest.js".
 */

'use strict';

const fs = require('fs');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const finish_ServiceStart = (exit_code) => {
    console.log('Finish ServiceStart with code ' + exit_code + '. (0 means you are good :D)');
}

const test_indexs = {
  1: 'Start_as_worker1',
  2: 'worker2_join',
  3: 'worker3_join'
};

const Start_as_worker1 = function(){
    // SWITCH TO WORKER 1 DIRECTORY TO SIMULATE RUNNING SERVICE ON WORKER 1.
    console.log('== Switching to worker 1 simulation....');
    try {
        process.chdir('/home/idoleat/NoxCommand/test/Service_Test/worker1');
        console.log('New working directory: ' + process.cwd());
    }
    catch (err) {
        console.log('Fail to switch to worker1: ' + err);
    }

    // Temporary way to pass preloader parameters since no launcher here.
    const worker1_preloader_parameters = require(process.cwd() + '/settings/PreLoadParameters.json');

    // New a NoXerve Agent for Worker 1.
    let worker1_NoXerveAgent = new(require('/home/idoleat/NoXerve/src/noxerve_agent/nodejs/index'))({
        secured_node: true,
        rsa_2048_key_pair: {
            public: fs.readFileSync('./public.pem', 'utf8'),
            private: fs.readFileSync('./private.pem', 'utf8'),
        }
    });

    let worker1 = new(require('/home/idoleat/NoxCommand/src/nodejs/index'))(worker1_NoXerveAgent, worker1_preloader_parameters);

    // First worker. press 1 to setup.
    worker1.start(finish_ServiceStart);
}

const worker2_join = function() {
    // switch to worker 2 directory
    console.log('== Switching to worker 2 simulation....');
    try {
        process.chdir('/home/idoleat/NoxCommand/test/Service_Test/worker2');
        console.log('New working directory: ' + process.cwd());
    }
    catch (err) {
        console.log('Fail to switch to worker2: ' + err);
    }

    // Temporary way to pass preloader parameters since no launcher here.
    const worker2_preloader_parameters = require(process.cwd() + '/settings/PreLoadParameters.json');

    // New a NoXerve Agent for Worker 2.
    let worker2_NoXerveAgent = new(require('/home/idoleat/NoXerve/src/noxerve_agent/nodejs/index'))({
        secured_node: true,
        rsa_2048_key_pair: {
            public: fs.readFileSync('./public.pem', 'utf8'),
            private: fs.readFileSync('./private.pem', 'utf8'),
        }
    });

    let worker2 = new(require('/home/idoleat/NoxCommand/src/nodejs/index'))(worker2_NoXerveAgent, worker2_preloader_parameters);

    // press 2 to join worker 1
    //worker2.start(finish_ServiceStart);
    worker2.version();
}

const worker3_join = function(){
    // switch to worker 3 directory
    console.log('== Switching to worker 3 simulation....');
    try {
        process.chdir('/home/idoleat/NoxCommand/test/Service_Test/worker3');
        console.log('New working directory: ' + process.cwd());
    }
    catch (err) {
        console.log('Fail to switch to worker3: ' + err);
    }

    // Temporary way to pass preloader parameters since no launcher here.
    const worker3_preloader_parameters = require(process.cwd() + '/settings/PreLoadParameters.json');

    // New a NoXerve Agent for Worker 3.
    let worker3_NoXerveAgent = new(require('/home/idoleat/NoXerve/src/noxerve_agent/nodejs/index'))({
        secured_node: true,
        rsa_2048_key_pair: {
            public: fs.readFileSync('./public.pem', 'utf8'),
            private: fs.readFileSync('./private.pem', 'utf8'),
        }
    });

    let worker3 = new(require('/home/idoleat/NoxCommand/src/nodejs/index'))(worker3_NoXerveAgent, worker3_preloader_parameters);

    // press 2 to join worker 1
    //worker3.start(finish_ServiceStart);
    worker3.version();
}

const test_loop = () => {
    rl.question('[Test] Input test index to execute test.\n'+JSON.stringify(test_indexs, null, 2)+'\n>>> ', (test_index) => {
        if(test_index == 1) Start_as_worker1();
        else if(test_index == 2) worker2_join();
        else if(test_index == 3) worker3_join();

        test_loop();
    });
}

Start_as_worker1();
