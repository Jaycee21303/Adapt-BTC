import os
import secrets
from dataclasses import dataclass

from bitcoin import SelectParams
from bitcoin.wallet import CBitcoinSecret, P2PKHBitcoinAddress


@dataclass
class WalletData:
    wif: str
    address: str
    network: str


def generate_wallet(testnet: bool = False) -> WalletData:
    SelectParams("testnet" if testnet else "mainnet")
    secret_key = secrets.token_hex(32)
    wif_key = CBitcoinSecret.from_secret_bytes(bytes.fromhex(secret_key))
    address = P2PKHBitcoinAddress.from_pubkey(wif_key.pub)
    return WalletData(wif=str(wif_key), address=str(address), network="testnet" if testnet else "mainnet")
