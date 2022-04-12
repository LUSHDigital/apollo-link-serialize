import { ApolloLink, FetchResult, NextLink, Operation } from '@apollo/client/core';
import { Observer } from 'zen-observable-ts';
export interface OperationQueueEntry {
    operation: Operation;
    forward: NextLink;
    observer: Observer<FetchResult>;
    subscription?: {
        unsubscribe: () => void;
    };
}
export default class SerializingLink extends ApolloLink {
    private opQueues;
    request(origOperation: Operation, forward: NextLink): any;
    private enqueue;
    private cancelOp;
    private startFirstOpIfNotStarted;
}
