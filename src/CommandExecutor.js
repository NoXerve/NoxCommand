const { spawn } = require("child_process");

CommandExecutor = function() {
    this.cmd = '';
}

CommandExecutor.prototype.exec = function(cmd){
    const Command = spawn(cmd);

    Command.stdout.on('data', data => {
        console.log(`stdout: ${data}`);
    });

    Command.stderr.on('data', data => {
        console.log(`stderr: ${data}`);
    });

    Command.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });

    Command.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

module.exports = CommandExecutor
