# Trade aggregator

Imogat's web client allow traders to enter a currency code (ex. `BTC`) and an amount to trade. We want to generate aggregates for these trades. You are responsible for writing a piece of this pipeline that gets raw event data from an API, aggregates it, then saves it back to the API.

At this time, the only valid currencies are `BTC`, `ETH` & `XRP`.

## Details

Your function should return a promise that does the following

1. Makes a `GET` request to `/trades` to retrieve an array of trade events
2. Calculates the total amount traded for each currency as a map of `currency => total`
3. Saves invalid currency codes in a separate list
4. `POST`s the totals object to `/volume`
5. `POST`s the list of invalid currencies to `/invalid`
6. Resolves the to `false` if any API call fails, otherwise `true`

Write your solution in `your-code.js` as a function called `process` and do not install any additional packages. You can run the test suite by executing `npm test`. **You do not need to implement any network/fetching logic**, see "How to make API requests" below.

## Example

If you received these trade events:

```js
[
  { instrument: 'BTC', amount: 2 },
  { instrument: 'TRX', amount: 1 },
  { instrument: 'ETH', amount: 3 },
  { instrument: 'BTC', amount: 6 },
  { instrument: 'DGE', amount: 1 },
  { instrument: 'DGE', amount: 7 },
]
```

You should `POST` this to `/volume` and `/invalid` respectively:

```js
{ BTC: 8, ETH: 3 }
```

```js
['DGE', 'TRX']
```

### How to make API requests

Your solution will be passed a single argument by the tests, an api function. It takes an HTTP method & path to request, and an optional data argument (if you are doing a POST request). It will return a promise that may have data. It can also potentially reject with an error.

`api(method: string, path: string, data?: any): Promise<any>`
