const colors = {
    debug: `\x1b[36m`,
    info: `\x1b[32m`,
    error: `\x1b[31m`,
    warn: `\x1b[33m`,
    reset: `\x1b[0m`,
};

function info(content) {
    let input = `${colors.info}[${new Date().toLocaleString()}] INFO: ${content}\n${colors.reset}`;
    Bun.write(Bun.stdout, input);
}

function debug(content) {
    let input = `${colors.debug}[${new Date().toLocaleString()}] DEBUG: ${content}\n${colors.reset}`;
    Bun.write(Bun.stdout, input);
}

function warn(content) {
    let input = `${colors.warn}[${new Date().toLocaleString()}] WARN: ${content}\n${colors.reset}`;
    Bun.write(Bun.stdout, input);
}
function error(content) {
    let input = `${colors.error}[${new Date().toLocaleString()}] ERROT: ${content}\n${colors.reset}`;
    Bun.write(Bun.stdout, input);
}

export default {
    info,
    error,
    warn,
    debug,
};
