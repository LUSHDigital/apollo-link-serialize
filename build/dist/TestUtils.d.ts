import { ApolloLink, NextLink, Observable, Operation } from '@apollo/client/core';
import { ExecutionResult } from 'graphql';
export interface ObservableValue {
    value?: ExecutionResult | Error;
    delay?: number;
    type: 'next' | 'error' | 'complete';
}
export interface Unsubscribable {
    unsubscribe: () => void;
}
export interface NextEvent {
    type: 'next';
    delay?: number;
    value: ExecutionResult;
}
export interface ErrorEvent {
    type: 'error';
    delay?: number;
    value: Error;
}
export interface CompleteEvent {
    type: 'complete';
    delay?: number;
}
export declare type ObservableEvent = NextEvent | ErrorEvent | CompleteEvent;
export declare class TestLink extends ApolloLink {
    operations: Operation[];
    constructor();
    request(operation: Operation): any;
}
export declare class TestSequenceLink extends ApolloLink {
    operations: Operation[];
    constructor();
    request(operation: Operation, forward: NextLink): any;
}
export declare function mergeObservables(...observables: Observable<ExecutionResult>[]): any;
export declare function toResultValue(e: ObservableEvent): ObservableEvent;
export declare const assertObservableSequence: (observable: any, sequence: ObservableValue[], initializer?: (sub: Unsubscribable) => void) => Promise<boolean | Error>;
