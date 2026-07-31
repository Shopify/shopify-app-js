import type {
  GQLExtensions,
  GraphQLError,
  RequestOptions,
  ResponseErrors,
} from '../types';

/*
 * Compile-time only checks for the public types. These are type-checked via the
 * `typecheck` script (tsc --noEmit) rather than executed. The runtime `it` block
 * keeps Jest from treating the file as an empty suite.
 */

type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

// GQLExtensions exposes a structured `cost` shape but stays open for other keys.
{
  const extensions: GQLExtensions = {
    cost: {
      requestedQueryCost: 10,
      actualQueryCost: 8,
      throttleStatus: {
        maximumAvailable: 1000,
        currentlyAvailable: 992,
        restoreRate: 50,
      },
    },
    someOtherExtension: {anything: true},
  };

  const requested: number | undefined = extensions.cost?.requestedQueryCost;
  const other: unknown = extensions.someOtherExtension;

  void requested;
  void other;
}

// graphQLErrors carries the standard spec fields.
{
  const error: GraphQLError = {
    message: 'boom',
    locations: [{line: 1, column: 2}],
    path: ['products', 0, 'title'],
    extensions: {code: 'THROTTLED'},
  };

  const errors: ResponseErrors = {graphQLErrors: [error]};
  void errors;

  type MessageIsRequired = Expect<Equal<GraphQLError['message'], string>>;
  const _messageCheck: MessageIsRequired = true;
  void _messageCheck;
}

// RequestOptions fields are readonly.
{
  const options: RequestOptions = {variables: {id: '1'}};

  // @ts-expect-error variables is readonly and cannot be reassigned
  options.variables = {id: '2'};

  void options;
}

describe('graphql-client public types', () => {
  it('type-checks via tsc (no runtime assertions)', () => {
    expect(true).toBe(true);
  });
});
