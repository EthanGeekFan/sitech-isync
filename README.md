# Si-Tech iSync

CLI Tool for syncing tag implementation from database to local server

用于同步数据库中的标签计算逻辑到本地代码

## 使用方法

```shell
Usage: isync [options] [command]

Options:
  -h, --help      display help for command

Commands:
  pull [options]  Pull changes from source data base
  help [command]  display help for command
```

## Get Started
### Pull from database
Type the command and hit `Enter`, then follow the instructions:

输入以下命令后按`回车`，随后跟随提示操作：
```shell
$ isync pull
🌚 项目文件夹? (.) 
✔ 已找到项目文件夹
✔ Implementations Folder Found!
✔ Sources Folder Found!
✔ Data Fetched!
1 sources & 1 implementations
Generating sources              ████████████████████████████████████████ 100% | Duration: 0s | ETA: 0s
Generating implementations      ████████████████████████████████████████ 100% | Duration: 0s | ETA: 0s
```

## Developer
具体获取数据库代码的函数在`lib/pull.js`中的`fetchDatabase()`，并且包含了返回值样例。