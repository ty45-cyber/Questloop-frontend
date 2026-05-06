// QuestLoop — src/lib/wallet.js
// Phantom wallet adapter: connect, sign message, disconnect

export async function connectWallet() {
  const provider = window?.solana;
  if (!provider?.isPhantom) {
    throw new Error("Phantom wallet not found. Install at phantom.app");
  }
  const resp = await provider.connect();
  return resp.publicKey.toString();
}

export async function signMessage(message) {
  const provider = window?.solana;
  if (!provider) throw new Error("Wallet not connected");
  const encoded = new TextEncoder().encode(message);
  const { signature } = await provider.signMessage(encoded, "utf8");
  return bufferToBase58(signature);
}

export async function disconnectWallet() {
  await window?.solana?.disconnect();
}

function bufferToBase58(buffer) {
  const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let num = BigInt("0x" + [...buffer].map(b => b.toString(16).padStart(2, "0")).join(""));
  const digits = [];
  while (num > 0n) {
    digits.unshift(ALPHABET[Number(num % 58n)]);
    num /= 58n;
  }
  for (const byte of buffer) {
    if (byte !== 0) break;
    digits.unshift("1");
  }
  return digits.join("");
}