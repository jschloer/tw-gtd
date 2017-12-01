var inquirer = require('inquirer');
var vorpal = require('vorpal')();

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function ls() {
  const { stdout, stderr } = await exec('ls');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}
async function get_in_tasks() {
  const { stdout, stderr } = await exec('task status:pending +in export');
  //console.log('stdout:', stdout);
  //console.log('stderr:', stderr);
  const taskList = JSON.parse(stdout);
  return taskList;
  //console.log('taskList[0].description: ', taskList[0].description);
}
const test = () => {
  get_in_tasks().then(res => {
    console.log('output: ', res);
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'task',
          choices: res.map(task => ({
            name: task.description,
            value: task.id,
          })),
          message: 'Choose a task',
        },
      ])
      .then(answers => {});
  });
};
vorpal
  .mode('in', 'Processes the inbox tasks')
  .init(function(args, callback) {
    this.log('Entering Inbox processing mode.');
    get_in_tasks().then(tasks => {
      this.log('The following tasks are in the inbox:');

      tasks.forEach(task => {
        this.log(`${task.id} ${task.description}`);
      });
      callback();
    });
  })
  .action(function(command, cb) {
    this.prompt([
      {
        type: 'list',
        name: 'taskAction',
        choices: [
          { name: 'Make project', value: 'project' },
          { name: 'Activate', value: 'activate' },
        ],
        message: 'What would you like to do with this item?',
      },
    ]).then(answers => {
      const options = { sessionId: this.session.id };
      vorpal._exitMode(options);
      cb();
    });
  });

vorpal.show();
