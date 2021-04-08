const assert = require('assert').strict;
const freezeObject = require('./index.js');

describe('freezeObject', () => {
  context('undefined', () => {
    it('returns undefined', () => {
      assert.equal(freezeObject(undefined), undefined);
    });
  });

  context('null', () => {
    it('returns null', () => {
      assert.equal(freezeObject(null), null);
    });
  });

  context('boolean', () => {
    it('returns boolean', () => {
      assert.equal(freezeObject(true), true);
      assert.equal(freezeObject(false), false);
    });
  });

  context('number', () => {
    it('returns number', () => {
      assert.equal(freezeObject(123), 123);
    });
  });

  context('bigint', () => {
    it('returns bigint', () => {
      assert.equal(freezeObject(123n), 123n);
    });
  });

  context('symbol', () => {
    it('returns symbol', () => {
      const symbol = Symbol();
      assert.equal(freezeObject(symbol), symbol);
    });
  });

  context('string', () => {
    it('returns string', () => {
      assert.equal(freezeObject('string'), 'string');
    });
  });

  context('object', () => {
    let object;
    let copiedObject;
    let frozenObject;

    beforeEach(() => {
      object = {
        a: [[[], [{}]]],
        o: { o1: { o2: { o3: [] } } },
      };

      copiedObject = JSON.parse(JSON.stringify(object));
      frozenObject = freezeObject(object);
    });

    it('preserves object identity', () => {
      assert.equal(frozenObject, object);
    });

    it('preserves object structure', () => {
      assert.deepEqual(copiedObject, object);
    });

    it('freezes the object', () => {
      assert(Object.isFrozen(object), 'Expected object to be frozen');
    });

    it('recursively freezes object properties', () => {
      let value;

      value = object.a;
      assert.deepEqual(value, [[[], [{}]]]);
      assert(Object.isFrozen(value));

      value = object.a[0];
      assert.deepEqual(value, [[], [{}]]);
      assert(Object.isFrozen(value));

      value = object.a[0][0];
      assert.deepEqual(value, []);
      assert(Object.isFrozen(value));

      value = object.a[0][1];
      assert.deepEqual(value, [{}]);
      assert(Object.isFrozen(value));

      value = object.a[0][1][0];
      assert.deepEqual(value, {});
      assert(Object.isFrozen(value));

      assert(Object.isFrozen(object.o));
      assert(Object.isFrozen(object.o.o1));
      assert(Object.isFrozen(object.o.o1.o2));
      assert(Object.isFrozen(object.o.o1.o2.o3));
    });
  });

  context('freezing a function', () => {
    let f;

    beforeEach(() => {
      f = function () {};
      freezeObject(f);
    });

    it('freezes the function', () => {
      assert(Object.isFrozen(f, 'Expected function to be frozen'));
    });

    it('freezes the prototype property', () => {
      assert(Object.isFrozen(f.prototype, 'Expected f.prototype to be frozen'));
    });
  });

  context('freezing a non-enumerable property', () => {
    let object;

    beforeEach(() => {
      object = {};

      Object.defineProperty(object, 'prop', {
        enumerable: false,
        value: {},
      });

      freezeObject(object);
    });

    it('freezes the property', () => {
      assert(Object.isFrozen(object.prop, 'Expected object.prop to be frozen'));
    });
  });

  context('freezing a symbol key property', () => {
    let object;
    let symbol;

    beforeEach(() => {
      object = {};
      symbol = Symbol();
      object[symbol] = {};
      freezeObject(object);
    });

    it('freezes the property', () => {
      const value = object[symbol];
      assert(Object.isFrozen(value, 'Expected object[symbol] to be frozen'));
    });
  });

  context('freezing a property of a frozen object', () => {
    let object;

    beforeEach(() => {
      object = Object.freeze({ prop: {} });
      freezeObject(object);
    });

    it('freezes the property', () => {
      assert(Object.isFrozen(object.prop, 'Expected object.prop to be frozen'));
    });
  });

  context('freezing a circular structure', () => {
    let object1;
    let object2;

    beforeEach(() => {
      object1 = {};
      object2 = {};
      object1.prop = object2;
      object2.prop = object1;
    });

    context('freezing one object', () => {
      beforeEach(() => {
        freezeObject(object1);
      });

      it('freezes both', () => {
        assert(Object.isFrozen(object1, 'Expected object1 to be frozen'));
        assert(Object.isFrozen(object2, 'Expected object2 to be frozen'));
      });
    });

    context('freezing the other object', () => {
      beforeEach(() => {
        freezeObject(object2);
      });

      it('freezes both', () => {
        assert(Object.isFrozen(object1, 'Expected object1 to be frozen'));
        assert(Object.isFrozen(object2, 'Expected object2 to be frozen'));
      });
    });
  });

  context('not freezing inherited properties', () => {
    let object;

    beforeEach(() => {
      const C = function () {
        this.ownProp = {};
      };

      C.prototype.protoProp = {};

      object = freezeObject(new C());
    });

    it('freezes own properties', () => {
      assert(Object.isFrozen(object.ownProp));
    });

    it('does not freeze inherited properties', () => {
      assert(!Object.isFrozen(object.protoProp));
      assert(!Object.isFrozen(object.toString));
    });
  });
});
