import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Moment from 'react-moment';
import { getAmountWithoutRounding, ILiquidityLock } from '../../utils';
import { IContent } from '../../utils/index.interface';

const Unicrypt = ({
  unicryptLiquidityLocks,
  onCopy,
  content,
}: {
  unicryptLiquidityLocks: ILiquidityLock[];
  onCopy: any;
  content: IContent;
}) => {
  return (
    <>
      {content.uncryptTotalLockedLiquidity > 0 ? (
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
              {content.uncryptTotalLockedLiquidity.toLocaleString('en-US')}
            </span>
          </div>
          <div className="font-bold text-center text-sm mt-2">
            {getAmountWithoutRounding(content.unicryptLockedPercentage)}% LP is
            locked in Unicrypt <i className="fa fa-lock"></i>
          </div>
        </>
      ) : (
        <div className="font-bold text-center text-sm mt-2">
          No LP tokens is locked in Unicrypt <i className="fa fa-lock"></i>
        </div>
      )}

      <div className="flex mt-3 font-italic">
        <div> Value </div>
        <div className="flex-grow"></div>
        <div> Unlock date </div>
      </div>
      {unicryptLiquidityLocks.map((lock) => (
        <div key={lock.id}>
          <div className="border-b-2">
            <div className="flex items-center">
              <div>
                <div className="font-bold"></div>
                <div className="text-xs text-gray-500">
                  {lock.amount.toLocaleString()}{' '}
                  {content.network === 'eth' ? 'univ2' : 'cake-LP'}
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

export default Unicrypt;
