var datefns = require('date-fns');
// Set of functions to interact with taskwarrior
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// this takes a list of items, a function and context returns a promise made up from calling the given function for each item
function forEachPromise(items, fn, context) {
  return items.reduce(function(promise, item) {
    return promise.then(function() {
      return fn(item, context);
    });
  }, Promise.resolve());
}
function formatDateTimeForTW(inputDate) {
  return datefns.format(inputDate, 'YYYY-MM-DDTHH:mm:ss');
}

async function get_in_tasks() {
  const { stdout, stderr } = await exec('task status:pending +in export');
  const taskList = JSON.parse(stdout);
  return taskList;
}
async function getTasksCompletedWithin(startDate, endDate) {
  let filterString = '';
  if (startDate) {
    filterString += ` end.after=${formatDateTimeForTW(startDate)}`;
  }
  if (endDate) {
    filterString += ` end.before=${formatDateTimeForTW(endDate)}`;
  }
  console.log('filterString: ', filterString);
  const query = `task status:completed ${filterString} export`;
  console.log('query: ', query);
  const { stdout, stderr } = await exec(query);
  const taskList = JSON.parse(stdout);
  return taskList;
}
async function getCurrentProjects() {
  const { stdout, stderr } = await exec('task _projects');
  const projectList = stdout.split('\n');
  return projectList;
}
async function deleteTask(taskId) {
  const { stdout, stderr } = await exec(
    `task rc.confirmation=off ${taskId} delete -y`
  );
  return stdout;
}
async function maybeLaterTask(taskId) {
  const { stdout, stderr } = await exec(`task ${taskId} mod -in +later`);
  return stdout;
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
module.exports = {
  get_in_tasks,
  getCurrentProjects,
  deleteTask,
  maybeLaterTask,
  completeTask,
  createTasks,
  removeTaskFromInbox,
  getTasksCompletedWithin,
};
