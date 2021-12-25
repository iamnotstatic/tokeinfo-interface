import unicryptLockerAbi from '../abis/unicryptV2Locker.json';

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
  address: string,
  decimals: number
) => {
  const liquidityLocksData = [];
  let totalLockedLiquidity: number = 0;

  const currentTimestamp = new Date().valueOf() / 1000;

  const unicryptLocker = new web3.eth.Contract(unicryptLockerAbi, address);
  const getLocksLength = await unicryptLocker.methods
    .getNumLocksForToken(pair)
    .call();

  for (let i = 0; i < getLocksLength; i++) {
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

  return { liquidityLocksData, totalLockedLiquidity };
};
