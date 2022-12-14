import semver from 'semver';

// eslint-disable-next-line no-warning-comments
// TODO Remove this file and rename kv.test.actual.ts to kv.test.ts when we drop support for Node 14
if (semver.gte(process.version, '15.0.0')) {
  require('./kv.test.actual');
}

test('dummy test', () => expect(1).toEqual(1));
