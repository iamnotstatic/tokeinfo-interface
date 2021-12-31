import unicryptLockerAbi from '../abis/unicryptV2Locker.json';
import pinksaleLockerAbi from '../abis/pinksaleLocker.json';

export interface ILiquidityLock {
  id: string;
  amount: number;
  initialAmount?: number;
  lockDate: number;
  unlockDate: number;
  owner: string;
  expired: boolean;
}
export const getPinksaleLiquidityLocks = async (
  web3: any,
  tokenAddress: string,
  pinksaleLockerAddress: string,
  decimals: number
) => {
  const pinksaleLiquidityLocksData = [];
  let pinksaleTotalLockedLiquidity: number = 0;

  const currentTimestamp = new Date().valueOf() / 1000;
  // Init pinksaleLocker
  const pinksaleLocker = new web3.eth.Contract(
    pinksaleLockerAbi,
    pinksaleLockerAddress
  );

  const pinksaleGetTokenLockLength = await pinksaleLocker.methods
    .totalLockCountForToken(tokenAddress)
    .call();
  if (pinksaleGetTokenLockLength > 0) {
    const index = 0;

    const locks = await pinksaleLocker.methods
      .getLocksForToken(tokenAddress, index, pinksaleGetTokenLockLength)
      .call();

    for (let i = 0; i < pinksaleGetTokenLockLength; i++) {
      if (currentTimestamp < parseInt(locks[i].unlockDate)) {
        pinksaleTotalLockedLiquidity +=
          parseInt(locks[i].amount, 10) / 10 ** decimals;
      }
      pinksaleLiquidityLocksData.push({
        id: locks[i].id,
        lockDate: parseInt(locks[i].lockDate),
        amount: locks[i].amount / 10 ** decimals,
        unlockDate: parseInt(locks[i].unlockDate),
        owner: locks[i].owner,
        expired: parseInt(locks[i].unlockDate) < currentTimestamp,
      });
    }
  }

  return {
    pinksaleLiquidityLocksData,
    pinksaleTotalLockedLiquidity,
  };
};
export const getUnicryptLiquidityLocks = async (
  web3: any,
  pair: string,
  unicryptLcokerAddress: string,
  decimals: number
) => {
  const uncryptLiquidityLocksData = [];
  let uncryptTotalLockedLiquidity: number = 0;

  const currentTimestamp = new Date().valueOf() / 1000;

  // Init Unicrypt Locker
  const unicryptLocker = new web3.eth.Contract(
    unicryptLockerAbi,
    unicryptLcokerAddress
  );
  const unicryptGetLocksLength = await unicryptLocker.methods
    .getNumLocksForToken(pair)
    .call();

  for (let i = 0; i < unicryptGetLocksLength; i++) {
    const lock = await unicryptLocker.methods.tokenLocks(pair, i).call();

    if (currentTimestamp < parseInt(lock.unlockDate)) {
      uncryptTotalLockedLiquidity += parseInt(lock.amount, 10);
    }

    uncryptLiquidityLocksData.push({
      id: lock.lockID,
      lockDate: parseInt(lock.lockDate),
      amount: lock.amount / 10 ** decimals,
      initialAmount: lock.initialAmount / 10 ** decimals,
      unlockDate: parseInt(lock.unlockDate),
      owner: lock.owner,
      expired: parseInt(lock.unlockDate) < currentTimestamp,
    });
  }

  return { uncryptLiquidityLocksData, uncryptTotalLockedLiquidity };
};
