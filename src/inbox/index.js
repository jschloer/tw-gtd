var inquirer = require('inquirer');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

function forEachPromise(items, fn, context) {
  return items.reduce(function(promise, item) {
    return promise.then(function() {
      return fn(item, context);
    });
  }, Promise.resolve());
}

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
async function completeTask(taskId) {
  const { stdout, stderr } = await exec(`task ${taskId} done`);
  return stdout;
}
async function createTasks(tasks) {
  return forEachPromise(tasks, newTask => {
    return exec(`task add ${newTask}`);
  });
}

async function removeTaskFromInbox(taskId) {
  const { stdout, stderr } = await exec(`task ${taskId} mod -in`);
  return stdout;
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
        message: 'Incubate, add to Reference, or Delete',
        name: 'action',
        choices: [
          { name: 'Incubate', value: 'incubate' },
          { name: 'Reference', value: 'reference' },
          { name: 'Delete', value: 'delete' },
        ],
      },
    ])
    .then(result => {
      switch (result.action) {
        case 'delete':
          //call the task delete command
          deleteTask(task.uuid);
          break;
        case 'incubate':
          //remove the inbox flag and add the later flag
          maybeLaterTask(task.uuid);
          break;
        case 'reference':
          // get the current task info and display
          //remind user to store the information somewhere
          //delete
          vorpalInstance.log(
            'Make sure to add that item to your reference library and then delete it'
          );
          break;
        default:
          console.log('Not sure what happened');
      }
    });
};
const handleActionableTask = (task, vorpalInstance) => {
  return vorpalInstance
    .prompt([
      {
        type: 'confirm',
        name: 'taskProject',
        message: 'Does this action require more than one action?',
      },
    ])
    .then(result => {
      if (result.taskProject) {
        return handleProjectTask(task, vorpalInstance);
      } else {
        return handleNonProjectTask(task, vorpalInstance);
      }
    });
};
const handleProjectTask = (task, vorpalInstance) => {
  return vorpalInstance
    .prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'What is the name of the project for this task? ',
      },
    ])
    .then(result => {
      // now ask the user to enter the names of tasks for this project
      // how do we deal with contexts.... Let's just enter them with the task for now
      //return vorpalInstance.prompt([{type: 'input', name:'task name'}])
      //console.log('vorpalInstance: ', vorpalInstance);
      return handleProjectAddTask(vorpalInstance, []).then(newTasks => {
        const taskNames = newTasks.map(newTask => {
          return `proj:${result.projectName} ${newTask}`;
        });
        return createTasks(taskNames).then(() => {
          return deleteTask(task.uuid);
          //console.log('Now we would delete the original task');
        });
      });
    });
};
const handleProjectAddTask = (vorpalInstance, newTasks) => {
  // ask the user for the name of a task and add if they enter nothing, then end
  return vorpalInstance
    .prompt([
      {
        type: 'input',
        name: 'taskName',
        message: 'Enter a task name(leave blank if finished):',
      },
    ])
    .then(result => {
      if (result.taskName.trim() === '') {
        return newTasks;
      } else {
        return handleProjectAddTask(vorpalInstance, [
          ...newTasks,
          result.taskName,
        ]);
      }
    });
};
const handleNonProjectTask = (task, vorpalInstance) => {
  return vorpalInstance
    .prompt([
      {
        type: 'confirm',
        name: 'doItNow',
        message: 'Will this take <2 minutes?',
      },
    ])
    .then(result => {
      if (result.doItNow) {
        return vorpalInstance
          .prompt([
            {
              type: 'list',
              name: 'complete',
              message: 'You should do it now. Skip or mark as completed?',
              choices: [
                { name: 'Skip', value: false },
                { name: 'Complete', value: true },
              ],
            },
          ])
          .then(secondResult => {
            if (secondResult.complete) {
              completeTask(task.uuid);
            }
          });
      } else {
        // we should do a lot more, like verify context, etc, but for now just remove the -in
        removeTaskFromInbox(task.uuid);
      }
    });
};

exports.default = vorpal => {
  vorpal
    .command('inbox')
    .description('Processes the inbox tasks')
    .alias('in')
    .action(function(args, cb) {
      get_in_tasks().then(tasks => {
        if (tasks.length > 0) {
          this.log("Here's the first task in your inbox");
        } else {
          this.log('Inbox is empty');
        }
        forEachPromise(tasks, handleInboxTask, this).then(() => {
          console.log('done');
          cb();
        });
      });
    });
};
