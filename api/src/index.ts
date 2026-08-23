// Anonymous Employee Feedback API Implementation
import * as BBoard from '../../contract/src/managed/bboard/contract/index.js';
import { type ContractAddress, convertFieldToBytes } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type Logger } from 'pino';
import {
  type BBoardDerivedState,
  type BBoardContract,
  type BBoardProviders,
  type DeployedBBoardContract,
  bboardPrivateStateKey,
} from './common-types.js';
import { CompiledBBoardContractContract } from '../../contract/src/index';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { combineLatest, map, tap, from, type Observable } from 'rxjs';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { BBoardPrivateState, createBBoardPrivateState } from '../../contract/src/witnesses.js';

export interface DeployedBBoardAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<BBoardDerivedState>;

  post: (message: string) => Promise<void>;
  takeDown: () => Promise<void>;
  submitFeedback: (ratingScore: number, category: string, feedbackComment: string) => Promise<void>;
}

export class BBoardAPI implements DeployedBBoardAPI {
  private constructor(
    public readonly deployedContract: DeployedBBoardContract,
    providers: BBoardProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
    this.state$ = combineLatest(
      [
        providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
          map((contractState: any) => BBoard.ledger(contractState.data)),
          tap((ledgerState: any) =>
            logger?.trace({
              ledgerStateChanged: {
                ledgerState: {
                  ...ledgerState,
                  state: ledgerState.state === BBoard.State.OCCUPIED ? 'occupied' : 'vacant',
                  totalFeedbackCount: ledgerState.totalFeedbackCount.toString(),
                  totalRatingSum: ledgerState.totalRatingSum.toString(),
                },
              },
            }),
          ),
        ),
        from(providers.privateStateProvider.get(bboardPrivateStateKey) as Promise<BBoardPrivateState>),
      ],
      (ledgerState: any, privateState: any) => {
        const hashedSecretKey = BBoard.pureCircuits.publicKey(
          privateState.secretKey,
          convertFieldToBytes(32, ledgerState.sequence, 'api/src/index.ts'),
        );

        const count = Number(ledgerState.totalFeedbackCount);
        const sum = Number(ledgerState.totalRatingSum);
        const avg = count > 0 ? Number((sum / count).toFixed(2)) : 0;

        return {
          state: ledgerState.state,
          message: ledgerState.message.value,
          sequence: ledgerState.sequence,
          isOwner: toHex(ledgerState.owner) === toHex(hashedSecretKey),
          totalFeedbackCount: ledgerState.totalFeedbackCount,
          totalRatingSum: ledgerState.totalRatingSum,
          averageRating: avg,
          lastCategory: ledgerState.lastCategory.is_some ? ledgerState.lastCategory.value : undefined,
          lastFeedbackDigest: toHex(ledgerState.lastFeedbackDigest),
        };
      },
    );
  }

  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<BBoardDerivedState>;

  async post(message: string): Promise<void> {
    this.logger?.info(`postingMessage: ${message}`);
    const txData = await this.deployedContract.callTx.post(message);
    this.logger?.trace({
      transactionAdded: { circuit: 'post', txHash: txData.public.txHash, blockHeight: txData.public.blockHeight },
    });
  }

  async takeDown(): Promise<void> {
    this.logger?.info('takingDownMessage');
    const txData = await this.deployedContract.callTx.takeDown();
    this.logger?.trace({
      transactionAdded: { circuit: 'takeDown', txHash: txData.public.txHash, blockHeight: txData.public.blockHeight },
    });
  }

  async submitFeedback(ratingScore: number, category: string, feedbackComment: string): Promise<void> {
    this.logger?.info(`submittingFeedback: rating=${ratingScore}, category=${category}`);
    
    // Create a 32-byte digest of the feedback comment
    const encoder = new TextEncoder();
    const bytes = encoder.encode(feedbackComment);
    const digestBytes = new Uint8Array(32);
    for (let i = 0; i < bytes.length && i < 32; i++) {
      digestBytes[i] = bytes[i];
    }

    const txData = await this.deployedContract.callTx.submitFeedback(
      BigInt(ratingScore),
      category,
      digestBytes,
    );

    this.logger?.trace({
      transactionAdded: {
        circuit: 'submitFeedback',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  static async deploy(providers: BBoardProviders, logger?: Logger): Promise<BBoardAPI> {
    logger?.info('deployContract');
    const deployedBBoardContract = await deployContract<BBoardContract>(providers, {
      compiledContract: CompiledBBoardContractContract,
      privateStateId: bboardPrivateStateKey,
      initialPrivateState: createBBoardPrivateState(utils.randomBytes(32)),
    });
    return new BBoardAPI(deployedBBoardContract, providers, logger);
  }

  static async join(providers: BBoardProviders, contractAddress: ContractAddress, logger?: Logger): Promise<BBoardAPI> {
    logger?.info({ joinContract: { contractAddress } });
    const deployedBBoardContract = await findDeployedContract<BBoardContract>(providers, {
      contractAddress,
      compiledContract: CompiledBBoardContractContract,
      privateStateId: bboardPrivateStateKey,
      initialPrivateState: await BBoardAPI.getPrivateState(providers, contractAddress),
    });
    return new BBoardAPI(deployedBBoardContract, providers, logger);
  }

  private static async getPrivateState(
    providers: BBoardProviders,
    contractAddress: ContractAddress,
  ): Promise<BBoardPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(bboardPrivateStateKey);
    return existingPrivateState ?? createBBoardPrivateState(utils.randomBytes(32));
  }
}

export * as utils from './utils/index.js';
export * from './common-types.js';
