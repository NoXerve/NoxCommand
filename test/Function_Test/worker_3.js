/**
 * @file NoXerveAgent tester file. [tester.js]
 * @author nooxy <thenooxy@gmail.com>
 * @author noowyee <magneticchen@gmail.com>
 * @copyright 2019-2020 nooxy. All Rights Reserved.
 * @description Start testing by enter command "node tester.js".
 */

 'use strict';

 process.on('disconnect', ()=> {
   process.exit();
 });

const Node = new(require('../../NoXerve/src/noxerve_agent/nodejs/node'))();
const NSDT = new(require('../../NoXerve/src/noxerve_agent/nodejs/nsdt'))();
const Worker = new(require('../../NoXerve/src/noxerve_agent/nodejs/worker'))();
const CommandExecutor = new(require('../src/CommandExecutor'))();

let my_worker_id = 0;
let command = '';

const worker_1_interfaces_for_joining_me = [{
    interface_name: 'WebSocket',
    interface_connect_settings: {
      host: '0.0.0.0',
      port: 9991
    }
  },
  {
    interface_name: 'WebSocket',
    interface_connect_settings: {
      host: '0.0.0.0',
      port: 6661
    }
  }
];

const my_worker_detail = {
  name: 'worker 3'
};

const my_worker_interfaces = [{
    interface_name: 'WebSocket',
    interface_settings: {
      host: '0.0.0.0',
      port: 9993
    }
  },
  {
    interface_name: 'WebSocket',
    interface_settings: {
      host: '0.0.0.0',
      port: 6663
    }
  }
];

const my_worker_interfaces_connect_settings = [{
    interface_name: 'WebSocket',
    interface_connect_settings: {
      host: '0.0.0.0',
      port: 9993
    }
  },
  {
    interface_name: 'WebSocket',
    interface_connect_settings: {
      host: '0.0.0.0',
      port: 6663
    }
  }
];


// This worker is not joined yet.
let worker_peers_settings = {};

let index = 0;

const initialize_interfaces = (callback) => {
  const _interface = my_worker_interfaces[index];
  Node.createInterface(_interface.interface_name, _interface.interface_settings, (err, id) => {
    if (err) console.log('[Node module] Create interface error.', err);
    loop_next(callback);
  })
};

const loop_next = (callback) => {
  // console.log(index, interfaces.length);
  index++;
  if (index < my_worker_interfaces.length) {
    initialize_interfaces(callback);
  } else {
    // console.log(index, interfaces.length);
    callback();
  }
};

initialize_interfaces(() => {
  console.log('[Worker ' + my_worker_id + '] initialize_interfaces ok.');

  const Protocol = new(require('../../../../NoXerve/src/noxerve_agent/nodejs/protocol'))({
    modules: {
      worker: Worker,
      nsdt: NSDT
    },
    node_module: Node
  });

  Protocol.start();

  Worker.on('worker-peer-authentication', (worker_id, worker_authenticity_information, is_valid)=> {
    console.log('[Worker ' + my_worker_id + '] "worker-peer-authentication" event. ', worker_id, worker_authenticity_information);
    if(worker_id === 0 && worker_authenticity_information === 'join_me_auth') {
      // Initailize new worker.
      is_valid(true);
    }
    else if(worker_authenticity_information === 'whatsoever_auth'+worker_id) {
      is_valid(true);
    }
    else {
      is_valid(false);
    }
  });

  Worker.on('worker-peer-join', (new_worker_peer_id, new_worker_peer_interfaces_connect_settings, new_worker_peer_detail, next) => {
    console.log('[Worker ' + my_worker_id + '] "worker-peer-join" event.', new_worker_peer_id, new_worker_peer_interfaces_connect_settings, new_worker_peer_detail);
    const on_cancel = (next_of_cancel)=> {
      console.log('[Worker ' + my_worker_id + '] "worker-peer-join" cancel.');
      next_of_cancel(false);
    };
    next(false, on_cancel);
  });

  Worker.on('worker-peer-update', (remote_worker_peer_id, remote_worker_peer_interfaces_connect_settings, remote_worker_peer_detail, next) => {
    console.log('[Worker ' + my_worker_id + '] "worker-peer-update" event.', remote_worker_peer_id, remote_worker_peer_interfaces_connect_settings, remote_worker_peer_detail);
    const on_cancel = ()=> {
      console.log('[Worker ' + my_worker_id + '] "worker-peer-update" cancel.');
      next_of_cancel(false);
    };
    next(false, on_cancel);
  });

  Worker.on('worker-peer-leave', (remote_worker_peer_id, next) => {
    console.log('[Worker ' + my_worker_id + '] "worker-peer-leave" event.', remote_worker_peer_id);
    const on_cancel = ()=> {
      console.log('[Worker ' + my_worker_id + '] "worker-peer-leave" cancel.');
      next_of_cancel(false);
    };
    next(false, on_cancel);
  });

  Worker.onWorkerSocketCreate('purpose 1', (parameters, remote_worker_id, worker_socket)=> {
    console.log('[Worker ' + my_worker_id + '] onWorkerSocketCreate OK.', parameters, remote_worker_id, worker_socket);
    worker_socket.on('close', () => {
      console.log('[Worker ' + my_worker_id + '] WorkerSocket from onWorkerSocketCreate closed.');
    });
    worker_socket.define('exec', (service_function_parameter, return_data, yield_data) => {
      console.log('[Worker ' + my_worker_id + '] WorkerSocket function on createWorkerSocket called.');

      const callable_struture = NSDT.createCallableStructure({exec: ()=> {
        console.log('[NSDT module] NSDT exec called.');
        CommandExecutor.exec(command);
      }});

      callable_struture.on('close', ()=> {
        console.log('[NSDT module] NSDT exec closed.');
      });

      yield_data(callable_struture);

    });
    worker_socket.handleYielding('Command', (yielding_handler_parameter, ready_yielding) => {
      console.log('[Worker ' + my_worker_id + '] "Command" handleYielding started.');
      console.log('[Worker ' + my_worker_id + '] Parameters value: ', yielding_handler_parameter);
      ready_yielding('"Command" ok for yielding.', (error, data, eof)=> {
        if(error) console.log('[Worker ' + my_worker_id + '] "field1" Yielding error.', error);
        console.log('[Worker ' + my_worker_id + '] "Command" Yielded value: ', data);
        command = data;
        if(eof) {
          console.log('finished worker_Command_yield_test');
        };
      });
    });
  });

  process.on('message', (msg)=> {
    if(msg === '1') {
      Worker.joinMe(worker_1_interfaces_for_joining_me, my_worker_interfaces_connect_settings,
        my_worker_detail, 'join_me_auth',
        (error, _worker_id, _worker_peers_settings) => {
          if(error) console.log('[Worker ' + my_worker_id + '] joinMe error.', error);
          else {
            my_worker_id = _worker_id;
            console.log('[Worker ' + my_worker_id + '] new worker settings.', _worker_id, JSON.stringify(_worker_peers_settings, null, 2));
            worker_peers_settings = _worker_peers_settings;
            Worker.importMyWorkerAuthenticityData(_worker_id, 'whatsoever_auth'+my_worker_id, (error) => {
              if (error) console.log('[Worker ' + my_worker_id + '] importMyWorkerAuthenticityData error.', error);

            });
          }
        });
    }
    if(msg === '2') {
      Worker.updateMe(null, {name: 'worker 3 updated.'}, (error) => {
        if(error) console.log('[Worker ' + my_worker_id + '] updateMe error.', error);
        else console.log('[Worker ' + my_worker_id + '] updateMe ok.');
      });
    }
    if(msg === '3') {
      Worker.leaveMe((error) => {
        if(error) console.log('[Worker ' + my_worker_id + '] leaveMe error.', error);
        else console.log('[Worker ' + my_worker_id + '] leaveMe ok.');
      });
    }
  });
  process.send('ready');

});
