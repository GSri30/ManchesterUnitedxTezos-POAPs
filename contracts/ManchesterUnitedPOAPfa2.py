import smartpy as sp

from smartpy.templates import fa2_lib as fa2
from smartpy.templates import fa2_lib_testing as testing

t = fa2.t
main = fa2.main

@sp.module
def m():

    class ManchesterUnitedPOAP(
        main.Admin,
        main.Nft,
        main.ChangeMetadata,
        main.WithdrawMutez,
        main.MintNft,
        main.BurnNft,
        main.OffchainviewTokenMetadata,
        main.OnchainviewBalanceOf,
    ):
        def __init__(self, administrator, metadata, ledger, token_metadata):
            main.OnchainviewBalanceOf.__init__(self)
            main.OffchainviewTokenMetadata.__init__(self)
            main.BurnNft.__init__(self)
            main.MintNft.__init__(self)
            main.WithdrawMutez.__init__(self)
            main.ChangeMetadata.__init__(self)
            main.Nft.__init__(self, metadata, ledger, token_metadata)
            main.Admin.__init__(self, administrator)

@sp.add_test()
def test():
    sc = sp.test_scenario("ManchesterUnitedPOAP Testing", [sp.utils, fa2.t, fa2.main, m])
    sc.h1("Manchester United POAPs for Testing")
    sc.p("A call to all the standard entrypoints and off-chain views.")

    sc.h2("Accounts")
    admin = sp.test_account("Administrator")
    alice = sp.test_account("Alice")
    bob = sp.test_account("Bob")
    sc.show([admin, alice, bob])

    sc.h2("FA2 contract")
    token_metadata = fa2.make_metadata(name="MANUN POAP", decimals=1, symbol="MANUN")
    manunpoap = m.ManchesterUnitedPOAP(
        administrator = admin.address,
        metadata = sp.scenario_utils.metadata_of_url("ipfs://example"),
        ledger = {},
        token_metadata = []
    )
    sc += manunpoap

    sc.h2("Entrypoint: Mint NFT")
    """
    list(record(metadata, to_))
    """
    tok0_md = fa2.make_metadata(name="MANUN POAP", decimals=1, symbol="MANUN")
    manunpoap.mint(
        [sp.record(metadata=tok0_md, to_=alice.address)],
        _sender = admin,
        _valid = True
    )

@sp.add_test()
def test():
    sc = sp.test_scenario("Origination", [sp.utils, fa2.t, fa2.main, m])
    
    manunpoap = m.ManchesterUnitedPOAP(
        administrator = sp.address("tz1TuAWC3z9ZgEMgHWVUCPubgSMpSZEePK2k"),
        metadata=sp.scenario_utils.metadata_of_url("ipfs://example"),
        ledger = {},
        token_metadata = []
    )
    sc += manunpoap
