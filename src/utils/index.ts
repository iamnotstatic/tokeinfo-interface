import unicryptLockerAbi from '../abis/unicryptV2Locker.json';
import pinksaleLockerAbi from '../abis/pinksaleLocker.json';

export interface ILiquidityLock {
  id: string;
  amount: number;
  initialAmount: number;
  lockDate: number;
  unlockDate: number;
  owner: string;
  expired: boolean;
}
export const getLiquidityLocks = async (
  web3: any,
  pair: string,
  tokenAddress: string,
  unicryptLcokerAddress: string,
  pinksaleLockerAddress: string,
  decimals: number
) => {
  const liquidityLocksData = [];
  let totalLockedLiquidity: number = 0;

  const currentTimestamp = new Date().valueOf() / 1000;

  // Init Unicrypt Locker
  const unicryptLocker = new web3.eth.Contract(
    unicryptLockerAbi,
    unicryptLcokerAddress
  );
  const unicryptGetLocksLength = await unicryptLocker.methods
    .getNumLocksForToken(pair)
    .call();

  // Init pinksaleLocker
  const pinksaleLocker = new web3.eth.Contract(
    pinksaleLockerAbi,
    pinksaleLockerAddress
  );

  const pinksaleGetTokenLockLength = await pinksaleLocker.methods
    .totalLockCountForToken(tokenAddress)
    .call();

  for (let i = 0; i < unicryptGetLocksLength; i++) {
    const lock = await unicryptLocker.methods.tokenLocks(pair, i).call();

    if (currentTimestamp < parseInt(lock.unlockDate)) {
      totalLockedLiquidity += parseInt(lock.amount, 10);
    }

    liquidityLocksData.push({
      id: lock.lockID,
      lockDate: parseInt(lock.lockDate),
      amount: lock.amount / 10 ** decimals,
      initialAmount: lock.initialAmount / 10 ** decimals,
      unlockDate: parseInt(lock.unlockDate),
      owner: lock.owner,
      expired: parseInt(lock.unlockDate) < currentTimestamp,
    });
  }

  if (pinksaleGetTokenLockLength > 0) {
    const index = 0;

    const locks = await pinksaleLocker.methods
      .getLocksForToken(tokenAddress, index, pinksaleGetTokenLockLength )
      .call();

    console.log(locks);

    for (const lock in locks) {
      console.log(locks[lock].amount);
    }
  }

  // if (currentTimestamp < parseInt(lock.unlockDate)) {
  //   totalLockedLiquidity += parseInt(lock.amount, 10);
  // }

  // liquidityLocksData.push({
  //   id: lock.lockID,
  //   lockDate: parseInt(lock.lockDate),
  //   amount: lock.amount / 10 ** decimals,
  //   initialAmount: lock.initialAmount / 10 ** decimals,
  //   unlockDate: parseInt(lock.unlockDate),
  //   owner: lock.owner,
  //   expired: parseInt(lock.unlockDate) < currentTimestamp,
  // });

  return { liquidityLocksData, totalLockedLiquidity };
};
