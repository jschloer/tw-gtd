var datefns = require('date-fns');

const tw = require('../tasklib/tasklib.js');

module.exports = vorpal => {
  vorpal
    .command('report')
    .description('Provides a work day report of completed tasks')
    .alias('rep')
    .action(function(args, cb) {
      // get the previous work day
      const dateInQuestion = datefns.subDays(
        new Date(),
        datefns.isMonday(new Date()) ? 3 : 1
      );

      return tw
        .getTasksCompletedWithin(
          datefns.startOfDay(dateInQuestion),
          datefns.endOfDay(dateInQuestion)
        )
        .then(tasks => {
          if (tasks.length > 0) {
            this.log(
              'Here are the tasks you completed on the last work day:\n'
            );
            tasks.forEach(task => {
              this.log(`   ${task.description}`);
            });
          } else {
            this.log('No tasks found...');
          }
        });
    });
};
