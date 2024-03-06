const express = require('express');

const router = express.Router();

const claimNftsController = require('../controllers/claimNftsController');

router.post('/claimNft', claimNftsController.claimNft);

module.exports = router;
