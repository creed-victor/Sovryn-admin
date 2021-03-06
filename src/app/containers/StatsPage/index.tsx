/**
 *
 * StatsPage
 *
 */

import React from 'react';

import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { StatsRow } from '../../components/StatsRow';

import { AssetsDictionary } from 'utils/blockchain/assets-dictionary';

export function StatsPage() {
  const assets = AssetsDictionary.assetList();

  return (
    <>
      <Header />
      <main>
        <div className="container mt-3">
          <div className="table-responsive mt-5 mb-5">
            <table className="bp3-html-table table-dark">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Total Asset Supplied</th>
                  <th>Total Asset Borrowed</th>
                  <th>Total Available</th>
                  <th>Supply APR</th>
                  <th>Borrow APR</th>
                </tr>
              </thead>
              <tbody className="mt-5">
                {assets.map(asset => (
                  <StatsRow asset={asset} key={asset} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
