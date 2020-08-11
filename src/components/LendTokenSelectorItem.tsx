import { BigNumber } from "@0x/utils";
import React, { Component } from "react";
import TagManager from "react-gtm-module";
import { Asset } from "../domain/Asset";
import { AssetDetails } from "../domain/AssetDetails";
import { AssetsDictionary } from "../domain/AssetsDictionary";
import { LendRequest } from "../domain/LendRequest";
import { LendType } from "../domain/LendType";
import { FulcrumProviderEvents } from "../services/events/FulcrumProviderEvents";
import { LendTransactionMinedEvent } from "../services/events/LendTransactionMinedEvent";
import { ProviderChangedEvent } from "../services/events/ProviderChangedEvent";
import { FulcrumProvider } from "../services/FulcrumProvider";
import { ProfitTicker } from "./ProfitTicker";
import { Preloader } from "./Preloader";

import TestLend from './TestLend'
import { InterestRateProvider} from "../services/InterestRateProvider";
const iRateProvider = new InterestRateProvider();


export interface ILendTokenSelectorItemProps {
  asset: Asset;
  onLend: (request: LendRequest) => void;
}


interface ILendTokenSelectorItemState {
  assetDetails: AssetDetails | null;
  interestRate: BigNumber;
  profit: BigNumber | null;
  balanceOfUser: BigNumber;
  iTokenAddress: string,
  tickerSecondDiff: number;
  isLoading: boolean;
  depositAmount:number
  transactionStatus: string;
  transactionResult: any;
}

export class LendTokenSelectorItem extends Component<ILendTokenSelectorItemProps, ILendTokenSelectorItemState> {
  constructor(props: ILendTokenSelectorItemProps) {
    super(props);

    const assetDetails = AssetsDictionary.assets.get(props.asset);
    const interestRate = new BigNumber(0);
    const profit = null;
    const balanceOfUser = new BigNumber(0);

    this._isMounted = false;

    this.state = {
      assetDetails: assetDetails || null,
      interestRate,
      profit,
      balanceOfUser,
      iTokenAddress: "",
      tickerSecondDiff: 0,
      isLoading: false,
      depositAmount:0,
      transactionStatus: "",
      transactionResult: {},
    };

    FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.ProviderAvailable, this.onProviderAvailable);
    FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.ProviderChanged, this.onProviderChanged);
    FulcrumProvider.Instance.eventEmitter.on(FulcrumProviderEvents.LendTransactionMined, this.onLendTransactionMined);
  }

  private _isMounted: boolean;

   private async derivedUpdate() {
    const assetDetails = AssetsDictionary.assets.get(this.props.asset);
    const interestRate = new BigNumber(await iRateProvider.getLendingInterestRate(this.props.asset, 1000));//new BigNumber(1.75)


    
      //await FulcrumProvider.Instance.getLendTokenInterestRate(this.props.asset);
    
    let profit = await FulcrumProvider.Instance.getLendProfit(this.props.asset);
    if (profit && profit.lt(0)) {
      profit = new BigNumber(0);
    }
    const balanceOfUser = await FulcrumProvider.Instance.getITokenAssetBalanceOfUser(this.props.asset);

    const address = "0xE631653c4Dc6Fb98192b950BA0b598f90FA18B3E"
    
    // FulcrumProvider.Instance.contractsSource ?
    //   await FulcrumProvider.Instance.contractsSource.getITokenErc20Address(this.props.asset) || "" :
    //   "";

    this._isMounted && this.setState({
      ...this.state,
      assetDetails: assetDetails || null,
      interestRate,
      profit,
      balanceOfUser,
      iTokenAddress: address,
      tickerSecondDiff: balanceOfUser.toNumber() * (interestRate.toNumber() / 100) / 365 / 24 / 60 / 60,
    });

  //UNCOMMENT THIS WHEN ADDRESS IS NOT HARDCODED IN ANYMORE
    // if (address !== "") {
    //   this._isMounted && this.setState({
    //     ...this.state,
    //     isLoading: false
    //   });
    // }

  }

  private onProviderAvailable = async () => {
    await this.derivedUpdate();
  };

  // noinspection JSUnusedLocalSymbols TODO
  private onProviderChanged = async (event: ProviderChangedEvent) => {
    await this.derivedUpdate();
    // this.setState({
    //   isLoading: false,
    // });
  };

  private onLendTransactionMined = async (event: LendTransactionMinedEvent) => {
    if (event.asset === this.props.asset) {
      await this.derivedUpdate();
    }
  };

  public componentWillUnmount(): void {
    this._isMounted = false;

    FulcrumProvider.Instance.eventEmitter.removeListener(FulcrumProviderEvents.ProviderAvailable, this.onProviderAvailable);
    FulcrumProvider.Instance.eventEmitter.removeListener(FulcrumProviderEvents.ProviderChanged, this.onProviderChanged);
    FulcrumProvider.Instance.eventEmitter.removeListener(FulcrumProviderEvents.LendTransactionMined, this.onLendTransactionMined);
  }

  public componentDidMount(): void {
    this._isMounted = true;

    this.derivedUpdate();
  }

  public componentDidUpdate(
    prevProps: Readonly<ILendTokenSelectorItemProps>,
    prevState: Readonly<ILendTokenSelectorItemState>,
    snapshot?: any
  ): void {
    if (this.props.asset !== prevProps.asset) {
      this.derivedUpdate();
    }
  }

  public render() {
    if (!this.state.assetDetails) {
      return null;
    }
    
    return (
      <div className={`token-selector-item ${this.state.balanceOfUser.eq(0) ? "" : "token-selector-item_active"}`}>
        <div className="token-selector-item__image">
          {this.state.assetDetails.reactLogoSvg.render()}
        </div>
        <div className="token-selector-item__descriptions" style={{ marginTop: this.state.profit === null ? `1.5rem` : undefined }}>
          <div className="token-selector-item__description">
            {this.state.iTokenAddress &&
              FulcrumProvider.Instance.web3ProviderSettings &&
              FulcrumProvider.Instance.web3ProviderSettings.etherscanURL ? (
                <div className="token-selector-item__name">
                  <a
                    className="token-selector-item__name"
                    style={{ cursor: `pointer`, textDecoration: `none` }}
                    title={this.state.iTokenAddress}
                    href={`${FulcrumProvider.Instance.web3ProviderSettings.etherscanURL}address/${this.state.iTokenAddress}#readContract`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {this.state.assetDetails.displayName}
                  </a>
                </div>
              ) : (
                <div className="token-selector-item__name">{this.state.assetDetails.displayName}</div>
              )}


            <div className="token-selector-item__interest-rate-container">
              <div className="token-selector-item__interest-rate-title">Interest APR:</div>
              <div
                title={`${this.state.interestRate.toFixed(18)}%`}
                className="token-selector-item__interest-rate-value"
              >
                {!this.state.isLoading ? (<React.Fragment>{this.state.interestRate.toFixed(4)}<span className="sign-currency">%</span></React.Fragment>)
                  : (<div className="token-selector-item__interest-rate-value"><Preloader width="74px"/></div>)}
              </div>
            </div>
            {this.state.balanceOfUser.gt(0) 
              ? (<React.Fragment>
                {this.state.profit !== null ? (
                  <div className="token-selector-item__profit-container token-selector-item__balance-container">
                    <div className="token-selector-item__profit-title token-selector-item__profit-balance">Balance:</div>
                    {!this.state.isLoading ? (<div
                      title={`${this.state.balanceOfUser.toFixed(18)} ${this.props.asset}`}
                      className="token-selector-item__profit-value token-selector-item__balance-value"
                    >{this.state.balanceOfUser.toFixed(2)} {this.props.asset}</div>)
                    : (<div className="token-selector-item__interest-rate-value"><Preloader width="74px"/></div>)}
                  </div>) : null}                
                <div className="token-selector-item__profit-container">
                  <div className="token-selector-item__profit-title">Profit:</div>
                  <ProfitTicker asset={this.props.asset} secondDiff={this.state.tickerSecondDiff} profit={this.state.profit} />
                </div>
                </React.Fragment>) 
              : (<div className="token-selector-item__description">
                  <div className="token-selector-item__interest-rate-container">
                    <div className="token-selector-item__interest-rate-title" />
                    <div className="token-selector-item__interest-rate-value" />
                  </div>
                </div>)
            }

          </div>
        </div>
        {this.renderActions(this.state.balanceOfUser.eq(0))}
        {this.state.transactionStatus && 
          <div className="token-selector-item-results">
            Transation status: {this.state.transactionStatus} 
            {this.state.transactionStatus === "pending" && <Preloader width="74px"/>}
            {this.state.transactionStatus === "approved" && <Preloader width="74px"/>}
            <br />
            {this.state.transactionStatus == "complete" && 
              <span><a>See transaction on RSK explorer</a></span>
            }
          </div>
        }
      </div>
    );
  }

  private renderActions = (isLendOnly: boolean) => {
    return isLendOnly ? (
  
        <TestLend 
          currency={this.props.asset}
          transactionComplete={this.transactionComplete}
        />

    ) : (
        <div className="token-selector-item__actions">
          <button
            className="token-selector-item__lend-button token-selector-item__lend-button--size-half"
            onClick={this.onLendClick} disabled={this.props.asset === Asset.SAI}
          >
            Lend
        </button>
          <button
            className="token-selector-item__un-lend-button token-selector-item__lend-button--size-half"
            onClick={this.onUnLendClick}
          >
            UnLend
        </button>
        </div>
      );
  };

  public onLendClick = () => {
    this.props.onLend(new LendRequest(LendType.LEND, this.props.asset, new BigNumber(0)));
  };

  public onUnLendClick = () => {
    this.props.onLend(new LendRequest(LendType.UNLEND, this.props.asset, new BigNumber(0)));
  };
  
  public transactionComplete = (status: string, result: any) => {
    //alert(`Transaction status: ${status} \nTransaction result: ${result}`)
    if(status === "pending") {
      this._isMounted && this.setState({...this.state, transactionStatus: status, transactionResult: result})
    } else {
      this._isMounted && this.setState({...this.state, transactionStatus: status, transactionResult: result})
    }
  }
}
