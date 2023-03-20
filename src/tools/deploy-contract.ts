import { DriveConfigState } from '@/contracts/types/types';
import Arweave from 'arweave';
import * as fs from 'fs';
import path from 'path';
import {
  LoggerFactory,
  WarpFactory,
  defaultCacheOptions,
} from 'warp-contracts';

import { keyfile } from '../constants';

(async () => {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~UPDATE THE BELOW~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // A short token symbol
  const ticker = 'ACL-2C69';

  // A friendly name for the name of ACL
  const name = 'ArFS Access Control List Test';

  // The type of arfs entity this relates to
  const type = 'drive';

  // The ID of the arfs entity this relates to
  const id = '2c69d539-7cab-4468-a2f4-793312c7ff53';
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // ~~ Initialize Arweave ~~
  const arweave = Arweave.init({
    host: 'arweave.net',
    timeout: 600000,
    port: 443,
    protocol: 'https',
  });

  // ~~ Initialize `LoggerFactory` ~~
  LoggerFactory.INST.logLevel('error');

  // ~~ Initialize SmartWeave ~~
  const warp = WarpFactory.forMainnet(
    {
      ...defaultCacheOptions,
      inMemory: true,
    },
    true,
  );
  // ~~ Generate Wallet and add funds ~~
  // const wallet = await arweave.wallets.generate();
  // const walletAddress = await arweave.wallets.jwkToAddress(wallet);
  const wallet = JSON.parse(await fs.readFileSync(keyfile).toString());
  const walletAddress = await arweave.wallets.jwkToAddress(wallet);

  // Create the initial state for ANT v0.1.6
  const initialState: DriveConfigState = {
    owner: walletAddress,
    name,
    ticker,
    entity: {
      id,
      type,
    },
    permissions: [
      'viewItems',
      'viewVersions',
      'writeFiles',
      'createFolders',
      'modifyItems',
      'managePermissions',
    ],
    roles: {
      'Full Control': {
        description:
          'This role can read, write and manage permissions on this entity',
        permissions: [
          'viewItems',
          'viewVersions',
          'writeFiles',
          'createFolders',
          'modifyItems',
          'managePermissions',
        ],
      },
      Member: {
        description: 'This role can read and write to this entity',
        permissions: [
          'viewItems',
          'viewVersions',
          'writeFiles',
          'createFolders',
          'modifyItems',
        ],
      },
      Guest: {
        description:
          'This role can read current and historical versions of this entity',
        permissions: ['viewItems', 'viewVersions'],
      },
    },
    acl: {},
    evolve: null,
  };

  // ~~ Deploy contract ~~
  // ~~ Read contract source and initial state files ~~
  const contractSrc = fs.readFileSync(
    path.join(__dirname, '../../dist/contract.js'),
    'utf8',
  );

  // ~~ Deploy contract ~~
  const contractTxId = await warp.deploy(
    {
      wallet,
      initState: JSON.stringify(initialState),
      src: contractSrc,
    },
    true,
  ); // disable bundling

  // ~~ Log contract id to the console ~~
  console.log('Mainnet Contract id %s', contractTxId);
})();
