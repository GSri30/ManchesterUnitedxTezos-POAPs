import smartpy as sp

from smartpy.templates import fa1_2 as fa12

m = fa12.m

@sp.module
def main():
    
    class ManUnPOAP(
        m.Fa1_2,
        m.Admin,
        m.Pause,
        m.Mint,
        m.Burn,
        m.ChangeMetadata
    ):
        def __init__(self, administrator, metadata, ledger, token_metadata):
            m.ChangeMetadata.__init__(self)
            m.Burn.__init__(self)
            m.Mint.__init__(self)
            m.Pause.__init__(self)
            m.Admin.__init__(self, administrator)
            m.Fa1_2.__init__(self, metadata, ledger, token_metadata)

@sp.add_test()
def test():
    sc = sp.test_scenario("Manchester United POAP", [m, main])
    sc.h1("Manchester United POAP Tests")
    sc.p("A test to directly mint fa1.2 tokens to user.")

    sc.h2("Accounts")
    admin = sp.test_account("Administrator")
    coadmin1 = sp.test_account("Co-Admin 1")
    coadmin2 = sp.test_account("Co-Admin 2")
    coadmins = sp.list([coadmin1, coadmin2])
    alice = sp.test_account("Alice")
    bob = sp.test_account("Bob")
    sc.show([admin, alice, bob])

    sc.h2("FA1.2 contract")
    token_metadata = {
            "decimals": sp.scenario_utils.bytes_of_string(
                "18"
            ),  # Mandatory by the spec
            "name": sp.scenario_utils.bytes_of_string("MANUNPOAP"),  # Recommended
            "symbol": sp.scenario_utils.bytes_of_string("MANUNPOAP"),  # Recommended
            # Extra fields
            "icon": sp.scenario_utils.bytes_of_string(
                "https://smartpy.io/static/img/logo-only.svg"
            ),
        }
    contract_metadata = sp.scenario_utils.metadata_of_url(
            "ipfs://QmaiAUj1FFNGYTu8rLBjc3eeN9cSKwaF8EGMBNDmhzPNFd"
        )
    fa12_test = main.ManUnPOAP(
        administrator=admin.address,
        metadata=contract_metadata,
        token_metadata=token_metadata,
        ledger={}
    )
    sc += fa12_test

    sc.h2("Mint")
    fa12_test.mint(sp.record(address = alice.address, value = 10),
                  _sender = admin.address,
                  _valid = True)

@sp.add_test()
def test():
    sc = sp.test_scenario("Origination", [m, main])

    token_metadata = {
            "decimals": sp.scenario_utils.bytes_of_string(
                "18"
            ),  # Mandatory by the spec
            "name": sp.scenario_utils.bytes_of_string("MANUNPOAP"),  # Recommended
            "symbol": sp.scenario_utils.bytes_of_string("MANUNPOAP"),  # Recommended
            # Extra fields
            "icon": sp.scenario_utils.bytes_of_string(
                "https://smartpy.io/static/img/logo-only.svg"
            ),
        }
    contract_metadata = sp.scenario_utils.metadata_of_url(
            "ipfs://QmaiAUj1FFNGYTu8rLBjc3eeN9cSKwaF8EGMBNDmhzPNFd"
        )
    fa12_test = main.ManUnPOAP(
        administrator=sp.address("tz1TuAWC3z9ZgEMgHWVUCPubgSMpSZEePK2k"),
        metadata=contract_metadata,
        token_metadata=token_metadata,
        ledger={}
    )
    sc += fa12_test