const shell = require('shelljs')
const fs = require('fs-extra')
const path = require('path')
const program  = require('commander')
const ora = require('ora')
const spinner = ora('开始检查配置\n')
const configPath= path.resolve(process.cwd(),'./config.json')
const repo = require('./libs/repo')
exports.init = async (process) => {
    spinner.start()
    if (!shell.which('taro')) {
        spinner.fail('必须先安装taro-> npm install -g @tarojs/cli 或者运行 yarn global add @tarojs/cli');
        shell.exit(1);
    } else {

        const isExists =await fs.pathExists(configPath);

        if(!isExists) {
            spinner.fail('错误:配置文件不存在!')
        } else {
            repo.run(process,spinner)
        }

    }
}
