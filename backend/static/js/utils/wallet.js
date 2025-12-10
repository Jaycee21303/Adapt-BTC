export async function generateWallet(useTestnet = false) {
  const seedPhrase = crypto.randomUUID();
  const wif = crypto.randomUUID().replace(/-/g, '').slice(0, 32);
  const address = `${useTestnet ? 'tb1' : 'bc1'}${Math.random().toString(36).substring(2, 12)}`;
  return { seedPhrase, wif, address };
}
