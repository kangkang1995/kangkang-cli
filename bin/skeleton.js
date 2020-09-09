#!/usr/bin/env node

process.env.NODE_PATH = __dirname + '/../node_modules/';

const program = require('commander');


// 定义当前版本
// 可以修改帮助信息的首行提示
program
  .version(require('../package').version);

// 定义使用方法
program
  .usage('<command>');

program
  .command('add')
  .description('Add a new template')
  .alias('a')
  .action(() => {
    require('../command/add')()
  });

program
  .command('list')
  .description('List all the templates')
  .alias('l')
  .action(() => {
    require('../command/list')()
  });

program
  .command('init')
  .description('Generate a new project')
  .alias('i')
  .action((name) => {
    require('../command/init')(name)
  });

program
  .command('delete')
  .description('Delete a template')
  .alias('d')
  .action(() => {
    require('../command/delete')()
  });

program.parse(process.argv);

if (!program.args.length) {
  program.help()
}