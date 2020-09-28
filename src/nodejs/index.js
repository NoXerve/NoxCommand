/**
 * @file NoxCommand Service index file. [index.js]
 * @author idoleat <dppss92132@gmail.com>
 * @copyright 2019-2020 nooxy. All Rights Reserved.
 */

'use strict';

/**
 * @module NoxCommand
 */

const Initializer = require('./initializer');
const Manifest = require('./manifest.json');

function NoxCommand(noxerve_agent, preloader_parameters){
     this._noxerve_agent = noxerve_agent;
     this._preloader_parameters = preloader_parameters;
     this._deploy = function() {};
}

NoxCommand.prototype.start = function(finish_start) {
    console.log(Manifest.service_display_name + ' service(version ' + Manifest.service_version + ') worker started.');
    console.log(Manifest.service_description);

    const if_error_close_preloader = (error, next) => {
        if(error) {
            finish_start(1);
            console.log(error);
            setTimeout(() => {this._preloader_parameters.closePreloader()}, 100);
        }
        else {/*
            this._noxerve_agent.Service.onActivityCreate('default', (parameter, service_of_activity)=> {
                // service_of_activity.define('');
            });*/
            next();
        }
    };

    const initailize_noxerve_agent_worker = () => {
      Initializer.initailizeNoXerveAgentWorker(this._noxerve_agent, this._preloader_parameters, (error) => {
        if_error_close_preloader(error, ()=> {
          finish_start(1);
        });
      });
    };

    // Initialize.
    if(Initializer.isMyWorkerFilesInitailized()) {
        this._noxerve_agent.start((error) => {
            if_error_close_preloader(error, ()=> {
                initailize_noxerve_agent_worker();
            });
        });
    }

    else {
        console.log('NoxCommand Service files not initailized. Initializing...');
        Initializer.initailizeMyWorkerFiles(this._noxerve_agent, this._preloader_parameters, (error) => {
            if_error_close_preloader(error, ()=> {
                console.log('NoxCommand Service files Initialized.');
                this._noxerve_agent.start((error) => {
                    if_error_close_preloader(error, ()=> {
                        initailize_noxerve_agent_worker();
                    });
                });
            });
        });
    }
}

NoxCommand.prototype.close = function() {

}

// version
NoxCommand.prototype.version = function() {
    console.log('version: ' + Manifest.service_version);
}

module.exports = NoxCommand;
