import { JWKInterface } from 'arweave/node/lib/wallet';
import * as fs from 'fs';
import {
  LoggerFactory,
  WarpFactory,
  defaultCacheOptions,
} from 'warp-contracts';

import { keyfile } from '../constants';
import { deployedContracts } from '../deployed-contracts';

(async () => {
  //~~~~~~~~~~~~~~~~~~~~~~~~~~UPDATE THE BELOW~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // This is the Smartweave Source Code Transaction that will be added to the approved white list of ANTs
  const roleName = 'Full Control';

  const target = 'WALLET ADDRESS'
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // This is the production ArNS Registry Smartweave Contract TX ID
  const aclContractTxId = deployedContracts.contractTxId;

  // Initialize `LoggerFactory`
  LoggerFactory.INST.logLevel('error');

  // ~~ Initialize SmartWeave ~~
  const warp = WarpFactory.forMainnet(
    {
      ...defaultCacheOptions,
      inMemory: true,
    },
    true,
  );

  // Get the key file used for the distribution
  const wallet: JWKInterface = JSON.parse(
    await fs.readFileSync(keyfile).toString(),
  );

  // Read the Contract
  const pst = warp.pst(aclContractTxId);
  pst.connect(wallet);

  // Grant the role
  const txId = await pst.writeInteraction({
    function: 'grantRole',
    target,
    roleName
  });
  console.log(
    'Finished adding the ANT Source Code TX to the approved white list with txid: %s',
    txId,
  );
})();
