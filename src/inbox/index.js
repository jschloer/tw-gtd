var inquirer = require('inquirer');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function get_in_tasks() {
  const { stdout, stderr } = await exec('task status:pending +in export');
  const taskList = JSON.parse(stdout);
  return taskList;
}
async function deleteTask(taskId) {
  const { stdout, stderr } = await exec(
    `task rc.confirmation=off ${taskId} delete -y`
  );
  //console.log('stdout: ', stdout);
  return stdout;
  //return exec(`task ${taskId} delete -y`);
}
async function maybeLaterTask(taskId) {
  const { stdout, stderr } = await exec(`task ${taskId} mod -in +later`);
  //console.log('stdout: ', stdout);
  return stdout;
  //return exec(`task ${taskId} mod -in +later`);
}
const handleInboxTask = (task, vorpalInstance) => {
  //given a task, display it and give the user the first question
  vorpalInstance.log(`${task.id} ${task.description}`);
  return vorpalInstance
    .prompt([
      {
        type: 'confirm',
        name: 'taskActionable',
        message: 'Is this task actionable?',
      },
    ])
    .then(result => {
      if (result.taskActionable) {
        return handleActionableTask(task, vorpalInstance);
      } else {
        return handleNonActionableTask(task, vorpalInstance);
      }
    });
};

const handleNonActionableTask = (task, vorpalInstance) => {
  return vorpalInstance
    .prompt([
      {
        type: 'list',
        message: 'Delete, Incubate, or add to Reference',
        name: 'action',
        choices: [
          { name: 'Delete', value: 'delete' },
          { name: 'Incubate', value: 'incubate' },
          { name: 'Reference', value: 'reference' },
        ],
      },
    ])
    .then(result => {
      switch (result.action) {
        case 'delete':
          //call the task delete command
          deleteTask(task.id);
          break;
        case 'incubate':
          //remove the inbox flag and add the later flag
          maybeLaterTask(task.id);
          break;
        case 'reference':
          // get the current task info and display
          //remind user to store the information somewhere
          //delete
          break;
        default:
          console.log('Not sure what happened');
      }
    });
};
const handleActionableTask = (task, vorpalInstance) => {
  console.log('actionable');
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
