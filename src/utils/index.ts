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
  address: string
) => {
  const liquidityLocksData = [];
  const currentTimestamp = new Date().valueOf() / 1000;

  const unicryptLocker = new web3.eth.Contract(unicryptLockerAbi, address);
  const getLocksLength = await unicryptLocker.methods
    .getNumLocksForToken(pair)
    .call();

  for (let i = 0; i < getLocksLength; i++) {
    const lock = await unicryptLocker.methods.tokenLocks(pair, i).call();

    if (parseInt(lock.lockDate) > currentTimestamp) {
      
    }

    liquidityLocksData.push({
      id: lock.lockID,
      lockDate: parseInt(lock.lockDate),
      amount: lock.amount / 10 ** 18,
      initialAmount: lock.initialAmount / 10 ** 18,
      unlockDate: parseInt(lock.unlockDate),
      owner: lock.owner,
      expired: parseInt(lock.unlockDate) < currentTimestamp,
    });
  }

  return liquidityLocksData;
};
