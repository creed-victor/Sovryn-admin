import Web3 from 'web3';

let web3Writer;
let _web3Reader;

export const createWeb3 = (): Web3 => {
  // @ts-ignore
  if (window.ethereum) {
    // @ts-ignore
    web3Writer = new Web3(window.ethereum);
    // @ts-ignore
    window.ethereum.enable();
  } else {
    web3Writer = new Web3(process.env.REACT_APP_PUBLIC_NODE as string);
  }

  return web3Writer;
};

export const web3Reader = (): Web3 => {
  if (!_web3Reader) {
    _web3Reader = new Web3(process.env.REACT_APP_PUBLIC_NODE as string);
  }
  return _web3Reader;
};
