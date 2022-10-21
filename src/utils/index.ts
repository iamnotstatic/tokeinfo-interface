import unicryptLockerAbi from '../abis/unicryptV2Locker.json';
import pinksaleLockerAbi from '../abis/pinksaleLocker.json';
import pinksaleV2LockerAbi from '../abis/pinksaleV2Locker.json';
import teamFinanceAbi from '../abis/teamFinanceLocker.json';

import teamfinanceV1EthLocks from '../data/teamfinance-v1-eth-locks.json';
import teamFinanceV1BscLocks from '../data/teamfinance-v1-bsc-locks.json';

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

  const pinksaleLiquidityLocksData: ILiquidityLock[] = [];

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
  pinksaleLiquidityLocksData.push(...v1Locks.liquidityLocksData);

  const v2Locks = await getPinksaleV2Locks(
    web3,
    tokenAddress,
    pairAddress,
    tokenDecimals,
    pairPoolDecimals,
    addresses.v2
  );
  pinksaleLiquidityLocksData.push(...v2Locks.liquidityLocksData);

  return {
    pinksaleLiquidityLocksData,
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

export const getTeamFinanceLiquidityLocks = async (
  tokenAddress: string,
  pairAddress: string,
  tokenDecimals: number,
  pairPoolDecimals: number,
  teamFinanceLockerAddress: string,
  web3: any,
  network: string
) => {
  const teamFinanceLiquidityLocksData: ILiquidityLock[] = [];

  const v1Locks = await getTeamFinanceV1Locks(
    tokenAddress,
    pairAddress,
    tokenDecimals,
    pairPoolDecimals,
    network
  );

  teamFinanceLiquidityLocksData.push(...v1Locks.liquidityLocksData);

  const v2Locks = await getTeamFinanceV2Locks(
    tokenAddress,
    pairAddress,
    tokenDecimals,
    pairPoolDecimals,
    teamFinanceLockerAddress,
    web3,
    network
  );
  teamFinanceLiquidityLocksData.push(...v2Locks.liquidityLocksData);

  return {
    teamFinanceLiquidityLocksData,
    teamFinanceTotalLockedTokens:
      v1Locks.totalLockedTokens + v2Locks.totalLockedTokens,
    teamFinanceTotalLockedLpTokens:
      v1Locks.totalLockedLpTokens + v2Locks.totalLockedLpTokens,
    teamFinanceTotalLockedLiquidity:
      v1Locks.totalLockedLiquidity + v2Locks.totalLockedLiquidity,
  };
};

export const getTeamFinanceV1Locks = async (
  tokenAddress: string,
  pairAddress: string,
  tokenDecimals: number,
  pairPoolDecimals: number,
  network: string
) => {
  const liquidityLocksData = [];
  let totalLockedLpTokens = 0;
  let totalLockedTokens: number = 0;

  const locks = new Map(
    network === 'eth'
      ? (teamfinanceV1EthLocks as any)
      : (teamFinanceV1BscLocks as any)
  );

  const locksToken: any = locks.get(tokenAddress) || [];
  const locksLpToken: any = locks.get(pairAddress) || [];

  const currentTimestamp = new Date().valueOf() / 1000;

  for (let i = 0; i < locksToken.length; i++) {
    if (currentTimestamp < parseInt(locksToken[i].unlockTime)) {
      totalLockedTokens +=
        parseInt(locksToken[i].tokenAmount, 10) / 10 ** tokenDecimals;
    }

    liquidityLocksData.push({
      id: locksToken[i].id,
      lockDate: 0,
      amount: parseInt(locksToken[i].tokenAmount) / 10 ** tokenDecimals,
      unlockDate: locksToken[i].unlockTime,
      owner: locksToken[i].withdrawalAddress,
      expired: parseInt(locksToken[i].unlockTime) < currentTimestamp,
      isTokenLocked: true,
    });
  }

  for (let i = 0; i < locksLpToken.length; i++) {
    if (currentTimestamp < parseInt(locksLpToken[i].unlockTime)) {
      totalLockedLpTokens +=
        parseInt(locksLpToken[i].tokenAmount, 10) / 10 ** pairPoolDecimals;
    }
    liquidityLocksData.push({
      id: locksLpToken[i].id,
      lockDate: 0,
      amount: parseInt(locksToken[i].tokenAmount) / 10 ** pairPoolDecimals,
      unlockDate: locksLpToken[i].unlockTime,
      owner: locksLpToken[i].withdrawalAddress,
      expired: parseInt(locksLpToken[i].unlockTime) < currentTimestamp,
      isTokenLocked: false,
    });
  }

  return {
    liquidityLocksData,
    totalLockedTokens,
    totalLockedLpTokens,
    totalLockedLiquidity: totalLockedTokens + totalLockedLpTokens,
  };
};

export const getTeamFinanceV2Locks = async (
  tokenAddress: string,
  pairAddress: string,
  tokenDecimals: number,
  pairPoolDecimals: number,
  teamFinanceLockerAddress: string,
  web3: any,
  network: string
) => {
  const liquidityLocksData = [];
  let totalLockedLpTokens = 0;
  let totalLockedTokens: number = 0;
  let tokenEvents: any[] = [];
  let lpTokenEvents: any[] = [];

  const teamFinanceLocker = new web3.eth.Contract(
    teamFinanceAbi,
    teamFinanceLockerAddress
  );

  const currentTimestamp = new Date().valueOf() / 1000;

  const blockNumber = await web3.eth.getBlockNumber();

  const fromBlock = network === 'eth' ? 0 : blockNumber - 300000;
  const toBlock = network === 'eth' ? 'latest' : blockNumber;

  if (network === 'eth') {
    tokenEvents = await teamFinanceLocker.getPastEvents('Deposit', {
      filter: { tokenAddress },
      fromBlock,
      toBlock,
    });
  } else {
    let blockRangeFrom = fromBlock;

    for (let i = 0; i < 6; i++) {
      const events = await teamFinanceLocker.getPastEvents('Deposit', {
        filter: { tokenAddress },
        fromBlock: blockRangeFrom,
        toBlock: blockRangeFrom + 49999,
      });

      tokenEvents.push(...events);
      blockRangeFrom += 50000;
    }
  }

  if (network === 'eth') {
    lpTokenEvents = await teamFinanceLocker.getPastEvents('Deposit', {
      filter: { tokenAddress: pairAddress },
      fromBlock,
      toBlock,
    });
  } else {
    let blockRangeFrom = fromBlock;

    for (let i = 0; i < 6; i++) {
      const events = await teamFinanceLocker.getPastEvents('Deposit', {
        filter: { tokenAddress: pairAddress },
        fromBlock: blockRangeFrom,
        toBlock: blockRangeFrom + 49999,
      });

      lpTokenEvents.push(...events);
      blockRangeFrom += 50000;
    }
  }

  for (let i = 0; i < tokenEvents.length; i++) {
    const event = tokenEvents[i];

    // Increase total locked tokens
    if (currentTimestamp < parseInt(event.returnValues.unlockTime)) {
      totalLockedTokens +=
        parseInt(event.returnValues.amount, 10) / 10 ** tokenDecimals;
    }

    liquidityLocksData.push({
      id: event.returnValues.id,
      amount: event.returnValues.amount / 10 ** tokenDecimals,
      unlockDate: event.returnValues.unlockTime,
      lockDate: 0,
      owner: event.returnValues.withdrawalAddress,
      expired: parseInt(event.returnValues.unlockTime) < currentTimestamp,
      isTokenLocked: true,
    });
  }

  for (let i = 0; i < lpTokenEvents.length; i++) {
    const event = lpTokenEvents[i];

    // Increase total locked tokens
    if (currentTimestamp < parseInt(event.returnValues.unlockTime)) {
      totalLockedLpTokens +=
        parseInt(event.returnValues.amount, 10) / 10 ** pairPoolDecimals;
    }

    liquidityLocksData.push({
      id: event.returnValues.id,
      amount: event.returnValues.amount / 10 ** pairPoolDecimals,
      unlockDate: event.returnValues.unlockTime,
      lockDate: 0,
      owner: event.returnValues.withdrawalAddress,
      expired: parseInt(event.returnValues.unlockTime) < currentTimestamp,
      isTokenLocked: false,
    });
  }

  return {
    liquidityLocksData,
    totalLockedTokens,
    totalLockedLpTokens,
    totalLockedLiquidity: totalLockedTokens + totalLockedLpTokens,
  };
};
export const getAmountWithoutRounding = (
  amount: number,
  decimals: number = 1
) => {
  return (
    Math.floor(Number(amount) * Math.pow(10, decimals)) / Math.pow(10, decimals)
  );
};
