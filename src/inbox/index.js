var inquirer = require('inquirer');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function get_in_tasks() {
  const { stdout, stderr } = await exec('task status:pending +in export');
  const taskList = JSON.parse(stdout);
  return taskList;
}
const handleInboxTask = (task, vorpalInstance) => {
  //given a task, display it and give the user the first question
  vorpalInstance.log(`${task.id} ${task.description}`);
  return vorpalInstance.prompt([
    {
      type: 'list',
      name: 'taskAction',
      choices: [
        { name: 'Make project', value: 'project' },
        { name: 'Activate', value: 'activate' },
      ],
      message: 'What would you like to do with this item?',
    },
  ]);
};

function forEachPromise(items, fn, context) {
  return items.reduce(function(promise, item) {
    return promise.then(function() {
      return fn(item, context);
    });
  }, Promise.resolve());
}

exports.default = vorpal => {
  vorpal
    .command('inbox')
    .description('Processes the inbox tasks')
    .alias('in')
    .action(function(args, cb) {
      get_in_tasks().then(tasks => {
        this.log('The following tasks are in the inbox:');
        forEachPromise(tasks, handleInboxTask, this).then(() => {
          console.log('done');
          cb();
        });
      });
    });
};
