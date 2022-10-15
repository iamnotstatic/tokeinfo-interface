import unicryptLockerAbi from '../abis/unicryptV2Locker.json';
import pinksaleLockerAbi from '../abis/pinksaleLocker.json';
import pinksaleV2LockerAbi from '../abis/pinksaleV2Locker.json';

export interface ILiquidityLock {
  id: string;
  amount: number;
  initialAmount?: number;
  lockDate: number;
  unlockDate: number;
  owner: string;
  expired: boolean;
  isTokenLocked?: boolean;
}
export const getPinksaleLiquidityLocks = async (
  web3: any,
  tokenAddress: string,
  pairAddress: string,
  network: string,
  tokenDecimals: number,
  pairPoolDecimals: number
) => {
  const addresses: any = {
    v1: null,
    v2: null,
    isV2: false,
  };

  const locks: ILiquidityLock[] = [];

  if (network === 'bsc') {
    addresses.v1 = process.env.REACT_APP_PINKSALE_BSC_LIQUIDITY_LOCKER_ADDRESS;
    addresses.v2 =
      process.env.REACT_APP_PINKSALE_BSC_LIQUIDITY_LOCKER_V2_ADDRESS;
  } else if (network === 'eth') {
    addresses.v1 = process.env.REACT_APP_PINKSALE_ETH_LIQUIDITY_LOCKER_ADDRESS;
    addresses.v2 =
      process.env.REACT_APP_PINKSALE_ETH_LIQUIDITY_LOCKER_V2_ADDRESS;
  }

  const v1Locks = await getPinksaleV1Locks(
    web3,
    tokenAddress,
    pairAddress,
    tokenDecimals,
    pairPoolDecimals,
    addresses.v1
  );

  if (v1Locks.liquidityLocksData?.length > 0) {
    locks.push(...v1Locks.liquidityLocksData);
  }

  const v2Locks = await getPinksaleV2Locks(
    web3,
    tokenAddress,
    pairAddress,
    tokenDecimals,
    pairPoolDecimals,
    addresses.v2
  );

  if (v2Locks.liquidityLocksData?.length > 0) {
    locks.push(...v2Locks.liquidityLocksData);
  }

  return {
    pinksaleLiquidityLocksData: locks,
    pinksaleTotalLockedLiquidity:
      v1Locks.totalLockedLiquidity + v2Locks.totalLockedLiquidity,
    pinksaleTotalLockedTokens:
      v1Locks.totalLockedTokens + v2Locks.totalLockedTokens,
    pinksaleTotalLockedLpTokens:
      v1Locks.totalLockedLpTokens + v2Locks.totalLockedLpTokens,
  };
};

export const getPinksaleV1Locks = async (
  web3: any,
  tokenAddress: string,
  pairAddress: string,
  tokenDecimals: number,
  pairPoolDecimals: number,
  lockerAddress: string
) => {
  const liquidityLocksData = [];
  let totalLockedLpTokens = 0;
  let totalLockedTokens: number = 0;

  const pinksaleLocker = new web3.eth.Contract(
    pinksaleLockerAbi,
    lockerAddress
  );

  const pinksaleGetLockTokenLength = await pinksaleLocker.methods
    .totalLockCountForToken(tokenAddress)
    .call();

  if (pinksaleGetLockTokenLength > 0) {
    const index = 0;

    const locks = await pinksaleLocker.methods
      .getLocksForToken(tokenAddress, index, pinksaleGetLockTokenLength)
      .call();

    for (let i = 0; i < pinksaleGetLockTokenLength; i++) {
      const currentTimestamp = new Date().valueOf() / 1000;

      if (currentTimestamp < parseInt(locks[i].unlockDate)) {
        totalLockedTokens +=
          parseInt(locks[i].amount, 10) / 10 ** tokenDecimals;
      }
      liquidityLocksData.push({
        id: locks[i].id,
        lockDate: parseInt(locks[i].lockDate),
        amount: locks[i].amount / 10 ** tokenDecimals,
        unlockDate: locks[i].unlockDate,
        owner: locks[i].owner,
        expired: parseInt(locks[i].unlockDate) < currentTimestamp,
        isTokenLocked: true,
      });
    }
  }

  const pinksaleGetLockLpTokenLength = await pinksaleLocker.methods
    .totalLockCountForToken(pairAddress)
    .call();

  if (pinksaleGetLockLpTokenLength > 0) {
    const index = 0;

    const locks = await pinksaleLocker.methods
      .getLocksForToken(pairAddress, index, pinksaleGetLockLpTokenLength)
      .call();

    for (let i = 0; i < pinksaleGetLockLpTokenLength; i++) {
      const currentTimestamp = new Date().valueOf() / 1000;

      if (currentTimestamp < parseInt(locks[i].unlockDate)) {
        totalLockedLpTokens +=
          parseInt(locks[i].amount, 10) / 10 ** pairPoolDecimals;
      }
      liquidityLocksData.push({
        id: locks[i].id,
        lockDate: parseInt(locks[i].lockDate),
        amount: locks[i].amount / 10 ** pairPoolDecimals,
        unlockDate: locks[i].unlockDate,
        owner: locks[i].owner,
        expired: parseInt(locks[i].unlockDate) < currentTimestamp,
        isTokenLocked: false,
      });
    }
  }

  return {
    liquidityLocksData,
    totalLockedTokens,
    totalLockedLpTokens,
    totalLockedLiquidity: totalLockedTokens + totalLockedLpTokens,
  };
};

export const getPinksaleV2Locks = async (
  web3: any,
  tokenAddress: string,
  pairAddress: string,
  tokenDecimals: number,
  pairPoolDecimals: number,
  lockerAddress: string
) => {
  const liquidityLocksData = [];
  let totalLockedLpTokens = 0;
  let totalLockedTokens: number = 0;

  const pinksaleLocker = new web3.eth.Contract(
    pinksaleV2LockerAbi,
    lockerAddress
  );

  const pinksaleGetLockTokenLength = await pinksaleLocker.methods
    .totalLockCountForToken(tokenAddress)
    .call();

  if (pinksaleGetLockTokenLength > 0) {
    const index = 0;

    const locks = await pinksaleLocker.methods
      .getLocksForToken(tokenAddress, index, pinksaleGetLockTokenLength)
      .call();

    for (let i = 0; i < pinksaleGetLockTokenLength; i++) {
      const currentTimestamp = new Date().valueOf() / 1000;

      if (currentTimestamp < parseInt(locks[i].tgeDate)) {
        totalLockedTokens +=
          parseInt(locks[i].amount, 10) / 10 ** tokenDecimals;
      }
      liquidityLocksData.push({
        id: locks[i].id,
        lockDate: parseInt(locks[i].lockDate),
        amount: locks[i].amount / 10 ** tokenDecimals,
        unlockDate: locks[i].tgeDate,
        owner: locks[i].owner,
        expired: parseInt(locks[i].tgeDate) < currentTimestamp,
        isTokenLocked: true,
      });
    }
  }

  const pinksaleGetLockLpTokenLength = await pinksaleLocker.methods
    .totalLockCountForToken(pairAddress)
    .call();

  if (pinksaleGetLockLpTokenLength > 0) {
    const index = 0;

    const locks = await pinksaleLocker.methods
      .getLocksForToken(pairAddress, index, pinksaleGetLockLpTokenLength)
      .call();

    for (let i = 0; i < pinksaleGetLockLpTokenLength; i++) {
      const currentTimestamp = new Date().valueOf() / 1000;

      if (currentTimestamp < parseInt(locks[i].tgeDate)) {
        totalLockedLpTokens +=
          parseInt(locks[i].amount, 10) / 10 ** pairPoolDecimals;
      }
      liquidityLocksData.push({
        id: locks[i].id,
        lockDate: parseInt(locks[i].lockDate),
        amount: locks[i].amount / 10 ** pairPoolDecimals,
        unlockDate: locks[i].tgeDate,
        owner: locks[i].owner,
        expired: parseInt(locks[i].tgeDate) < currentTimestamp,
        isTokenLocked: false,
      });
    }
  }

  return {
    liquidityLocksData,
    totalLockedTokens,
    totalLockedLpTokens,
    totalLockedLiquidity: totalLockedTokens + totalLockedLpTokens,
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
      uncryptTotalLockedLiquidity += parseInt(lock.amount, 10) / 10 ** decimals;
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

export const getAmountWithoutRounding = (
  amount: number,
  decimals: number = 1
) => {
  return (
    Math.floor(Number(amount) * Math.pow(10, decimals)) / Math.pow(10, decimals)
  );
};
