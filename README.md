# acl-contract

An Access Control List SmartWeave Contract for use with Arweave File System entities.

This simple, tokenless SmartWeave Contract is designed to be easy to use, easy to understand and easy for ArFS enabled clients to integrate with to generate both Drive States and File States. It can also be used to control other in-app experiences.

The contract allows its owner (the creator of the contract) to add other users to an access control list. This list stores which permissions each user has, as well as the start and end block height. This lets downstream clients know what other ArFS data to query for and what block range. The contract includes some default groups for visitors, members and full control over the given entity. Full control gives the user the ability to add other access controls.

ArFS-enabled clients must match the entity owner (aka the wallet that created the entity.) to the owner of the contract in order to pair the ACL. In addition to syncing the drive owner changes, they must also sync the changes made by each user. This ensures the drive state contains all changes made by all users, and also allows for other members to write to that given entity.
