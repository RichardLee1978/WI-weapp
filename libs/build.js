const shell = require('shelljs')
const fs = require('fs-extra')
const path = require('path')
const cwd = process.cwd()
exports.run = async(spinner,configPath)=>{
    const isExists =await fs.pathExists(process.cwd(),'./temp');
    spinner.color = 'red';
    spinner.text = '正在进行操作'
    if(!isExists) {
        shell.mkdir('-p',path.resolve(cwd, './temp'));
        shell.cd(path.resolve(cwd, './temp'));

        this.cloneRepo(spinner,configPath);
    } else {
        shell.rm('-rf', path.resolve(cwd, './temp'))
        shell.mkdir('-p',path.resolve(cwd, './temp'));
        shell.cd(path.resolve(cwd, './temp'));

        this.cloneRepo(spinner,configPath);
    }
}
exports.cloneRepo = async(spinner,configPath) => {
    spinner.color = 'yellow';
    spinner.text = '正在从远端拷贝文件'
    const configObj = await this.willCloneRepo(spinner,configPath)
    /**
     * git clone
     */
    shell.exec('git clone '+ configObj,async(code,out,err)=> {
        if (code!==0) {
            spinner.fail('远端拷贝文件失败');
            spinner.stop();
            spinner.clear();
            shell.exit(1);
        } else {
            let dir = ''
            shell.ls('-d',process.cwd()+'/*').forEach(function (file) {
              dir = file
            });
            shell.cd(dir);
            shell.rm('-rf',['.git','.gitignore','./wi-config']);
            shell.mv(['./config','./src','./package.json','./.eslintrc','./.editorconfig','./project.config.json'],cwd);
            shell.rm('-rf',cwd+'./temp');
            shell.cd(cwd)
            spinner.color = 'magenta';
            
            /**
             * npm install
             */
            
            await this.npmInstall(spinner,configPath);
           
        }
    });
    
}
exports.mergeJson = async(spinner,ownConfigPath)=> {
    try {
        spinner.text = '正在合并配置...\n'
        
        const defConfig = await fs.readJson(cwd+'/wi-config/default.config.json');
        const ownJson = await fs.readJson(ownConfigPath);
        const newJson = Object.assign({},ownJson,defConfig);
        fs.writeFileSync(ownConfigPath,JSON.stringify(newJson));
        
        await this.npmInstall(spinner);
    } catch(err) {
        spinner.fail('合并配置错误');
        spinner.stop();
        spinner.clear();
        shell.exit(1);
    }
}
exports.willCloneRepo= async(spinner,configPath)=> {
    try {
        const configObj = await fs.readJson(configPath)
        let gitrepo = configObj.repo;
       
        if (gitrepo=='') {
            spinner.fail('读取repo字段失败,该字段不能为空');
            spinner.stop();
            spinner.clear();
            shell.exit(1);
            return false;
        }
        return gitrepo 
      } catch (err) {
        spinner.fail('读取配置文件错误');
        spinner.stop();
        spinner.clear();
        shell.exit(1);
        return false;
      }
}

exports.npmInstall = async(spinner,configPath)=>{
    spinner.text = '正在安装依赖...\n'
    shell.exec('npm install',async(code2,out2,err2) => {
        if (code2!==0) {
            spinner.fail('初始化失败');
            spinner.stop();
            spinner.clear();
            shell.exit(1);
        } else {
            spinner.color = 'cyan'
            spinner.text = '正在构建代码...\n'
            /**
             * taro task
             */
            await this.taroWillBuild(spinner,configPath);
        }
    })
}
exports.taroWillBuild = async(spinner,configOwnPath)=> {
    try {
        const configObj = await fs.readJson(configOwnPath);
        const configPath = configObj.path;
        configPath.map(item=>{
            const varObj = configObj.vars[item.name];
            for(let key in varObj) {              
                shell.sed('-i',key, varObj[key],path.resolve(process.cwd(),item.url))
            }   

        })
        
        await this.taroDoBuild(spinner,configOwnPath);
    } catch(err) {
        
        spinner.fail('读取配置文件错误');
        spinner.stop();
        spinner.clear();
        shell.exit(1);
        return false;
    }
}
exports.taroDoBuild = async(spinner,configPath)=> {
    shell.exec('npm run build:weapp',async(code3,out3,err3)=>{
        if (code3!==0) {
            spinner.fail('构建失败')
            spinner.stop();
            spinner.clear();
            shell.exit(1);
        } else {
           
            shell.rm('-rf',['./temp','./node_modules','./config','./src','./package.json','./package-lock.json','./.eslintrc','./.editorconfig','./project.config.json']);
            shell.mv('./dist/*',cwd);
            shell.rm('-rf','./dist');
            shell.rm('-rf',configPath);
            shell.rm('-rf','./auth.json');
            spinner.succeed('所有代码构建成功!');
            spinner.stop();
            spinner.clear();
            shell.exit(1);
        }
    })
}
