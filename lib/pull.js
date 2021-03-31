const njk = require('nunjucks')
const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const ora = require('ora')
const cp = require('cli-progress')

async function pull() {
    // let ctx = {
    //     tag_name: "test",
    //     sources: ["user", "src2", "src3"],
    //     implementation: "console.log('Hello, Tester!')",
    // }
    const confQuestions = [
        {
            type: "input",
            name: "destDir",
            message: "项目文件夹?",
            default: ".",
            prefix: "🌚"
        }
    ]
    const { destDir } = await inquirer.prompt(confQuestions)
    if (!fs.existsSync(destDir)) {
        console.log(chalk.yellow(`项目文件夹(${destDir})不存在！`))
        process.exit(0)
    }
    console.log(chalk.green(`✔ ️已找到项目文件夹`))
    let spinner = ora().start()
    const implPath = path.join(path.resolve(destDir), 'implementations')
    const srcPath = path.join(path.resolve(destDir), 'sources')
    spinner.text = `Checking ${chalk.blue('implementations')} folder at ${chalk.cyan(implPath)}`
    if (fs.existsSync(implPath)) {
        spinner.succeed(chalk.green(`Implementations Folder Found!`))
    } else {
        spinner.text = chalk.yellow(`Could not find source directory at ${implPath}`)
        spinner.stopAndPersist()
        if (await confirmMkdir(implPath)) {
            fs.mkdirSync(implPath)
            spinner.start()
            spinner.succeed(chalk.green(`Created ${chalk.blue('implementations')} folder at ${chalk.cyan(implPath)}`))
        } else {
            spinner.fail(chalk.red(`User Cancel`))
            process.exit(0)
        }
    }
    spinner = ora().start()
    spinner.text = `Checking ${chalk.blue('sources')} folder at ${chalk.cyan(srcPath)}`
    if (fs.existsSync(srcPath)) {
        spinner.succeed(chalk.green(`Sources Folder Found!`))
    } else {
        spinner.text = chalk.yellow(`Could not find source directory at ${srcPath}`)
        spinner.stopAndPersist()
        if (await confirmMkdir(srcPath)) {
            spinner.start()
            fs.mkdirSync(srcPath)
            spinner.succeed(chalk.green(`Created ${chalk.blue('sources')} folder at ${chalk.cyan(srcPath)}`))
        } else {
            spinner.fail(chalk.red(`User Cancel`))
            process.exit(0)
        }
    }
    spinner = ora({text: "Fetching database..."}).start()
    try {
        let {sources, implementations} = await fetchDatabase()
        spinner.succeed(chalk.green(`Data Fetched!`))
        console.log(`${chalk.blue(sources.length)} sources & ${chalk.blue(implementations.length)} implementations`)
        generateSources(sources, srcPath)
        generateImplementations(implementations, implPath)
    } catch (e) {
        spinner.fail(`Something wrong: ${e}`)
    } finally {
        spinner.stop()
        process.exit(0)
    }
}

async function confirmMkdir(dir) {
    return (await inquirer.prompt([
        {
            type: 'confirm',
            name: 'mkdir',
            message: `Path ${path.resolve(dir)} not exists, create one?`,
            default: true
        }
    ]))['mkdir']
}

/**
 * Query database and sync local implementations and sources
 * @returns {Promise<object>}
 */
async function fetchDatabase() {
    return {
        sources: [
            {
                id: "",
                name: "",
                desc: "",
                implementation: "",
            },
        ],
        implementations: [
            {
                id: "",
                tag_name: "",
                implementation: "",
                sources: [
                    "src1",
                    "src2",
                    "src3",
                ],
            },
        ],
    }
}

function generateSources(sources, dir) {
    const progress = new cp.SingleBar({
        format: "Generating sources\t\t{bar} {percentage}% | Duration: {duration}s | ETA: {eta}s",
        stopOnComplete: true,
        fps: 60,
        position: 'center',
    }, cp.Presets.shades_classic)
    progress.start(sources.length, 0)
    try {
        for (let i = 0; i < sources.length; i++) {
            let src = sources[i]
            generateSrc(src, src.name + '.js', dir)
            progress.increment()
        }
    } finally {
        progress.stop()
    }
}

function generateImplementations(implementations, dir) {
    const progress = new cp.SingleBar({
        format: "Generating implementations\t{bar} {percentage}% | Duration: {duration}s | ETA: {eta}s",
        stopOnComplete: true,
        fps: 60,
        position: 'center',
    }, cp.Presets.shades_classic)
    progress.start(implementations.length, 0)
    try {
        for (let i = 0; i < implementations.length; i++) {
            let impl = implementations[i]
            generateImpl(impl, impl.id + '.js', dir)
            progress.increment()
        }
    } finally {
        progress.stop()
    }
}

function generateImpl(context, filename, outPath) {
    njk.configure('templates', {autoescape: false})
    const res = njk.render("implementation.js.njk", context)
    fs.writeFileSync(path.join(outPath, filename), res)
}

function generateSrc(context, filename, outPath) {
    njk.configure('templates', {autoescape: false})
    const res = njk.render("source.js.njk", context)
    fs.writeFileSync(path.join(outPath, filename), res)
}

module.exports = pull