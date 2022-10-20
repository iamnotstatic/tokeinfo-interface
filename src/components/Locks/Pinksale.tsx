import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Moment from 'react-moment';
import { getAmountWithoutRounding, ILiquidityLock } from '../../utils';
import { IContent } from '../../utils/index.interface';

const Pinksale = ({
  pinksaleliquidityLocks,
  onCopy,
  content,
}: {
  pinksaleliquidityLocks: ILiquidityLock[];
  onCopy: any;
  content: IContent;
}) => {
  return (
    <>
      {content.pinksaleTotalLockedLpTokens > 0 && (
        <>
          <div>
            Total LP tokens:{' '}
            <span className="text-gray-500">
              {content.pairPoolSupply.toLocaleString('en-US')}
            </span>
          </div>
          <div>
            Total locked LP tokens:{' '}
            <span className="text-gray-500">
              {content.pinksaleTotalLockedLpTokens.toLocaleString('en-US')}
            </span>
          </div>
        </>
      )}

      {content.pinksaleTotalLockedTokens > 0 && (
        <>
          <div>
            Total tokens:{' '}
            <span className="text-gray-500">
              {content.tokenTotalSupply.toLocaleString('en-US')}
            </span>
          </div>
          <div>
            Total locked tokens:{' '}
            <span className="text-gray-500">
              {content.pinksaleTotalLockedTokens.toLocaleString('en-US')}
            </span>
          </div>
        </>
      )}

      {content.pinksaleTotalLockedLiquidity > 0 ? (
        <div className="font-bold text-center text-sm mt-2">
          {getAmountWithoutRounding(content.pinksaleLockedLpTokenPercentage)}%
          Lp tokens and{' '}
          {getAmountWithoutRounding(content.pinksaleLockedTokenPercentage)}%
          tokens are locked in Pinksale <i className="fa fa-lock"></i>
        </div>
      ) : (
        <div className="font-bold text-center text-sm mt-2">
          No tokens or LP tokens are locked in Pinksale{' '}
          <i className="fa fa-lock"></i>
        </div>
      )}

      <div className="flex mt-3 font-italic">
        <div> Value </div>
        <div className="flex-grow"></div>
        <div> Unlock date </div>
      </div>
      {pinksaleliquidityLocks.map((lock: ILiquidityLock) => (
        <div key={lock.id}>
          <div className="border-b-2">
            <div className="flex items-center">
              <div>
                <div className="font-bold"></div>
                <div className="text-xs text-gray-500">
                  {lock.amount.toLocaleString()}{' '}
                  {lock.isTokenLocked
                    ? content.symbol
                    : content.network === 'eth'
                    ? 'univ2'
                    : 'cake-LP'}
                </div>
              </div>
              <div className="flex-grow" />
              <div className="text-right">
                <div className="font-bold">
                  <Moment fromNow>{new Date(lock.unlockDate * 1000)}</Moment>
                </div>
                <div className="text-xs text-gray-500">
                  <Moment format="DD/MM/YYYY h:mm">
                    {new Date(lock.unlockDate * 1000)}
                  </Moment>
                </div>
              </div>
              <i
                aria-hidden="true"
                className={`fa ${
                  lock.expired ? 'fa-unlock' : 'fa-lock'
                } text-lg ${
                  lock.expired ? 'text-red-500' : 'text-green-500'
                } ml-4`}
              />
            </div>
            <div>
              <div className="p-2">
                <CopyToClipboard text={lock.owner} onCopy={() => onCopy()}>
                  <div>
                    Owner:
                    <span className="cursor-pointer text-gray-500">
                      {' '}
                      {lock.owner?.slice(0, 6)} ... {lock.owner?.slice(-5)}{' '}
                      <i className="fa fa-copy"></i>{' '}
                    </span>
                  </div>
                </CopyToClipboard>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default Pinksale;
