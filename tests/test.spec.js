const { process, runExtensionTests } = require('../your-code');
const { makeApiStub } = require('./test-helper');

describe('trade processor', () => {
  let apiStub;

  beforeEach(() => {
    apiStub = makeApiStub()
      .stub('GET', '/trades', [
        { instrument: 'BTC', amount: 2 },
        { instrument: 'BTC', amount: 6 },
        { instrument: 'ETH', amount: 3 },
        { instrument: 'DGE', amount: 1 },
      ])
      .stub('POST', '/volume')
      .stub('POST', '/invalid');
  });

  it('sends accurate trade volumes to the API', () => process(apiStub.api)
    .then(result => expect(result).toBe(true))
    .then(() => {
      const volumes = apiStub.getDataPostedTo('/volume');
      expect(volumes).toHaveProperty('BTC', 8);
      expect(volumes).toHaveProperty('ETH', 3);
    }));

  it('sends invalid currencies to the API', () => process(apiStub.api)
    .then(result => expect(result).toBe(true))
    .then(() => {
      const invalid = apiStub.getDataPostedTo('/invalid');
      expect(invalid).toEqual(['DGE']);
    }));

  it('dedupes invalid currencies before sending them to the API', () => {
    apiStub.stub('GET', '/trades', [
      { instrument: 'DGE', amount: 3 },
      { instrument: 'TRX', amount: 6 },
      { instrument: 'DGE', amount: 1 },
    ])
    return process(apiStub.api)
      .then(result => expect(result).toBe(true))
      .then(() => {
        const invalid = apiStub.getDataPostedTo('/invalid');
        expect(invalid.sort()).toEqual(['DGE', 'TRX'].sort());
      });
  });

  it('resolves to false if the API call to get trades fails', () => {
    apiStub.stub('GET', '/trades', null, 500);
    return process(apiStub.api)
      .then(result => expect(result).toBe(false))
  });

  it('resolves to false if the API call to save volumes fails', () => {
    apiStub.stub('POST', '/volume', null, 500);
    return process(apiStub.api)
      .then(result => expect(result).toBe(false))
  });

  it('resolves to false if the API call to save invalid currencies fails', () => {
    apiStub.stub('POST', '/invalid', null, 500);
    return process(apiStub.api)
      .then(result => expect(result).toBe(false))
  });

  if (!runExtensionTests) return;

  describe('with nested data', () => {
    beforeEach(() => apiStub.stub('GET', '/trades', [
      { instrument: 'BTC', amount: 2 },
      [
        { instrument: 'BTC', amount: 6 },
        [
          { instrument: 'ETH', amount: 3 },
        ],
        { instrument: 'DGE', amount: 1 },
      ],
      { instrument: 'BTC', amount: 4 },
    ]));

    it('sends accurate trade volumes to the API', () => process(apiStub.api)
      .then(result => expect(result).toBe(true))
      .then(() => {
        const volumes = apiStub.getDataPostedTo('/volume');
        expect(volumes).toHaveProperty('BTC', 12);
        expect(volumes).toHaveProperty('ETH', 3);
      }));
  
    it('sends invalid currencies to the API', () => process(apiStub.api)
      .then(result => expect(result).toBe(true))
      .then(() => {
        const invalid = apiStub.getDataPostedTo('/invalid');
        expect(invalid).toEqual(['DGE']);
      }));
  });
})
