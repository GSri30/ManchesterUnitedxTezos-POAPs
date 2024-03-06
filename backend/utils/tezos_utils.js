/* eslint-disable prefer-destructuring */
/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { InMemorySigner } = require('@taquito/signer');
const taquito = require('@taquito/taquito');

const memory = require('./memory/memory');
const { addClaimed } = require('./db');
const { infoLogger } = require('./loggers');

const mempool = [];
const keys = [];
for (let i = 0; i < process.env.NO_OF_WALLETS; i++) {
  keys.push(i);
}

// sleep function
// function sleep(ms) {
//   // eslint-disable-next-line no-promise-executor-return
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

const shuffleArray = (array) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const getRandomNftId = async (address) => {
  const tzktApi = process.env.TZKT_API;
  const nftContract = process.env.NFT_CONTRACT;
  const response = await fetch(
    `${tzktApi}/v1/tokens/balances?account=${address}&token.contract=${nftContract}&balance.gt=0&select=token.tokenId&limit=1000`,
  );
  const nftIds = await response.json();

  if (nftIds.length === 0) {
    return null;
  }

  const randIdx = Math.floor(Math.random() * nftIds.length);
  return nftIds[randIdx];
};

// send Tx
async function sendTx(emailAddress, userAddress, signer, nftId) {
  try {
    const tezToolKit = new taquito.TezosToolkit(process.env.RPC_URL);
    tezToolKit.setProvider({
      signer: signer,
    });
    const contract = await tezToolKit.contract.at(process.env.NFT_CONTRACT);
    const transferParams = [
      {
        from_: await signer.publicKeyHash(),
        txs: [
          {
            to_: userAddress,
            token_id: nftId,
            amount: 1,
          },
        ],
      },
    ];
    const batch = tezToolKit.wallet
      .batch()
      .withContractCall(contract.methods.transfer(transferParams))
      .withTransfer({ to: userAddress, amount: 1, mutez: true });
    const operation = await batch.send();
    infoLogger('Operation hash: ' + operation.opHash);
    await operation.confirmation();
    infoLogger(`Sent tx to (${emailAddress},${userAddress}) from account: ${await signer.publicKeyHash()}`);

    return operation.opHash;
  } catch (error) {
    infoLogger(
      `FAILED to sent tx from account: ${await signer.publicKeyHash()}`,
    );
    infoLogger(error);
    return;
  }
}

// send Tx
async function mintTx(emailAddress, userAddress, signer, nftId) {
  try {
    const tezToolKit = new taquito.TezosToolkit(process.env.RPC_URL);
    tezToolKit.setProvider({
      signer: signer,
    });
    const contract = await tezToolKit.contract.at(process.env.NFT_CONTRACT);
    const mintParams = {
      address: userAddress,
      value: 1
    };
    const batch = tezToolKit.wallet
      .batch()
      .withContractCall(contract.methods.mint(userAddress, 1));
    const operation = await batch.send();
    infoLogger('Operation hash: ' + operation.opHash);
    await operation.confirmation();
    infoLogger(`Sent tx to (${emailAddress},${userAddress}) from account: ${await signer.publicKeyHash()}`);

    return operation.opHash;
  } catch (error) {
    infoLogger(
      `FAILED to sent tx from account: ${await signer.publicKeyHash()}`,
    );
    console.log(error);
    infoLogger(error);
    return;
  }
}

// check status of accounts and send tx
async function checkStatusAndSendTx(emailAddress, userAddress) {
  // if all memory is busy, return
  if (memory.isAllBusy()) {
    infoLogger('All memory is busy, adding to mempool');
    return;
  }

  mempool.splice(mempool.indexOf({ emailAddress, userAddress }), 1);
  infoLogger('Mempool update: ' + JSON.stringify(mempool));
  shuffleArray(keys);

  try {
    for (const key of keys) {
      // if account is not busy and account hold the perticular token
      if (memory.getStatus(key) === 0) {
        memory.toggleStatus(key, 1);
        const signer = InMemorySigner.fromMnemonic({
          mnemonic: process.env.MNEMONIC,
          derivationPath: `m/44'/1729'/${key}'/0'`,
        });
        const signerAddress = await signer.publicKeyHash();
        // const nftId = await getRandomNftId(signerAddress);
        const nftId = 1
        if (nftId !== null) {
          const tezToolKit = new taquito.TezosToolkit(process.env.RPC_URL);
          tezToolKit.setProvider({ signer: signer });
          const balance = await tezToolKit.tz.getBalance(signerAddress);
          const tezBalance = balance.toNumber() / 1000000;
          if (tezBalance > 0.22) {
            // send tx
            // eslint-disable-next-line no-await-in-loop
            infoLogger(
              `Sending tx to (${emailAddress},${userAddress}) from account: ${signerAddress}`,
            );
            const hash = await mintTx(emailAddress, userAddress, signer, nftId);
            if (hash) {
              // add address to claim list
              await addClaimed(emailAddress, userAddress);
              memory.toggleStatus(key);
              if (mempool.length > 0) {
                checkStatusAndSendTx(
                  mempool[0].emailAddress,
                  mempool[0].userAddress,
                );
              }
            } else {
              infoLogger('FAILED Tx: Picking up tx for ' + userAddress);
              memory.toggleStatus(key);
              checkMemoryAndPushedToMempool(emailAddress, userAddress);
            }
            // after Tx is sent, update status of account and remove from mempool and -1 hold and +1 sold in account and config.nfts
            // check if mempool is not empty then send tx
            break;
          } else {
            infoLogger(`Account ${key} does not have enough tez`);
            memory.toggleStatus(key);
            checkMemoryAndPushedToMempool(emailAddress, userAddress);
            break;
          }
        } else {
          infoLogger(`Account ${key} does not hold any NFT`);
          memory.toggleStatus(key);
          checkMemoryAndPushedToMempool(emailAddress, userAddress);
          break;
        }
      } else {
        infoLogger(`Account ${key} is busy`);
        memory.toggleStatus(key);
        checkMemoryAndPushedToMempool(emailAddress, userAddress);
        break;
      }
    }
  } catch (error) {
    mempool.push({ emailAddress, userAddress });
    // if (!memory.isAllBusy()) checkStatusAndSendTx(emailAddress, userAddress);

    infoLogger('Mempool update: ' + JSON.stringify(mempool));
    infoLogger(error);
  }
}

function checkMemoryAndPushedToMempool(emailAddress, userAddress) {
  if (!memory.isAllBusy()) checkStatusAndSendTx(emailAddress, userAddress);
  else mempool.push({ emailAddress, userAddress });
}

exports.addToMempool = async (emailAddress, userAddress) => {
  mempool.push({ emailAddress, userAddress });
  infoLogger('Mempool update: ' + JSON.stringify(mempool));
  // check status of accounts find which one is available and then send the tx
  checkStatusAndSendTx(emailAddress, userAddress);
};
