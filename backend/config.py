"""Configuration helpers for the LNbits integration used by the Flask helper app."""

import os


def _get_env(key: str, default: str | None = None) -> str | None:
    """Return an environment variable value or the provided default.

    Using a helper keeps the small Flask app free from direct environment lookups,
    and makes the supported settings obvious in one place.
    """

    return os.getenv(key, default)


# Admin (wallet) key used to generate on-chain addresses.
LNBITS_ADMIN_KEY = _get_env("LNBITS_ADMIN_KEY")

# Invoice key used to create and check Lightning invoices.
LNBITS_INVOICE_KEY = _get_env("LNBITS_INVOICE_KEY")

# Base URL for the LNbits deployment.
LNBITS_API_URL = _get_env("LNBITS_API_URL", "https://legend.lnbits.com")
