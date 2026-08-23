declare module '@midnight-ntwrk/testkit-js' {
  export type TestEnvironment = any;
  export type EnvironmentConfiguration = any;
  export type DustWalletOptions = any;
  export const TestEnvironment: any;
  export const getTestEnvironment: any;
  export const RemoteTestEnvironment: any;
  export const FluentWalletBuilder: any;
  export const FaucetClient: any;
}
declare module '@midnight-ntwrk/wallet-sdk-facade' {
  export type WalletFacade = any;
  export type FacadeState = any;
  export const WalletFacade: any;
}
declare module '@midnight-ntwrk/wallet-sdk-unshielded-wallet' {
  export type UnshieldedWalletState = any;
  export type UnshieldedWalletAPI = any;
  export const createKeystore: any;
  export const UnshieldedWalletState: any;
}
declare module '@midnight-ntwrk/wallet-sdk-hd' {
  export type HDWallet = any;
  export const HDWallet: any;
  export const Roles: any;
}
declare module '@midnight-ntwrk/wallet-sdk-shielded' {
  export type ShieldedWalletAPI = any;
  export type ShieldedWalletState = any;
}
declare module '@midnight-ntwrk/wallet-sdk-address-format' {
  export const formatAddress: any;
  export const UnshieldedAddress: any;
  export type UnshieldedAddress = any;
}
declare module '@midnight-ntwrk/midnight-js-node-zk-config-provider' {
  export const NodeZkConfigProvider: any;
}
declare module '@midnight-ntwrk/midnight-js-level-private-state-provider' {
  export const levelPrivateStateProvider: any;
}
declare module 'pino-pretty' {
  export type PrettyStream = any;
  export default function pinoPretty(opts?: any): any;
}
