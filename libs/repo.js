const shell = require('shelljs')
const fs = require('fs-extra')
const path = require('path')
const cwd = process.cwd()
exports.run = async(process,spinner)=>{
    const isExists =await fs.pathExists(process.cwd(),'./temp');
    spinner.color = 'red';
    spinner.text = '正在进行操作'
    if(!isExists) {
        shell.mkdir('-p',path.resolve(cwd, './temp'));
        shell.cd(path.resolve(cwd, './temp'));

        this.cloneRepo(spinner,isExists);
    } else {
        shell.rm('-rf', path.resolve(cwd, './temp'))
        shell.mkdir('-p',path.resolve(cwd, './temp'));
        shell.cd(path.resolve(cwd, './temp'));

        this.cloneRepo(spinner,isExists);
    }
}
exports.cloneRepo = async(spinner,isExists,current) => {
    spinner.color = 'yellow';
    spinner.text = '正在拷贝文件'
    shell.exec('git clone git@github.com:RichardLee1978/WI-template-default.git',(code,out,err)=> {
        if(code!==0) {
            spinner.fail('clone 失败');
        } else {
            spinner.succeed('clone 成功');

            let dir = ''
            shell.ls('-d',process.cwd()+'/*').forEach(function (file) {
              dir = file
            });
            shell.cd(dir);
            shell.rm('-rf',['.git','.gitignore']);
        }
    });

}
