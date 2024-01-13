module.exports = {
    log_all(...args) {
        process.stderr.write("[Logger] ");
        args.forEach(element => {
            process.stdout.write(`[${element}]`);
        });
        console.log();
    },
    log(string) {
        process.stderr.write("[Logger] ");
        process.stdout.write(string);
        console.log();
    }
}