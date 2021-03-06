var inquirer = require('inquirer');
var vorpal = require('vorpal')();
var inbox = require('./inbox').default;

async function ls() {
  const { stdout, stderr } = await exec('ls');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
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

inbox(vorpal);

vorpal.delimiter('gtd $');
vorpal.show();
