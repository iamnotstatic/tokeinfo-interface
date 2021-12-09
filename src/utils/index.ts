import unicryptLockerAbi from '../abis/unicryptV2Locker.json';

export interface ILiquidityLock {
    id: string;
    amount: number;
    initialAmount: number;
    lockDate: Date;
    unlockDate: Date;
    owner: string;

}
export const getLiquidityLocks = async (
  web3: any,
  pair: string,
  address: string
) => {
  const liquidityLocksData = [];

  const unicryptLocker = new web3.eth.Contract(unicryptLockerAbi, address);
  const getLocksLength = await unicryptLocker.methods
    .getNumLocksForToken(pair)
    .call();

  for (let i = 0; i < getLocksLength; i++) {
    const lock = await unicryptLocker.methods.tokenLocks(pair, i).call();

    liquidityLocksData.push({
      id: lock.lockID,
      lockDate: lock.lockDate,
      amount: lock.amount / 10 ** 18,
      initialAmount: lock.initialAmount / 10 ** 18,
      unlockDate: new Date(parseInt(lock.unlockDate) * 1000),
      owner: lock.owner,
    });
  }

  return liquidityLocksData;
};
