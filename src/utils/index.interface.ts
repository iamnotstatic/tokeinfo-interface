export interface IContent {
  name: string;
  symbol: string;
  decimals: number;
  pairAddress: string;
  liquidityPoolSymbol: string;
  liquidityPoolSupply: number;
  liquidityTokenPoolSupply: number;
  pairPoolSupply: number;
  tokenTotalSupply: number;
  uncryptTotalLockedLiquidity: number;
  unicryptLockedPercentage: number;
  pinksaleTotalLockedLiquidity: number;
  pinksaleLockedTokenPercentage: number;
  pinksaleLockedLpTokenPercentage: number;
  pinksaleTotalLockedTokens: number;
  pinksaleTotalLockedLpTokens: number;
  teamFinanceTotalLockedLiquidity: number;
  teamFinanceLockedTokenPercentage: number;
  teamFinanceLockedLpTokenPercentage: number;
  teamFinanceTotalLockedTokens: number;
  teamFinanceTotalLockedLpTokens: number;
  owner: string;
  network: string;
}
