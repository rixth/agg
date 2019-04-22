function makeApiStub() {
  const stubs = {};
  const calls = {};
  const makeKey = (method, path) => [method, path].join('_').toLowerCase();
  
  this.api = (method, path, data) => new Promise((resolve, reject) => {
    const stub = stubs[makeKey(method, path)];

    if (!stub) {
      reject(new Error(`Could not ${method} ${path}`));
    } else if (stub.fail) {
      reject(new Error(`Request to ${method} ${path} failed with ${stub.fail}`));
    } else {
      calls[makeKey(method, path)] = data;
      resolve(stub.data)
    }
  });

  this.stub = (method, path, data, fail = false) => {
    stubs[makeKey(method, path)] = { data, fail };
    return this;
  };

  this.getDataPostedTo = path => {
    const call = calls[makeKey('POST', path)];
    if (!call) {
      throw new Error(`It doesn't seem like ${path} was POST'd to!`);
    }
    return call;
  }

  return this;
}

module.exports = { makeApiStub };