import { Operation } from '@apollo/client/core';
import { ArgumentNode, DirectiveNode, DocumentNode, FragmentDefinitionNode, ListValueNode, OperationDefinitionNode, SelectionNode, SelectionSetNode, ValueNode, VariableNode } from 'graphql';
export declare function extractKey(operation: Operation): {
    operation: Operation;
    key?: string;
};
export declare function materializeKey(argumentList: ListValueNode, variables?: Record<string, any>): string;
export declare function valueForArgument(value: ValueNode, variables?: Record<string, any>): string | number | boolean;
export declare function getVariableOrDie(variables: Record<string, any> | undefined, name: string): any;
export declare function removeDirectiveFromDocument(doc: DocumentNode, directive?: DirectiveNode): DocumentNode;
export declare function getAllArgumentsFromSelectionSet(selectionSet?: SelectionSetNode): ArgumentNode[];
export declare function getAllArgumentsFromSelection(selection: SelectionNode): ArgumentNode[];
export declare function getAllArgumentsFromDirectives(directives?: DirectiveNode[]): ArgumentNode[];
export declare function getAllArgumentsFromDocument(doc: DocumentNode): ArgumentNode[];
export declare function getAllArgumentsFromOperation(op: OperationDefinitionNode): ArgumentNode[];
export declare function getAllArgumentsFromFragment(frag: FragmentDefinitionNode): ArgumentNode[];
export declare function getVariablesFromArguments(args: ArgumentNode[]): VariableNode[];
export declare function getVariablesFromValueNode(node: ValueNode): VariableNode[];
export declare function removeVariableDefinitionsFromDocumentIfUnused(names: string[], doc: DocumentNode): void;
