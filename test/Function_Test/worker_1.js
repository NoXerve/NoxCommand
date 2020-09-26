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

const my_worker_id = 1;

const my_worker_detail = {
  name: 'worker 1'
};

const my_worker_interfaces = [{
  interface_name: 'WebSocket',
  interface_settings: {
    host: '0.0.0.0',
    port: 9991
  }
},
{
  interface_name: 'WebSocket',
  interface_settings: {
    host: '0.0.0.0',
    port: 6661
  }
}];

let worker_peers_settings = {
  1: {
    interfaces_connect_settings: [{
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
    }],
    detail: {
      name: 'worker 1'
    }
  },
  2: {
    interfaces_connect_settings: [{
      interface_name: 'WebSocket',
      interface_connect_settings: {
        host: '0.0.0.0',
        port: 9992
      }
    },
    {
      interface_name: 'WebSocket',
      interface_connect_settings: {
        host: '0.0.0.0',
        port: 6662
      }
    }],
    detail: {
      name: 'worker 2'
    }
  }
};

let index = 0;

const initialize_interfaces = (callback)=> {
  const _interface = my_worker_interfaces[index];
  Node.createInterface(_interface.interface_name, _interface.interface_settings, (err, id) => {
    if (err) console.log('[Node module] Create interface error.', err);
    loop_next(callback);
  })
};

const loop_next = (callback)=> {
  // console.log(index, interfaces.length);
  index++;
  if(index < my_worker_interfaces.length) {
    initialize_interfaces(callback);
  }
  else {
    // console.log(index, interfaces.length);
    callback();
  }
};

initialize_interfaces(()=> {
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

  Worker.importMyWorkerAuthenticityData(my_worker_id, 'whatsoever_auth1', (error)=> {
    if (error) console.log('[Worker ' + my_worker_id + '] importMyWorkerAuthenticityData error.', error);
    Worker.importWorkerPeersSettings(worker_peers_settings, (error) => {
      if (error) console.log('[Worker ' + my_worker_id + '] importWorkerPeersSettings error.', error);
      process.on('message', (msg)=> {
        if(msg === '4') {
          Worker.getWorkerPeerDetail(3, (error, detail) => {
            if (error) {
              console.log('[Worker ' + my_worker_id + '] getWorkerPeerDetail error.', error);
            }
            console.log('[Worker ' + my_worker_id + '] getWorkerPeerDetail.', detail);
          });
          Worker.createWorkerSocket('purpose 1', {p: 1}, 3, (error, worker_socket)=> {
            if (error) {
              console.log('[Worker ' + my_worker_id + '] createWorkerSocket error.', error);
            }
            else {
              worker_socket.on('close', () => {
                console.log('[Worker ' + my_worker_id + '] WorkerSocket from createWorkerSocket closed.');
              });

              worker_socket.startYielding('Command', 'yield from createWorkerSocket', (error, yielding_start_parameter, finish_yield, yield_data) => {
                if (error) console.log('[Worker ' + my_worker_id + '] "Command" Yield error.', error);
                console.log('[Worker ' + my_worker_id + '] "Command" yielding_start_parameter value: ', yielding_start_parameter);

                finish_yield('neofetch');
              });
              // what's the foo for?
              worker_socket.call('exec', {foo: 'call from createWorkerSocket'}, (err, data, eof)=> {
                console.log('[Worker ' + my_worker_id + '] "exec" Return value: ', data);
                if(data.isCallableStructure){
                    data.call('exec', () => {
                        console.log('command called');
                    });
                }
                if(eof) console.log('finished worker_exec_call_test');
              });
              console.log('[Worker ' + my_worker_id + '] createWorkerSocket OK.', worker_socket);
            }
          });
        }
      });
      process.send('ready');
    });
  });
});
