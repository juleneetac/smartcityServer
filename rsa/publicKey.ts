let PublicKey = class {
    e: BigInt;
    n: BigInt;

    constructor(e, n) {
      this.e = BigInt(e);
      this.n = BigInt(n);
    }

    encrypt (m) {
        return bcu.modPow(m, this.e, this.n);
    }

    verify (s) {
        return bcu.modPow(s, this.e, this.n);
    }
  }

  module.exports = PublicKey;