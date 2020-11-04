let PrivateKey = class {
    d: BigInt;
    publicKey = require('./rsa/publicKey');

    constructor (d, publicKey) {
        this.d = BigInt(d);
        this.publicKey = publicKey;
    }

    decrypt (c) {
        return bcu.modPow(c, this.d, this.publicKey.n);
    }

    sign (m) {
        return bcu.modPow(m, this.d, this.publicKey.n);
    }
  }

  module.exports = PrivateKey;