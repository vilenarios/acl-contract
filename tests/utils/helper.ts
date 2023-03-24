import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import * as fs from 'fs';
import path from 'path';

import { DriveConfigState } from '../../src/contracts/types/types';
import { DEFAULT_WALLET_FUND_AMOUNT } from './constants';

// ~~ Write function responsible for adding funds to the generated wallet ~~
export async function addFunds(
  arweave: Arweave,
  wallet: JWKInterface,
  amount: number = DEFAULT_WALLET_FUND_AMOUNT,
): Promise<boolean> {
  const walletAddress = await arweave.wallets.getAddress(wallet);
  await arweave.api.get(`/mint/${walletAddress}/${amount}`);
  return true;
}

// ~~ Write function responsible for mining block on the Arweave testnet ~~
export async function mineBlock(arweave: Arweave): Promise<boolean> {
  await arweave.api.get('mine');
  return true;
}

export async function createLocalWallet(
  arweave: Arweave,
): Promise<{ wallet: JWKInterface; address: string }> {
  // ~~ Generate wallet and add funds ~~
  const wallet = await arweave.wallets.generate();
  const address = await arweave.wallets.jwkToAddress(wallet);
  await addFunds(arweave, wallet);
  return {
    wallet,
    address,
  };
}

export function getLocalWallet(index = 0): JWKInterface {
  const wallet = JSON.parse(
    fs.readFileSync(path.join(__dirname, `../wallets/${index}`), 'utf8'),
  ) as unknown as JWKInterface;
  return wallet;
}

export function getLocalACLContractId(): string {
  const contract = JSON.parse(
    fs.readFileSync(
      path.join(__dirname, `../contract/acl_contract.json`),
      'utf8',
    ),
  ) as unknown as DriveConfigState & { id: string };
  return contract.id;
}

export * from '../../src/utilities';
