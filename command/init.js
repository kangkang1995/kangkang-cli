'use strict';
const exec = require('child_process').exec;
const fs = require('fs');
const co = require('co');
const inquirer = require('inquirer');
const prompt = require('co-prompt');
const chalk = require('chalk');
const ora = require('ora');
const handlebars = require('handlebars');


const chalkTitle = chalk.hex('#73b9a2').bold;
const chalkChoose = chalk.hex('#f173ac').bold;
const chalkError = chalk.hex('#d71345').bold;
const chalkSucceed = chalk.hex('#7fb80e').bold;
const chalkRunning = chalk.hex('#33a3dc').bold;

let { template, packageTemp } = require('../templates');

const promptList = [{
  type: 'input',
  message: 'project name(项目名称):',
  name: 'name',
  validate: function (val) {
    if (val) { // 校验位数
      return true;
    }
    return "项目名称不能为空";
  }
}, {
  type: 'input',
  message: 'version(版本号):',
  name: 'version',
  default: '1.0.0',
  validate: function (val) {
    if (val.match(/^\d+\.\d+\.\d+$/)) { // 校验位数
      return true;
    }
    return "请输入正确的版本号格式";
  }
}, {
  type: 'input',
  message: 'description(描述):',
  name: 'description',
}, {
  type: 'input',
  message: 'author(作者):',
  name: 'author',
}, {
  type: 'input',
  message: 'license:',
  name: 'license',
}, {
  type: 'list',
  message: 'choose the project which you want to build(选择你要构建的项目):',
  name: 'project',
  choices: template.map((item, index) => `${index + 1}.${item.name}{${item.des}}`),
  filter: function (val) {
    return val.split('.')[0]
  }
}];

module.exports = (foldName) => {
  const spinner = ora();
  const skeleton_build = (index,commandResult) => {
    let temp = template[index];
    const { name, gitUrl, branch } = temp;
    let cmdStr;
    if (typeof foldName !== 'string') {
      cmdStr = `git clone ${gitUrl} . && git checkout ${branch} && rd /s/q .git`;
    } else {
      cmdStr = `git clone ${gitUrl} ${foldName} && cd ${foldName} && git checkout ${branch} && rd /s/q .git`;
    }
    spinner.start(chalkRunning(`start run build ${name} ...`));
    exec(cmdStr, (error, stdout, stderr) => {
      if (error) {
        spinner.fail(error);
        process.exit()
      }
      const fileName = `${typeof foldName !== 'string' ? '' : `${foldName}/`}package.json`;
      if (fs.existsSync(fileName)) {
        const content = JSON.parse(fs.readFileSync(fileName));
        let {name,version,description,author,license} = commandResult;
        const newContent = Object.assign({},content,{name,version,description,author,license})
        const result = handlebars.compile(JSON.stringify(newContent, "", "\t"))(packageTemp);
        // console.log(result,'result1')
        fs.writeFileSync(fileName, result);
      }
      spinner.start(chalkRunning(`npm install ...`));
      exec(`${typeof foldName === 'string' ? `cd ${foldName} && ` : ''}npm install`, (error, stdout, stderr) => {
        if (error) {
          spinner.fail(error);
          process.exit();
        }
        spinner.succeed(chalkSucceed("build succeed!"));
        process.exit()
      });
    })
  };
  
  co( async ()=>{
    const { project, ...result } = await inquirer.prompt(promptList);
    packageTemp = Object.assign({}, packageTemp, result);
    skeleton_build(project - 1,packageTemp);
  })
};