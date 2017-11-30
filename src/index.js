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
console.log('taskList[0].description: ', taskList[0].description);
}
get_in_tasks();
