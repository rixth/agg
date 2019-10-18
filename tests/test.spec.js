const { process, runExtensionTests } = require('../your-code');
const { makeApiStub } = require('./test-helper');

describe('event aggregator', () => {
  let apiStub;

  beforeEach(() => {
    apiStub = makeApiStub()
      .stub('GET', '/items', [
        { name: 'search_changed', id: 1 },
        { name: 'search_changed', id: 2 },
        { name: 'search_failed', id: 3 },
        { name: 'foobar', id: 4 }
      ])
      .stub('POST', '/aggregates')
      .stub('POST', '/junk');
  });

  it('sends accurate aggregations to the API', () => process(apiStub.api)
    .then(result => expect(result).toBe(true))
    .then(() => {
      const aggregates = apiStub.getDataPostedTo('/aggregates');
      expect(aggregates).toHaveProperty('search_changed', 2);
      expect(aggregates).toHaveProperty('search_failed', 1);
    }));

  it('sends invalid event ids to the API', () => process(apiStub.api)
    .then(result => expect(result).toBe(true))
    .then(() => {
      const invalid = apiStub.getDataPostedTo('/junk');
      expect(invalid).toEqual([4]);
    }));

  it('resolves to false if the API call to get items', () => {
    apiStub.stub('GET', '/items', null, 500);
    return process(apiStub.api)
      .then(result => expect(result).toBe(false))
  });

  it('resolves to false if the API call to save aggregates fails', () => {
    apiStub.stub('POST', '/aggregates', null, 500);
    return process(apiStub.api)
      .then(result => expect(result).toBe(false))
  });

  it('resolves to false if the API call to save invalid events fails', () => {
    apiStub.stub('POST', '/junk', null, 500);
    return process(apiStub.api)
      .then(result => expect(result).toBe(false))
  });

  if (!runExtensionTests) return;

  describe('with nested data', () => {
    beforeEach(() => apiStub.stub('GET', '/items', [
      { name: 'search_changed', id: 1 },
      [
        { name: 'search_changed', id: 2 },
        [
          { name: 'search_failed', id: 3 },
          { name: 'foobar', id: 4 },
        ]
      ]
    ]));

    it('sends accurate aggregations to the API', () => process(apiStub.api)
      .then(result => expect(result).toBe(true))
      .then(() => {
        const aggregates = apiStub.getDataPostedTo('/aggregates');
        expect(aggregates).toHaveProperty('search_changed', 2);
        expect(aggregates).toHaveProperty('search_failed', 1);
      }));
  
    it('sends invalid events to the API', () => process(apiStub.api)
      .then(result => expect(result).toBe(true))
      .then(() => {
        const invalid = apiStub.getDataPostedTo('/junk');
        expect(invalid).toEqual([4]);
      }));
  });
})
