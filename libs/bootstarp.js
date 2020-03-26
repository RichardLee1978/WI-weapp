const inquirer = require('inquirer')
const chalkPipe = require('chalk-pipe')
const program  = require('commander')
const ora = require('ora')
const shell = require('shelljs')
const fs = require('fs-extra')
const path = require('path')
inquirer.registerPrompt('chalk-pipe', require('inquirer-chalk-pipe'))
const build = require('./build')

exports.create = async(spinner)=>{
    spinner.text='开始配置令牌';
        spinner.stop();
        spinner.clear();
    const isExists =await fs.pathExists(process.cwd(),'./auth.json');
    if(!isExists) {
        spinner.fail('配置文件不存在！');
        spinner.stop();
        spinner.clear();
        shell.exit(1);
    } else {
        await this.authFile(spinner);
    }
}
exports.authFile = async(spinner) => {
    try {
        const authObj = await fs.readJson(path.resolve(process.cwd(),'./auth.json'))
        await this.rebuildAuth(spinner,authObj);
    } catch(err) {
        spinner.fail('令牌文件格式错误！');
        spinner.stop();
        spinner.clear();
        shell.exit(1);
    }
}
exports.rebuildAuth = async(spinner,authObj)=> {
    try{
        spinner.stop();
        spinner.clear();
        const promptList = [{
            type: 'chalk-pipe',
            name: 'tempName',
            message: '请输入模版名称',
            default: 'default'
        }, {
            type: 'chalk-pipe',
            name: 'tempId',
            message: '请输入id',
            default: 'default'
        }];
        const {
            tempName,
            tempId
        } = await inquirer.prompt(promptList);
        let auth_obj = {
            user:authObj.user,
            repository:authObj.repository,
            branch:authObj.branch,
            filename:tempName+'/'+tempId+'.config.json',
            download:authObj.download,
            AccessToken:authObj.AccessToken
        }
        const authPath = path.join(process.cwd(),'./auth.json');
        fs.writeFileSync(authPath, JSON.stringify(auth_obj));
        
        await this.requestConfig(authPath,tempName,tempId);
        
    } catch(err) {
        spinner.fail('创建令牌文件失败！');
        shell.exit(1);
    }
}
exports.requestConfig = async(authPath,name,id)=> {
    try {
        const auth = await fs.readJson(authPath)
        const mkcurl = 'curl -H '
        const curltoken = '\'Authorization: token '+ auth.AccessToken+'\''
        const curlaccept = ' -H \'Accept: application/vnd.github.v3.raw\''
        const curlopts = ' -O -S '+ auth.download+'/'+auth.user+'/'+auth.repository+'/contents/'+auth.filename
        const curl = mkcurl+curltoken+curlaccept+curlopts;
        const doCurl = await shell.exec(curl);
        const configPath = path.resolve(process.cwd(),'./'+id+'.config.json')
        const isConfigExists = await fs.pathExists(configPath)
        const spinnerbuild = ora('开始进行配置\n')
        if(isConfigExists) {
            spinnerbuild.start();
            const config = await fs.readJson(configPath);
            await build.run(spinnerbuild,configPath);

        } else {
            spinnerbuild.fail('远程文件获取失败');
           shell.exit(1);
        }
        
    } catch(err) {
        console.log(err)
    }
}