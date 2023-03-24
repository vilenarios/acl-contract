import ArLocal from 'arlocal';
import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import * as fs from 'fs';
import path from 'path';
import { LoggerFactory, PstContract, WarpFactory } from 'warp-contracts';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';

import { DriveConfigState } from '../src/contracts/types/types';
import { addFunds, mineBlock } from './utils/helper';

// Arlocal
export const arlocal = new ArLocal(1820, false);

// Arweave
export const arweave = Arweave.init({
  host: 'localhost',
  port: 1820,
  protocol: 'http',
});

// Warp
export const warp = WarpFactory.forLocal(1820, arweave).use(new DeployPlugin());
LoggerFactory.INST.logLevel('none');

jest.setTimeout(20000);

describe('Testing the ArNS Registry Contract', () => {
  let owner: string;
  let ownerWallet: JWKInterface;
  let wallet2: JWKInterface;
  let walletAddress2: string;
  let wallet3: JWKInterface;
  let walletAddress3: string;
  let wallet4: JWKInterface;
  let walletAddress4: string;
  let wallet5: JWKInterface;
  let walletAddress5: string;
  let initialState: DriveConfigState;
  let pst: PstContract;

  beforeAll(async () => {
    // ~~ Set up ArLocal and instantiate Arweave ~~
    await arlocal.start();

    // ~~ Generate wallet and add funds ~~
    ownerWallet = await arweave.wallets.generate();
    owner = await arweave.wallets.jwkToAddress(ownerWallet);
    await addFunds(arweave, ownerWallet);

    wallet2 = await arweave.wallets.generate();
    walletAddress2 = await arweave.wallets.jwkToAddress(wallet2);
    await addFunds(arweave, wallet2);

    wallet3 = await arweave.wallets.generate();
    walletAddress3 = await arweave.wallets.jwkToAddress(wallet3);
    await addFunds(arweave, wallet3);

    wallet4 = await arweave.wallets.generate();
    walletAddress4 = await arweave.wallets.jwkToAddress(wallet4);
    await addFunds(arweave, wallet4);

    wallet5 = await arweave.wallets.generate();
    walletAddress5 = await arweave.wallets.jwkToAddress(wallet5);
    await addFunds(arweave, wallet5);

    // pull source code
    const contractSrcJs = fs.readFileSync(
      path.join(__dirname, '../dist/contract.js'),
      'utf8',
    );

    const stateFromFile: DriveConfigState = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../dist/contracts/initial-state.json'),
        'utf8',
      ),
    );

    // ~~ Update initial state to use generated wallets~~
    initialState = {
      ...stateFromFile,
      ...{
        owner: owner,
      },
    };

    // deploy contract to arlocal
    const { contractTxId } = await warp.deploy(
      {
        wallet: ownerWallet,
        initState: JSON.stringify(initialState),
        src: contractSrcJs,
      },
      true, // disable bundling
    );

    // ~~ Mine block ~~
    await mineBlock(arweave);
    // ~~ Connect to the pst contract ~~
    pst = warp.pst(contractTxId);
    pst.connect(ownerWallet);
  });

  afterAll(async () => {
    const currentState = await pst.currentState();
    const currentStateString = JSON.stringify(currentState, null, 5);
    const currentStateJSON = JSON.parse(currentStateString);
    console.log(JSON.stringify(currentStateJSON, null, 10));
    // ~~ Stop ArLocal ~~
    await arlocal.stop();
  });

  // ACL Tests
  it('should read acl state and confirm owner', async () => {
    expect(await pst.currentState()).toEqual(initialState);
    expect((await pst.currentState()).owner).toEqual(owner);
  });

  it('should grant new full control role to a user in the ACL as owner', async () => {
    const roleName = 'fullControl';
    await pst.writeInteraction({
      function: 'grantRole',
      target: walletAddress2,
      roleName,
    });
    await mineBlock(arweave);
    const currentState = await pst.currentState();
    const currentStateString = JSON.stringify(currentState);
    const currentStateJSON = JSON.parse(currentStateString);
    expect(currentStateJSON.acl[walletAddress2].length).toEqual(
      currentStateJSON.roles[roleName].permissions.length,
    );
  });

  it('should grant new member role to a user in the ACL as full control user', async () => {
    pst.connect(wallet2);
    const roleName = 'member';
    await pst.writeInteraction({
      function: 'grantRole',
      target: walletAddress3,
      roleName,
    });
    await mineBlock(arweave);
    const currentState = await pst.currentState();
    const currentStateString = JSON.stringify(currentState);
    const currentStateJSON = JSON.parse(currentStateString);
    expect(currentStateJSON.acl[walletAddress3].length).toEqual(
      currentStateJSON.roles[roleName].permissions.length,
    );
  });

  it('should grant new guest role to a user in the ACL as full control user', async () => {
    const roleName = 'guest';
    await pst.writeInteraction({
      function: 'grantRole',
      target: walletAddress4,
      roleName,
    });
    await mineBlock(arweave);
    const currentState = await pst.currentState();
    const currentStateString = JSON.stringify(currentState);
    const currentStateJSON = JSON.parse(currentStateString);
    expect(currentStateJSON.acl[walletAddress4].length).toEqual(
      currentStateJSON.roles[roleName].permissions.length,
    );
  });

  it('should not grant duplicate permissions to a user in the ACL', async () => {
    const existingRole = 'fullControl';
    const roleName = 'member';
    await pst.writeInteraction({
      function: 'grantRole',
      target: walletAddress2,
      roleName,
    });
    await mineBlock(arweave);
    const currentState = await pst.currentState();
    const currentStateString = JSON.stringify(currentState);
    const currentStateJSON = JSON.parse(currentStateString);
    expect(currentStateJSON.acl[walletAddress2].length).toEqual(
      currentStateJSON.roles[existingRole].permissions.length,
    );
  });

  it('should not grant new role if invalid permissions', async () => {
    pst.connect(wallet3);
    let roleName = 'fullControl';
    await pst.writeInteraction({
      function: 'grantRole',
      target: walletAddress3,
      roleName,
    });
    await mineBlock(arweave);
    pst.connect(wallet5);
    roleName = 'fullControl';
    await pst.writeInteraction({
      function: 'grantRole',
      target: walletAddress5,
      roleName,
    });
    await mineBlock(arweave);
    const currentState = await pst.currentState();
    const currentStateString = JSON.stringify(currentState);
    const currentStateJSON = JSON.parse(currentStateString);
    expect(currentStateJSON.acl[walletAddress3].length).toEqual(
      currentStateJSON.roles['member'].permissions.length,
    );
    expect(currentStateJSON.acl[walletAddress5]).toEqual(undefined);
  });
});
