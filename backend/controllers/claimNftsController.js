/* eslint-disable no-unused-vars */
/* eslint-disable no-console */

const tezosUtils = require('../utils/tezos_utils');
const { checkClaimed } = require('../utils/db');
const { isPaused } = require('../utils/memory/memory');

exports.claimNft = async (req, res, next) => {
  const { emailAddress, userAddress } = req.body;

  // check if walletAddress are passed as parameters
  if (!userAddress) {
    res.json({
      title: 'Invalid parameters',
      subtitle: 'Wallet address not provided'
    });
    return;
  }

  // check if NFT claiming is paused
  if (isPaused()) {
    res.json({
      title: 'NFT claiming paused',
      subtitle: 'Please try again after some time.'
    });
    return;
  }

  // // check if userAddress is not already in claim list for particular emailAddress
  // const claimedMessage = await checkClaimed(emailAddress, userAddress);
  // if (claimedMessage) {
  //   res.json({
  //     title: 'Already claimed',
  //     subtitle: claimedMessage
  //   });
  //   return;
  // }

  // create the transaction for activate and send nfts
  tezosUtils.addToMempool(emailAddress, userAddress);

  res.json({
    status: 'success',
    title: 'NFT claim successful',
    subtitle: 'View your new NFT within five minutes in the app.'
  });
};
