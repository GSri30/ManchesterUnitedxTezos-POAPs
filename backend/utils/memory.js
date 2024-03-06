const { readFileSync, writeFileSync, existsSync } = require('fs');

const getMemory = () => {
    if (!existsSync(`${__dirname}/memory.json`)) {
        writeFileSync(`${__dirname}/memory.json`, JSON.stringify({ "accounts": {} }, null, 2));
    }
    return JSON.parse(readFileSync(`${__dirname}/memory.json`));
}

const updateMemory = (memory) => {
    writeFileSync(`${__dirname}/memory.json`, JSON.stringify(memory, null, 2));
};

const getStatus = (wallet) => {
    const memory = getMemory();
    const account = memory.accounts[wallet];
    if (!account)
        return 0;
    else
        return account.status;
}

const toggleStatus = (wallet, key) => {
    const memory = getMemory();
    if (key) {
        const account = memory.accounts[wallet];
        if (!account)
            memory.accounts[wallet] = { status: key };
        else
            account.status = key;
    } else {
        const account = memory.accounts[wallet];
        if (!account)
            memory.accounts[wallet] = { status: 0 };
        else
            account.status = 0;
    }
    updateMemory(memory);
}

const isPaused = () => {
    const memory = getMemory();
    if (!memory.paused)
        return false;
    return memory.paused === true;
}

const togglePause = () => {
    const memory = getMemory();
    if (!memory.paused)
        memory.paused = 1;
    memory.paused = memory.paused === false ? true : false;
    updateMemory(memory);
}

const isAllBusy = () => {
    const memory = getMemory();
    if (Object.keys(memory.accounts).length < process.env.NO_OF_WALLETS)
        return false;
    const accounts = memory.accounts;
    for (const account in accounts) {
        if (accounts[account].status === 0)
            return false;
    }
    return true;
}

module.exports = { getMemory, updateMemory, getStatus, toggleStatus, isPaused, togglePause, isAllBusy };