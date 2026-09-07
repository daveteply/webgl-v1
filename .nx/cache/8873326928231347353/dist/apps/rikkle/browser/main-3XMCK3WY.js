var i = Object.defineProperty;
var j$2 = Object.defineProperties;
var k$2 = Object.getOwnPropertyDescriptors;
var e = Object.getOwnPropertySymbols;
var g = Object.prototype.hasOwnProperty;
var h = Object.prototype.propertyIsEnumerable;
var f$1 = (a, b, c) => (b in a ? i(a, b, { enumerable: !0, configurable: !0, writable: !0, value: c }) : (a[b] = c));
var l = (a, b) => {
  for (var c in (b ||= {})) g.call(b, c) && f$1(a, c, b[c]);
  if (e) for (var c of e(b)) h.call(b, c) && f$1(a, c, b[c]);
  return a;
};
var m$3 = (a, b) => j$2(a, k$2(b));
var n = (a, b) => {
  var c = {};
  for (var d in a) g.call(a, d) && b.indexOf(d) < 0 && (c[d] = a[d]);
  if (a != null && e) for (var d of e(a)) b.indexOf(d) < 0 && h.call(a, d) && (c[d] = a[d]);
  return c;
};
var Y = null;
var cr$2 = !1;
var tt$2 = 1;
var hp = null;
var W = Symbol(`SIGNAL`);
function y$1(e) {
  let t = Y;
  return ((Y = e), t);
}
function fr$1() {
  return Y;
}
var nt$2 = {
  version: 0,
  lastCleanEpoch: 0,
  dirty: !1,
  producers: void 0,
  producersTail: void 0,
  consumers: void 0,
  consumersTail: void 0,
  recomputing: !1,
  consumerAllowSignalWrites: !1,
  consumerIsAlwaysLive: !1,
  kind: `unknown`,
  producerMustRecompute: () => !1,
  producerRecomputeValue: () => {},
  consumerMarkedDirty: () => {},
  consumerOnSignalRead: () => {},
};
function rt$2(e) {
  if (cr$2) throw new Error(``);
  if (Y === null) return;
  Y.consumerOnSignalRead(e);
  let t = Y.producersTail;
  if (t !== void 0 && t.producer === e) return;
  let n,
    r = Y.recomputing;
  if (r && ((n = t !== void 0 ? t.nextProducer : Y.producers), n !== void 0 && n.producer === e)) {
    ((Y.producersTail = n), (n.lastReadVersion = e.version), (n.knownValidAtEpoch = tt$2));
    return;
  }
  let o = e.consumersTail;
  if (o !== void 0 && o.consumer === Y && (!r || o.knownValidAtEpoch === tt$2)) return;
  let i = Lt(Y),
    s = {
      producer: e,
      consumer: Y,
      nextProducer: n,
      prevConsumer: void 0,
      knownValidAtEpoch: tt$2,
      lastReadVersion: e.version,
      nextConsumer: void 0,
    };
  ((Y.producersTail = s), t !== void 0 ? (t.nextProducer = s) : (Y.producers = s), i && ic(e, s));
}
function nc() {
  tt$2++;
}
function pr$1(e) {
  if (!(Lt(e) && !e.dirty) && !(!e.dirty && e.lastCleanEpoch === tt$2)) {
    if (!e.producerMustRecompute(e) && !kt$1(e)) {
      dr$2(e);
      return;
    }
    (e.producerRecomputeValue(e), dr$2(e));
  }
}
function ai$2(e) {
  if (e.consumers === void 0) return;
  let t = cr$2;
  cr$2 = !0;
  try {
    for (let n = e.consumers; n !== void 0; n = n.nextConsumer) {
      let r = n.consumer;
      r.dirty || gp(r);
    }
  } finally {
    cr$2 = t;
  }
}
function ci$2() {
  return Y?.consumerAllowSignalWrites !== !1;
}
function gp(e) {
  ((e.dirty = !0), ai$2(e), e.consumerMarkedDirty?.(e));
}
function dr$2(e) {
  ((e.dirty = !1), (e.lastCleanEpoch = tt$2));
}
function Ue$2(e) {
  return (e && rc(e), y$1(e));
}
function rc(e) {
  if (e.producersTail?.knownValidAtEpoch === tt$2) {
    let t = e.producers;
    for (; t !== void 0;) ((t.knownValidAtEpoch = null), (t = t.nextProducer));
  }
  ((e.producersTail = void 0), (e.recomputing = !0));
}
function ot$2(e, t) {
  (y$1(t), e && oc(e));
}
function oc(e) {
  e.recomputing = !1;
  let t = e.producersTail,
    n = t !== void 0 ? t.nextProducer : e.producers;
  if (n !== void 0) {
    if (Lt(e))
      do n = li$2(n);
      while (n !== void 0);
    t !== void 0 ? (t.nextProducer = void 0) : (e.producers = void 0);
  }
}
function kt$1(e) {
  for (let t = e.producers; t !== void 0; t = t.nextProducer) {
    let n = t.producer,
      r = t.lastReadVersion;
    if (r !== n.version || (pr$1(n), r !== n.version)) return !0;
  }
  return !1;
}
function We(e) {
  if (Lt(e)) {
    let t = e.producers;
    for (; t !== void 0;) t = li$2(t);
  }
  ((e.producers = void 0), (e.producersTail = void 0), (e.consumers = void 0), (e.consumersTail = void 0));
}
function ic(e, t) {
  let n = e.consumersTail,
    r = Lt(e);
  if (
    (n !== void 0
      ? ((t.nextConsumer = n.nextConsumer), (n.nextConsumer = t))
      : ((t.nextConsumer = void 0), (e.consumers = t)),
    (t.prevConsumer = n),
    (e.consumersTail = t),
    !r)
  )
    for (let o = e.producers; o !== void 0; o = o.nextProducer) ic(o.producer, o);
}
function li$2(e) {
  let t = e.producer,
    n = e.nextProducer,
    r = e.nextConsumer,
    o = e.prevConsumer;
  if (
    ((e.nextConsumer = void 0),
    (e.prevConsumer = void 0),
    r !== void 0 ? (r.prevConsumer = o) : (t.consumersTail = o),
    o !== void 0)
  )
    o.nextConsumer = r;
  else if (((t.consumers = r), !Lt(t))) {
    let i = t.producers;
    for (; i !== void 0;) i = li$2(i);
  }
  return n;
}
function Lt(e) {
  return e.consumerIsAlwaysLive || e.consumers !== void 0;
}
function hr$1(e) {
  hp?.(e);
}
function gr(e, t) {
  return Object.is(e, t);
}
function mr(e, t) {
  let n = Object.create(mp);
  ((n.computation = e), t !== void 0 && (n.equal = t));
  let r = () => {
    if ((pr$1(n), rt$2(n), n.value === mn$2)) throw n.error;
    return n.value;
  };
  return ((r[W] = n), hr$1(n), r);
}
var lr$2 = Symbol(`UNSET`);
var ur$2 = Symbol(`COMPUTING`);
var mn$2 = Symbol(`ERRORED`);
var mp = m$3(l({}, nt$2), {
  value: lr$2,
  dirty: !0,
  error: null,
  equal: gr,
  kind: `computed`,
  producerMustRecompute(e) {
    return e.value === lr$2 || e.value === ur$2;
  },
  producerRecomputeValue(e) {
    if (e.value === ur$2) throw new Error(``);
    let t = e.value;
    e.value = ur$2;
    let n = Ue$2(e),
      r,
      o = !1;
    try {
      ((r = e.computation()), y$1(null), (o = t !== lr$2 && t !== mn$2 && r !== mn$2 && e.equal(t, r)));
    } catch (i) {
      ((r = mn$2), (e.error = i));
    } finally {
      ot$2(e, n);
    }
    if (o) {
      e.value = t;
      return;
    }
    ((e.value = r), e.version++);
  },
});
function yp() {
  throw new Error();
}
var sc = yp;
function ac(e) {
  sc(e);
}
function ui$2(e) {
  sc = e;
}
var vp = null;
function di$2(e, t) {
  let n = Object.create(yn$2);
  ((n.value = e), t !== void 0 && (n.equal = t));
  let r = () => cc(n);
  return ((r[W] = n), hr$1(n), [r, (s) => Pt(n, s), (s) => fi$2(n, s)]);
}
function cc(e) {
  return (rt$2(e), e.value);
}
function Pt(e, t) {
  (ci$2() || ac(e), e.equal(e.value, t) || ((e.value = t), Ip(e)));
}
function fi$2(e, t) {
  (ci$2() || ac(e), Pt(e, t(e.value)));
}
var yn$2 = m$3(l({}, nt$2), { equal: gr, value: void 0, kind: `signal` });
function Ip(e) {
  (e.version++, nc(), ai$2(e), vp?.(e));
}
var pi$1 = m$3(l({}, nt$2), { consumerIsAlwaysLive: !0, consumerAllowSignalWrites: !0, dirty: !0, kind: `effect` });
function hi$1(e) {
  if (((e.dirty = !1), e.version > 0 && !kt$1(e))) return;
  e.version++;
  let t = Ue$2(e);
  try {
    (e.cleanup(), e.fn());
  } finally {
    ot$2(e, t);
  }
}
var gi$1;
function yr$1() {
  return gi$1;
}
function ve$1(e) {
  let t = gi$1;
  return ((gi$1 = e), t);
}
var lc = Symbol(`NotFound`);
function Ft$1(e) {
  return e === lc || e?.name === `ɵNotFound`;
}
function uc(e) {
  let t = y$1(null);
  try {
    return e();
  } finally {
    y$1(t);
  }
}
function v(e) {
  return typeof e == `function`;
}
function jt(e) {
  let n = e((r) => {
    (Error.call(r), (r.stack = new Error().stack));
  });
  return ((n.prototype = Object.create(Error.prototype)), (n.prototype.constructor = n), n);
}
var vr$1 = jt(
  (e) =>
    function (n) {
      (e(this),
        (this.message = n
          ? `${n.length} errors occurred during unsubscription:
${n.map((r, o) => `${o + 1}) ${r.toString()}`).join(`
  `)}`
          : ``),
        (this.name = `UnsubscriptionError`),
        (this.errors = n));
    },
);
function it$2(e, t) {
  if (e) {
    let n = e.indexOf(t);
    0 <= n && e.splice(n, 1);
  }
}
var q = class e {
  constructor(t) {
    ((this.initialTeardown = t), (this.closed = !1), (this._parentage = null), (this._finalizers = null));
  }
  unsubscribe() {
    let t;
    if (!this.closed) {
      this.closed = !0;
      let { _parentage: n } = this;
      if (n)
        if (((this._parentage = null), Array.isArray(n))) for (let i of n) i.remove(this);
        else n.remove(this);
      let { initialTeardown: r } = this;
      if (v(r))
        try {
          r();
        } catch (i) {
          t = i instanceof vr$1 ? i.errors : [i];
        }
      let { _finalizers: o } = this;
      if (o) {
        this._finalizers = null;
        for (let i of o)
          try {
            dc(i);
          } catch (s) {
            ((t = t ?? []), s instanceof vr$1 ? (t = [...t, ...s.errors]) : t.push(s));
          }
      }
      if (t) throw new vr$1(t);
    }
  }
  add(t) {
    var n;
    if (t && t !== this)
      if (this.closed) dc(t);
      else {
        if (t instanceof e) {
          if (t.closed || t._hasParent(this)) return;
          t._addParent(this);
        }
        (this._finalizers = (n = this._finalizers) !== null && n !== void 0 ? n : []).push(t);
      }
  }
  _hasParent(t) {
    let { _parentage: n } = this;
    return n === t || (Array.isArray(n) && n.includes(t));
  }
  _addParent(t) {
    let { _parentage: n } = this;
    this._parentage = Array.isArray(n) ? (n.push(t), n) : n ? [n, t] : t;
  }
  _removeParent(t) {
    let { _parentage: n } = this;
    n === t ? (this._parentage = null) : Array.isArray(n) && it$2(n, t);
  }
  remove(t) {
    let { _finalizers: n } = this;
    (n && it$2(n, t), t instanceof e && t._removeParent(this));
  }
};
q.EMPTY = (() => {
  let e = new q();
  return ((e.closed = !0), e);
})();
var mi$1 = q.EMPTY;
function Ir$1(e) {
  return e instanceof q || (e && `closed` in e && v(e.remove) && v(e.add) && v(e.unsubscribe));
}
function dc(e) {
  v(e) ? e() : e.unsubscribe();
}
var de$2 = {
  onUnhandledError: null,
  onStoppedNotification: null,
  Promise: void 0,
  useDeprecatedSynchronousErrorHandling: !1,
  useDeprecatedNextContext: !1,
};
var Vt$2 = {
  setTimeout(e, t, ...n) {
    let { delegate: r } = Vt$2;
    return r?.setTimeout ? r.setTimeout(e, t, ...n) : setTimeout(e, t, ...n);
  },
  clearTimeout(e) {
    let { delegate: t } = Vt$2;
    return (t?.clearTimeout || clearTimeout)(e);
  },
  delegate: void 0,
};
function Er$1(e) {
  Vt$2.setTimeout(() => {
    let { onUnhandledError: t } = de$2;
    if (t) t(e);
    else throw e;
  });
}
function st$2() {}
var fc = yi$1(`C`, void 0, void 0);
function pc(e) {
  return yi$1(`E`, void 0, e);
}
function hc(e) {
  return yi$1(`N`, e, void 0);
}
function yi$1(e, t, n) {
  return { kind: e, value: t, error: n };
}
var at$2 = null;
function Ht$2(e) {
  if (de$2.useDeprecatedSynchronousErrorHandling) {
    let t = !at$2;
    if ((t && (at$2 = { errorThrown: !1, error: null }), e(), t)) {
      let { errorThrown: n, error: r } = at$2;
      if (((at$2 = null), n)) throw r;
    }
  } else e();
}
function gc(e) {
  de$2.useDeprecatedSynchronousErrorHandling && at$2 && ((at$2.errorThrown = !0), (at$2.error = e));
}
var ct$2 = class extends q {
  constructor(t) {
    (super(), (this.isStopped = !1), t ? ((this.destination = t), Ir$1(t) && t.add(this)) : (this.destination = Tp));
  }
  static create(t, n, r) {
    return new Re(t, n, r);
  }
  next(t) {
    this.isStopped ? Ii$1(hc(t), this) : this._next(t);
  }
  error(t) {
    this.isStopped ? Ii$1(pc(t), this) : ((this.isStopped = !0), this._error(t));
  }
  complete() {
    this.isStopped ? Ii$1(fc, this) : ((this.isStopped = !0), this._complete());
  }
  unsubscribe() {
    this.closed || ((this.isStopped = !0), super.unsubscribe(), (this.destination = null));
  }
  _next(t) {
    this.destination.next(t);
  }
  _error(t) {
    try {
      this.destination.error(t);
    } finally {
      this.unsubscribe();
    }
  }
  _complete() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }
};
var Ep = Function.prototype.bind;
function vi$1(e, t) {
  return Ep.call(e, t);
}
var Ei$1 = class {
  constructor(t) {
    this.partialObserver = t;
  }
  next(t) {
    let { partialObserver: n } = this;
    if (n.next)
      try {
        n.next(t);
      } catch (r) {
        Dr(r);
      }
  }
  error(t) {
    let { partialObserver: n } = this;
    if (n.error)
      try {
        n.error(t);
      } catch (r) {
        Dr(r);
      }
    else Dr(t);
  }
  complete() {
    let { partialObserver: t } = this;
    if (t.complete)
      try {
        t.complete();
      } catch (n) {
        Dr(n);
      }
  }
};
var Re = class extends ct$2 {
  constructor(t, n, r) {
    super();
    let o;
    if (v(t) || !t) o = { next: t ?? void 0, error: n ?? void 0, complete: r ?? void 0 };
    else {
      let i;
      this && de$2.useDeprecatedNextContext
        ? ((i = Object.create(t)),
          (i.unsubscribe = () => this.unsubscribe()),
          (o = {
            next: t.next && vi$1(t.next, i),
            error: t.error && vi$1(t.error, i),
            complete: t.complete && vi$1(t.complete, i),
          }))
        : (o = t);
    }
    this.destination = new Ei$1(o);
  }
};
function Dr(e) {
  de$2.useDeprecatedSynchronousErrorHandling ? gc(e) : Er$1(e);
}
function Dp(e) {
  throw e;
}
function Ii$1(e, t) {
  let { onStoppedNotification: n } = de$2;
  n && Vt$2.setTimeout(() => n(e, t));
}
var Tp = { closed: !0, next: st$2, error: Dp, complete: st$2 };
var Bt$1 = (typeof Symbol == `function` && Symbol.observable) || `@@observable`;
function ne(e) {
  return e;
}
function wp(...e) {
  return Di$1(e);
}
function Di$1(e) {
  return e.length === 0
    ? ne
    : e.length === 1
      ? e[0]
      : function (n) {
          return e.reduce((r, o) => o(r), n);
        };
}
var b = class e {
  constructor(t) {
    t && (this._subscribe = t);
  }
  lift(t) {
    let n = new e();
    return ((n.source = this), (n.operator = t), n);
  }
  subscribe(t, n, r) {
    let o = bp(t) ? t : new Re(t, n, r);
    return (
      Ht$2(() => {
        let { operator: i, source: s } = this;
        o.add(i ? i.call(o, s) : s ? this._subscribe(o) : this._trySubscribe(o));
      }),
      o
    );
  }
  _trySubscribe(t) {
    try {
      return this._subscribe(t);
    } catch (n) {
      t.error(n);
    }
  }
  forEach(t, n) {
    return (
      (n = mc(n)),
      new n((r, o) => {
        let i = new Re({
          next: (s) => {
            try {
              t(s);
            } catch (a) {
              (o(a), i.unsubscribe());
            }
          },
          error: o,
          complete: r,
        });
        this.subscribe(i);
      })
    );
  }
  _subscribe(t) {
    var n;
    return (n = this.source) === null || n === void 0 ? void 0 : n.subscribe(t);
  }
  [Bt$1]() {
    return this;
  }
  pipe(...t) {
    return Di$1(t)(this);
  }
  toPromise(t) {
    return (
      (t = mc(t)),
      new t((n, r) => {
        let o;
        this.subscribe(
          (i) => (o = i),
          (i) => r(i),
          () => n(o),
        );
      })
    );
  }
};
b.create = (e) => new b(e);
function mc(e) {
  var t;
  return (t = e ?? de$2.Promise) !== null && t !== void 0 ? t : Promise;
}
function Cp(e) {
  return e && v(e.next) && v(e.error) && v(e.complete);
}
function bp(e) {
  return (e && e instanceof ct$2) || (Cp(e) && Ir$1(e));
}
function _p(e) {
  return v(e?.lift);
}
function C$1(e) {
  return (t) => {
    if (_p(t))
      return t.lift(function (n) {
        try {
          return e(n, this);
        } catch (r) {
          this.error(r);
        }
      });
    throw new TypeError(`Unable to lift unknown Observable type`);
  };
}
function _$1(e, t, n, r, o) {
  return new Ti$1(e, t, n, r, o);
}
var Ti$1 = class extends ct$2 {
  constructor(t, n, r, o, i, s) {
    (super(t),
      (this.onFinalize = i),
      (this.shouldUnsubscribe = s),
      (this._next = n
        ? function (a) {
            try {
              n(a);
            } catch (c) {
              t.error(c);
            }
          }
        : super._next),
      (this._error = o
        ? function (a) {
            try {
              o(a);
            } catch (c) {
              t.error(c);
            } finally {
              this.unsubscribe();
            }
          }
        : super._error),
      (this._complete = r
        ? function () {
            try {
              r();
            } catch (a) {
              t.error(a);
            } finally {
              this.unsubscribe();
            }
          }
        : super._complete));
  }
  unsubscribe() {
    var t;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      let { closed: n } = this;
      (super.unsubscribe(), !n && ((t = this.onFinalize) === null || t === void 0 || t.call(this)));
    }
  }
};
var yc = jt(
  (e) =>
    function () {
      (e(this), (this.name = `ObjectUnsubscribedError`), (this.message = `object unsubscribed`));
    },
);
var Z$2 = class extends b {
  constructor() {
    (super(),
      (this.closed = !1),
      (this.currentObservers = null),
      (this.observers = []),
      (this.isStopped = !1),
      (this.hasError = !1),
      (this.thrownError = null));
  }
  lift(t) {
    let n = new Tr(this, this);
    return ((n.operator = t), n);
  }
  _throwIfClosed() {
    if (this.closed) throw new yc();
  }
  next(t) {
    Ht$2(() => {
      if ((this._throwIfClosed(), !this.isStopped)) {
        this.currentObservers || (this.currentObservers = Array.from(this.observers));
        for (let n of this.currentObservers) n.next(t);
      }
    });
  }
  error(t) {
    Ht$2(() => {
      if ((this._throwIfClosed(), !this.isStopped)) {
        ((this.hasError = this.isStopped = !0), (this.thrownError = t));
        let { observers: n } = this;
        for (; n.length;) n.shift().error(t);
      }
    });
  }
  complete() {
    Ht$2(() => {
      if ((this._throwIfClosed(), !this.isStopped)) {
        this.isStopped = !0;
        let { observers: t } = this;
        for (; t.length;) t.shift().complete();
      }
    });
  }
  unsubscribe() {
    ((this.isStopped = this.closed = !0), (this.observers = this.currentObservers = null));
  }
  get observed() {
    var t;
    return ((t = this.observers) === null || t === void 0 ? void 0 : t.length) > 0;
  }
  _trySubscribe(t) {
    return (this._throwIfClosed(), super._trySubscribe(t));
  }
  _subscribe(t) {
    return (this._throwIfClosed(), this._checkFinalizedStatuses(t), this._innerSubscribe(t));
  }
  _innerSubscribe(t) {
    let { hasError: n, isStopped: r, observers: o } = this;
    return n || r
      ? mi$1
      : ((this.currentObservers = null),
        o.push(t),
        new q(() => {
          ((this.currentObservers = null), it$2(o, t));
        }));
  }
  _checkFinalizedStatuses(t) {
    let { hasError: n, thrownError: r, isStopped: o } = this;
    n ? t.error(r) : o && t.complete();
  }
  asObservable() {
    let t = new b();
    return ((t.source = this), t);
  }
};
Z$2.create = (e, t) => new Tr(e, t);
var Tr = class extends Z$2 {
  constructor(t, n) {
    (super(), (this.destination = t), (this.source = n));
  }
  next(t) {
    var n, r;
    (r = (n = this.destination) === null || n === void 0 ? void 0 : n.next) === null || r === void 0 || r.call(n, t);
  }
  error(t) {
    var n, r;
    (r = (n = this.destination) === null || n === void 0 ? void 0 : n.error) === null || r === void 0 || r.call(n, t);
  }
  complete() {
    var t, n;
    (n = (t = this.destination) === null || t === void 0 ? void 0 : t.complete) === null || n === void 0 || n.call(t);
  }
  _subscribe(t) {
    var n, r;
    return (r = (n = this.source) === null || n === void 0 ? void 0 : n.subscribe(t)) !== null && r !== void 0
      ? r
      : mi$1;
  }
};
var vn$1 = class extends Z$2 {
  constructor(t) {
    (super(), (this._value = t));
  }
  get value() {
    return this.getValue();
  }
  _subscribe(t) {
    let n = super._subscribe(t);
    return (!n.closed && t.next(this._value), n);
  }
  getValue() {
    let { hasError: t, thrownError: n, _value: r } = this;
    if (t) throw n;
    return (this._throwIfClosed(), r);
  }
  next(t) {
    super.next((this._value = t));
  }
};
var In$2 = {
  now() {
    return (In$2.delegate || Date).now();
  },
  delegate: void 0,
};
var wi$1 = class extends Z$2 {
  constructor(t = Infinity, n = Infinity, r = In$2) {
    (super(),
      (this._bufferSize = t),
      (this._windowTime = n),
      (this._timestampProvider = r),
      (this._buffer = []),
      (this._infiniteTimeWindow = !0),
      (this._infiniteTimeWindow = n === Infinity),
      (this._bufferSize = Math.max(1, t)),
      (this._windowTime = Math.max(1, n)));
  }
  next(t) {
    let { isStopped: n, _buffer: r, _infiniteTimeWindow: o, _timestampProvider: i, _windowTime: s } = this;
    (n || (r.push(t), !o && r.push(i.now() + s)), this._trimBuffer(), super.next(t));
  }
  _subscribe(t) {
    (this._throwIfClosed(), this._trimBuffer());
    let n = this._innerSubscribe(t),
      { _infiniteTimeWindow: r, _buffer: o } = this,
      i = o.slice();
    for (let s = 0; s < i.length && !t.closed; s += r ? 1 : 2) t.next(i[s]);
    return (this._checkFinalizedStatuses(t), n);
  }
  _trimBuffer() {
    let { _bufferSize: t, _timestampProvider: n, _buffer: r, _infiniteTimeWindow: o } = this,
      i = (o ? 1 : 2) * t;
    if ((t < Infinity && i < r.length && r.splice(0, r.length - i), !o)) {
      let s = n.now(),
        a = 0;
      for (let c = 1; c < r.length && r[c] <= s; c += 2) a = c;
      a && r.splice(0, a + 1);
    }
  }
};
var wr$1 = class extends q {
  constructor(t, n) {
    super();
  }
  schedule(t, n = 0) {
    return this;
  }
};
var En$2 = {
  setInterval(e, t, ...n) {
    let { delegate: r } = En$2;
    return r?.setInterval ? r.setInterval(e, t, ...n) : setInterval(e, t, ...n);
  },
  clearInterval(e) {
    let { delegate: t } = En$2;
    return (t?.clearInterval || clearInterval)(e);
  },
  delegate: void 0,
};
var Cr$1 = class extends wr$1 {
  constructor(t, n) {
    (super(t, n), (this.scheduler = t), (this.work = n), (this.pending = !1));
  }
  schedule(t, n = 0) {
    var r;
    if (this.closed) return this;
    this.state = t;
    let o = this.id,
      i = this.scheduler;
    return (
      o != null && (this.id = this.recycleAsyncId(i, o, n)),
      (this.pending = !0),
      (this.delay = n),
      (this.id = (r = this.id) !== null && r !== void 0 ? r : this.requestAsyncId(i, this.id, n)),
      this
    );
  }
  requestAsyncId(t, n, r = 0) {
    return En$2.setInterval(t.flush.bind(t, this), r);
  }
  recycleAsyncId(t, n, r = 0) {
    if (r != null && this.delay === r && this.pending === !1) return n;
    n != null && En$2.clearInterval(n);
  }
  execute(t, n) {
    if (this.closed) return new Error(`executing a cancelled action`);
    this.pending = !1;
    let r = this._execute(t, n);
    if (r) return r;
    this.pending === !1 && this.id != null && (this.id = this.recycleAsyncId(this.scheduler, this.id, null));
  }
  _execute(t, n) {
    let r = !1,
      o;
    try {
      this.work(t);
    } catch (i) {
      ((r = !0), (o = i || new Error(`Scheduled action threw falsy error`)));
    }
    if (r) return (this.unsubscribe(), o);
  }
  unsubscribe() {
    if (!this.closed) {
      let { id: t, scheduler: n } = this,
        { actions: r } = n;
      ((this.work = this.state = this.scheduler = null),
        (this.pending = !1),
        it$2(r, this),
        t != null && (this.id = this.recycleAsyncId(n, t, null)),
        (this.delay = null),
        super.unsubscribe());
    }
  }
};
var Ci$1 = (() => {
  class e {
    constructor(n, r = e.now) {
      ((this.schedulerActionCtor = n), (this.now = r));
    }
    schedule(n, r = 0, o) {
      return new this.schedulerActionCtor(this, n).schedule(o, r);
    }
  }
  return ((e.now = In$2.now), e);
})();
var br$1 = class extends Ci$1 {
  constructor(t, n = Ci$1.now) {
    (super(t, n), (this.actions = []), (this._active = !1));
  }
  flush(t) {
    let { actions: n } = this;
    if (this._active) {
      n.push(t);
      return;
    }
    let r;
    this._active = !0;
    do if ((r = t.execute(t.state, t.delay))) break;
    while ((t = n.shift()));
    if (((this._active = !1), r)) {
      for (; (t = n.shift());) t.unsubscribe();
      throw r;
    }
  }
};
var lt$2 = new br$1(Cr$1);
var vc = lt$2;
var ut$2 = new b((e) => e.complete());
function _r$1(e) {
  return e && v(e.schedule);
}
function bi$1(e) {
  return e[e.length - 1];
}
function Mr$1(e) {
  return v(bi$1(e)) ? e.pop() : void 0;
}
function Ie$2(e) {
  return _r$1(bi$1(e)) ? e.pop() : void 0;
}
function Ic(e, t) {
  return typeof bi$1(e) == `number` ? e.pop() : t;
}
function Dc(e, t, n, r) {
  function o(i) {
    return i instanceof n
      ? i
      : new n(function (s) {
          s(i);
        });
  }
  return new (n || (n = Promise))(function (i, s) {
    function a(u) {
      try {
        l(r.next(u));
      } catch (d) {
        s(d);
      }
    }
    function c(u) {
      try {
        l(r.throw(u));
      } catch (d) {
        s(d);
      }
    }
    function l(u) {
      u.done ? i(u.value) : o(u.value).then(a, c);
    }
    l((r = r.apply(e, t || [])).next());
  });
}
function Ec(e) {
  var t = typeof Symbol == `function` && Symbol.iterator,
    n = t && e[t],
    r = 0;
  if (n) return n.call(e);
  if (e && typeof e.length == `number`)
    return {
      next: function () {
        return (e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e });
      },
    };
  throw new TypeError(t ? `Object is not iterable.` : `Symbol.iterator is not defined.`);
}
function dt$2(e) {
  return this instanceof dt$2 ? ((this.v = e), this) : new dt$2(e);
}
function Tc(e, t, n) {
  if (!Symbol.asyncIterator) throw new TypeError(`Symbol.asyncIterator is not defined.`);
  var r = n.apply(e, t || []),
    o,
    i = [];
  return (
    (o = Object.create((typeof AsyncIterator == `function` ? AsyncIterator : Object).prototype)),
    a(`next`),
    a(`throw`),
    a(`return`, s),
    (o[Symbol.asyncIterator] = function () {
      return this;
    }),
    o
  );
  function s(f) {
    return function (h) {
      return Promise.resolve(h).then(f, d);
    };
  }
  function a(f, h) {
    r[f] &&
      ((o[f] = function (g) {
        return new Promise(function (R, D) {
          i.push([f, g, R, D]) > 1 || c(f, g);
        });
      }),
      h && (o[f] = h(o[f])));
  }
  function c(f, h) {
    try {
      l(r[f](h));
    } catch (g) {
      p(i[0][3], g);
    }
  }
  function l(f) {
    f.value instanceof dt$2 ? Promise.resolve(f.value.v).then(u, d) : p(i[0][2], f);
  }
  function u(f) {
    c(`next`, f);
  }
  function d(f) {
    c(`throw`, f);
  }
  function p(f, h) {
    (f(h), i.shift(), i.length && c(i[0][0], i[0][1]));
  }
}
function wc(e) {
  if (!Symbol.asyncIterator) throw new TypeError(`Symbol.asyncIterator is not defined.`);
  var t = e[Symbol.asyncIterator],
    n;
  return t
    ? t.call(e)
    : ((e = typeof Ec == `function` ? Ec(e) : e[Symbol.iterator]()),
      (n = {}),
      r(`next`),
      r(`throw`),
      r(`return`),
      (n[Symbol.asyncIterator] = function () {
        return this;
      }),
      n);
  function r(i) {
    n[i] =
      e[i] &&
      function (s) {
        return new Promise(function (a, c) {
          ((s = e[i](s)), o(a, c, s.done, s.value));
        });
      };
  }
  function o(i, s, a, c) {
    Promise.resolve(c).then(function (l) {
      i({ value: l, done: a });
    }, s);
  }
}
var $t$1 = (e) => e && typeof e.length == `number` && typeof e != `function`;
function Nr$1(e) {
  return v(e?.then);
}
function Sr$1(e) {
  return v(e[Bt$1]);
}
function xr$1(e) {
  return Symbol.asyncIterator && v(e?.[Symbol.asyncIterator]);
}
function Ar$1(e) {
  return new TypeError(
    `You provided ${e !== null && typeof e == `object` ? `an invalid object` : `'${e}'`} where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`,
  );
}
function Mp() {
  return typeof Symbol != `function` || !Symbol.iterator ? `@@iterator` : Symbol.iterator;
}
var Or$1 = Mp();
function Rr$1(e) {
  return v(e?.[Or$1]);
}
function kr$1(e) {
  return Tc(this, arguments, function* () {
    let n = e.getReader();
    try {
      for (;;) {
        let { value: r, done: o } = yield dt$2(n.read());
        if (o) return yield dt$2(void 0);
        yield yield dt$2(r);
      }
    } finally {
      n.releaseLock();
    }
  });
}
function Lr$1(e) {
  return v(e?.getReader);
}
function S$1(e) {
  if (e instanceof b) return e;
  if (e != null) {
    if (Sr$1(e)) return Np(e);
    if ($t$1(e)) return Sp(e);
    if (Nr$1(e)) return xp(e);
    if (xr$1(e)) return Cc(e);
    if (Rr$1(e)) return Ap(e);
    if (Lr$1(e)) return Op(e);
  }
  throw Ar$1(e);
}
function Np(e) {
  return new b((t) => {
    let n = e[Bt$1]();
    if (v(n.subscribe)) return n.subscribe(t);
    throw new TypeError(`Provided object does not correctly implement Symbol.observable`);
  });
}
function Sp(e) {
  return new b((t) => {
    for (let n = 0; n < e.length && !t.closed; n++) t.next(e[n]);
    t.complete();
  });
}
function xp(e) {
  return new b((t) => {
    e.then(
      (n) => {
        t.closed || (t.next(n), t.complete());
      },
      (n) => t.error(n),
    ).then(null, Er$1);
  });
}
function Ap(e) {
  return new b((t) => {
    for (let n of e) if ((t.next(n), t.closed)) return;
    t.complete();
  });
}
function Cc(e) {
  return new b((t) => {
    Rp(e, t).catch((n) => t.error(n));
  });
}
function Op(e) {
  return Cc(kr$1(e));
}
function Rp(e, t) {
  var n, r, o, i;
  return Dc(this, void 0, void 0, function* () {
    try {
      for (n = wc(e); (r = yield n.next()), !r.done;) {
        let s = r.value;
        if ((t.next(s), t.closed)) return;
      }
    } catch (s) {
      o = { error: s };
    } finally {
      try {
        r && !r.done && (i = n.return) && (yield i.call(n));
      } finally {
        if (o) throw o.error;
      }
    }
    t.complete();
  });
}
function ee$1(e, t, n, r = 0, o = !1) {
  let i = t.schedule(function () {
    (n(), o ? e.add(this.schedule(null, r)) : this.unsubscribe());
  }, r);
  if ((e.add(i), !o)) return i;
}
function Pr$1(e, t = 0) {
  return C$1((n, r) => {
    n.subscribe(
      _$1(
        r,
        (o) => ee$1(r, e, () => r.next(o), t),
        () => ee$1(r, e, () => r.complete(), t),
        (o) => ee$1(r, e, () => r.error(o), t),
      ),
    );
  });
}
function Fr$1(e, t = 0) {
  return C$1((n, r) => {
    r.add(e.schedule(() => n.subscribe(r), t));
  });
}
function bc(e, t) {
  return S$1(e).pipe(Fr$1(t), Pr$1(t));
}
function _c(e, t) {
  return S$1(e).pipe(Fr$1(t), Pr$1(t));
}
function Mc(e, t) {
  return new b((n) => {
    let r = 0;
    return t.schedule(function () {
      r === e.length ? n.complete() : (n.next(e[r++]), n.closed || this.schedule());
    });
  });
}
function Nc(e, t) {
  return new b((n) => {
    let r;
    return (
      ee$1(n, t, () => {
        ((r = e[Or$1]()),
          ee$1(
            n,
            t,
            () => {
              let o, i;
              try {
                ({ value: o, done: i } = r.next());
              } catch (s) {
                n.error(s);
                return;
              }
              i ? n.complete() : n.next(o);
            },
            0,
            !0,
          ));
      }),
      () => v(r?.return) && r.return()
    );
  });
}
function jr$1(e, t) {
  if (!e) throw new Error(`Iterable cannot be null`);
  return new b((n) => {
    ee$1(n, t, () => {
      let r = e[Symbol.asyncIterator]();
      ee$1(
        n,
        t,
        () => {
          r.next().then((o) => {
            o.done ? n.complete() : n.next(o.value);
          });
        },
        0,
        !0,
      );
    });
  });
}
function Sc(e, t) {
  return jr$1(kr$1(e), t);
}
function xc(e, t) {
  if (e != null) {
    if (Sr$1(e)) return bc(e, t);
    if ($t$1(e)) return Mc(e, t);
    if (Nr$1(e)) return _c(e, t);
    if (xr$1(e)) return jr$1(e, t);
    if (Rr$1(e)) return Nc(e, t);
    if (Lr$1(e)) return Sc(e, t);
  }
  throw Ar$1(e);
}
function Ee$2(e, t) {
  return t ? xc(e, t) : S$1(e);
}
function kp(...e) {
  return Ee$2(e, Ie$2(e));
}
function Lp(e, t) {
  let n = v(e) ? e : () => e,
    r = (o) => o.error(n());
  return new b(t ? (o) => t.schedule(r, 0, o) : r);
}
function Pp(e) {
  return !!e && (e instanceof b || (v(e.lift) && v(e.subscribe)));
}
var Dn$2 = jt(
  (e) =>
    function () {
      (e(this), (this.name = `EmptyError`), (this.message = `no elements in sequence`));
    },
);
function Ac(e) {
  return e instanceof Date && !isNaN(e);
}
function ke$2(e, t) {
  return C$1((n, r) => {
    let o = 0;
    n.subscribe(
      _$1(r, (i) => {
        r.next(e.call(t, i, o++));
      }),
    );
  });
}
var { isArray: Fp } = Array;
function jp(e, t) {
  return Fp(t) ? e(...t) : e(t);
}
function Ut(e) {
  return ke$2((t) => jp(e, t));
}
var { isArray: Vp } = Array,
  { getPrototypeOf: Hp, prototype: Bp, keys: $p } = Object;
function Vr$2(e) {
  if (e.length === 1) {
    let t = e[0];
    if (Vp(t)) return { args: t, keys: null };
    if (Up(t)) {
      let n = $p(t);
      return { args: n.map((r) => t[r]), keys: n };
    }
  }
  return { args: e, keys: null };
}
function Up(e) {
  return e && typeof e == `object` && Hp(e) === Bp;
}
function Hr$1(e, t) {
  return e.reduce((n, r, o) => ((n[r] = t[o]), n), {});
}
function Wp(...e) {
  let t = Ie$2(e),
    n = Mr$1(e),
    { args: r, keys: o } = Vr$2(e);
  if (r.length === 0) return Ee$2([], t);
  let i = new b(qp(r, t, o ? (s) => Hr$1(o, s) : ne));
  return n ? i.pipe(Ut(n)) : i;
}
function qp(e, t, n = ne) {
  return (r) => {
    Oc(
      t,
      () => {
        let { length: o } = e,
          i = new Array(o),
          s = o,
          a = o;
        for (let c = 0; c < o; c++)
          Oc(
            t,
            () => {
              let l = Ee$2(e[c], t),
                u = !1;
              l.subscribe(
                _$1(
                  r,
                  (d) => {
                    ((i[c] = d), u || ((u = !0), a--), a || r.next(n(i.slice())));
                  },
                  () => {
                    --s || r.complete();
                  },
                ),
              );
            },
            r,
          );
      },
      r,
    );
  };
}
function Oc(e, t, n) {
  e ? ee$1(n, e, t) : t();
}
function Rc(e, t, n, r, o, i, s, a) {
  let c = [],
    l = 0,
    u = 0,
    d = !1,
    p = () => {
      d && !c.length && !l && t.complete();
    },
    f = (g) => (l < r ? h(g) : c.push(g)),
    h = (g) => {
      (i && t.next(g), l++);
      let R = !1;
      S$1(n(g, u++)).subscribe(
        _$1(
          t,
          (D) => {
            (o?.(D), i ? f(D) : t.next(D));
          },
          () => {
            R = !0;
          },
          void 0,
          () => {
            if (R)
              try {
                for (l--; c.length && l < r;) {
                  let D = c.shift();
                  s ? ee$1(t, s, () => h(D)) : h(D);
                }
                p();
              } catch (D) {
                t.error(D);
              }
          },
        ),
      );
    };
  return (
    e.subscribe(
      _$1(t, f, () => {
        ((d = !0), p());
      }),
    ),
    () => {
      a?.();
    }
  );
}
function fe$2(e, t, n = Infinity) {
  return v(t)
    ? fe$2((r, o) => ke$2((i, s) => t(r, i, o, s))(S$1(e(r, o))), n)
    : (typeof t == `number` && (n = t), C$1((r, o) => Rc(r, o, e, n)));
}
function Br$1(e = Infinity) {
  return fe$2(ne, e);
}
function kc() {
  return Br$1(1);
}
function Wt$2(...e) {
  return kc()(Ee$2(e, Ie$2(e)));
}
function Gp(e) {
  return new b((t) => {
    S$1(e()).subscribe(t);
  });
}
function zp(...e) {
  let t = Mr$1(e),
    { args: n, keys: r } = Vr$2(e),
    o = new b((i) => {
      let { length: s } = n;
      if (!s) {
        i.complete();
        return;
      }
      let a = new Array(s),
        c = s,
        l = s;
      for (let u = 0; u < s; u++) {
        let d = !1;
        S$1(n[u]).subscribe(
          _$1(
            i,
            (p) => {
              (d || ((d = !0), l--), (a[u] = p));
            },
            () => c--,
            void 0,
            () => {
              (!c || !d) && (l || i.next(r ? Hr$1(r, a) : a), i.complete());
            },
          ),
        );
      }
    });
  return t ? o.pipe(Ut(t)) : o;
}
var Qp = [`addListener`, `removeListener`];
var Zp = [`addEventListener`, `removeEventListener`];
var Yp = [`on`, `off`];
function _i$1(e, t, n, r) {
  if ((v(n) && ((r = n), (n = void 0)), r)) return _i$1(e, t, n).pipe(Ut(r));
  let [o, i] = Xp(e) ? Zp.map((s) => (a) => e[s](t, a, n)) : Kp(e) ? Qp.map(Lc(e, t)) : Jp(e) ? Yp.map(Lc(e, t)) : [];
  if (!o && $t$1(e)) return fe$2((s) => _i$1(s, t, n))(S$1(e));
  if (!o) throw new TypeError(`Invalid event target`);
  return new b((s) => {
    let a = (...c) => s.next(1 < c.length ? c : c[0]);
    return (o(a), () => i(a));
  });
}
function Lc(e, t) {
  return (n) => (r) => e[n](t, r);
}
function Kp(e) {
  return v(e.addListener) && v(e.removeListener);
}
function Jp(e) {
  return v(e.on) && v(e.off);
}
function Xp(e) {
  return v(e.addEventListener) && v(e.removeEventListener);
}
function $r$1(e = 0, t, n = vc) {
  let r = -1;
  return (
    t != null && (_r$1(t) ? (n = t) : (r = t)),
    new b((o) => {
      let i = Ac(e) ? +e - n.now() : e;
      i < 0 && (i = 0);
      let s = 0;
      return n.schedule(function () {
        o.closed || (o.next(s++), 0 <= r ? this.schedule(void 0, r) : o.complete());
      }, i);
    })
  );
}
function eh(...e) {
  let t = Ie$2(e),
    n = Ic(e, Infinity),
    r = e;
  return r.length ? (r.length === 1 ? S$1(r[0]) : Br$1(n)(Ee$2(r, t))) : ut$2;
}
function qt$2(e, t) {
  return C$1((n, r) => {
    let o = 0;
    n.subscribe(_$1(r, (i) => e.call(t, i, o++) && r.next(i)));
  });
}
function Pc(e) {
  return C$1((t, n) => {
    let r = !1,
      o = null,
      i = null,
      s = !1,
      a = () => {
        if ((i?.unsubscribe(), (i = null), r)) {
          r = !1;
          let l = o;
          ((o = null), n.next(l));
        }
        s && n.complete();
      },
      c = () => {
        ((i = null), s && n.complete());
      };
    t.subscribe(
      _$1(
        n,
        (l) => {
          ((r = !0), (o = l), i || S$1(e(l)).subscribe((i = _$1(n, a, c))));
        },
        () => {
          ((s = !0), (!r || !i || i.closed) && n.complete());
        },
      ),
    );
  });
}
function th(e, t = lt$2) {
  return Pc(() => $r$1(e, t));
}
function Fc(e) {
  return C$1((t, n) => {
    let r = null,
      o = !1,
      i;
    ((r = t.subscribe(
      _$1(n, void 0, void 0, (s) => {
        ((i = S$1(e(s, Fc(e)(t)))), r ? (r.unsubscribe(), (r = null), i.subscribe(n)) : (o = !0));
      }),
    )),
      o && (r.unsubscribe(), (r = null), i.subscribe(n)));
  });
}
function nh(e, t) {
  return v(t) ? fe$2(e, t, 1) : fe$2(e, 1);
}
function jc(e, t = lt$2) {
  return C$1((n, r) => {
    let o = null,
      i = null,
      s = null,
      a = () => {
        if (o) {
          (o.unsubscribe(), (o = null));
          let l = i;
          ((i = null), r.next(l));
        }
      };
    function c() {
      let l = s + e,
        u = t.now();
      if (u < l) {
        ((o = this.schedule(void 0, l - u)), r.add(o));
        return;
      }
      a();
    }
    n.subscribe(
      _$1(
        r,
        (l) => {
          ((i = l), (s = t.now()), o || ((o = t.schedule(c, e)), r.add(o)));
        },
        () => {
          (a(), r.complete());
        },
        void 0,
        () => {
          i = o = null;
        },
      ),
    );
  });
}
function Vc(e) {
  return C$1((t, n) => {
    let r = !1;
    t.subscribe(
      _$1(
        n,
        (o) => {
          ((r = !0), n.next(o));
        },
        () => {
          (r || n.next(e), n.complete());
        },
      ),
    );
  });
}
function ft$2(e) {
  return e <= 0
    ? () => ut$2
    : C$1((t, n) => {
        let r = 0;
        t.subscribe(
          _$1(n, (o) => {
            ++r <= e && (n.next(o), e <= r && n.complete());
          }),
        );
      });
}
function Hc() {
  return C$1((e, t) => {
    e.subscribe(_$1(t, st$2));
  });
}
function Bc(e) {
  return ke$2(() => e);
}
function Mi$1(e, t) {
  return t ? (n) => Wt$2(t.pipe(ft$2(1), Hc()), n.pipe(Mi$1(e))) : fe$2((n, r) => S$1(e(n, r)).pipe(ft$2(1), Bc(n)));
}
function rh(e, t = lt$2) {
  let n = $r$1(e, t);
  return Mi$1(() => n);
}
function oh(e, t = ne) {
  return (
    (e = e ?? ih),
    C$1((n, r) => {
      let o,
        i = !0;
      n.subscribe(
        _$1(r, (s) => {
          let a = t(s);
          (i || !e(o, a)) && ((i = !1), (o = a), r.next(s));
        }),
      );
    })
  );
}
function ih(e, t) {
  return e === t;
}
function $c(e = sh) {
  return C$1((t, n) => {
    let r = !1;
    t.subscribe(
      _$1(
        n,
        (o) => {
          ((r = !0), n.next(o));
        },
        () => (r ? n.complete() : n.error(e())),
      ),
    );
  });
}
function sh() {
  return new Dn$2();
}
function ah(e) {
  return C$1((t, n) => {
    try {
      t.subscribe(n);
    } finally {
      n.add(e);
    }
  });
}
function ch(e, t) {
  let n = arguments.length >= 2;
  return (r) => r.pipe(e ? qt$2((o, i) => e(o, i, r)) : ne, ft$2(1), n ? Vc(t) : $c(() => new Dn$2()));
}
function lh(e) {
  return e <= 0
    ? () => ut$2
    : C$1((t, n) => {
        let r = [];
        t.subscribe(
          _$1(
            n,
            (o) => {
              (r.push(o), e < r.length && r.shift());
            },
            () => {
              for (let o of r) n.next(o);
              n.complete();
            },
            void 0,
            () => {
              r = null;
            },
          ),
        );
      });
}
function uh(e = {}) {
  let {
    connector: t = () => new Z$2(),
    resetOnError: n = !0,
    resetOnComplete: r = !0,
    resetOnRefCountZero: o = !0,
  } = e;
  return (i) => {
    let s,
      a,
      c,
      l = 0,
      u = !1,
      d = !1,
      p = () => {
        (a?.unsubscribe(), (a = void 0));
      },
      f = () => {
        (p(), (s = c = void 0), (u = d = !1));
      },
      h = () => {
        let g = s;
        (f(), g?.unsubscribe());
      };
    return C$1((g, R) => {
      (l++, !d && !u && p());
      let D = (c = c ?? t());
      (R.add(() => {
        (l--, l === 0 && !d && !u && (a = Ni$1(h, o)));
      }),
        D.subscribe(R),
        !s &&
          l > 0 &&
          ((s = new Re({
            next: (ue) => D.next(ue),
            error: (ue) => {
              ((d = !0), p(), (a = Ni$1(f, n, ue)), D.error(ue));
            },
            complete: () => {
              ((u = !0), p(), (a = Ni$1(f, r)), D.complete());
            },
          })),
          S$1(g).subscribe(s)));
    })(i);
  };
}
function Ni$1(e, t, ...n) {
  if (t === !0) {
    e();
    return;
  }
  if (t === !1) return;
  let r = new Re({
    next: () => {
      (r.unsubscribe(), e());
    },
  });
  return S$1(t(...n)).subscribe(r);
}
function dh(e) {
  return qt$2((t, n) => e <= n);
}
function fh(...e) {
  let t = Ie$2(e);
  return C$1((n, r) => {
    (t ? Wt$2(e, n, t) : Wt$2(e, n)).subscribe(r);
  });
}
function ph(e, t) {
  return C$1((n, r) => {
    let o = null,
      i = 0,
      s = !1,
      a = () => s && !o && r.complete();
    n.subscribe(
      _$1(
        r,
        (c) => {
          o?.unsubscribe();
          let l = 0,
            u = i++;
          S$1(e(c, u)).subscribe(
            (o = _$1(
              r,
              (d) => r.next(t ? t(c, d, u, l++) : d),
              () => {
                ((o = null), a());
              },
            )),
          );
        },
        () => {
          ((s = !0), a());
        },
      ),
    );
  });
}
function hh(e) {
  return C$1((t, n) => {
    (S$1(e).subscribe(_$1(n, () => n.complete(), st$2)), !n.closed && t.subscribe(n));
  });
}
function gh(e, t, n) {
  let r = v(e) || t || n ? { next: e, error: t, complete: n } : e;
  return r
    ? C$1((o, i) => {
        var s;
        (s = r.subscribe) === null || s === void 0 || s.call(r);
        let a = !0;
        o.subscribe(
          _$1(
            i,
            (c) => {
              var l;
              ((l = r.next) === null || l === void 0 || l.call(r, c), i.next(c));
            },
            () => {
              var c;
              ((a = !1), (c = r.complete) === null || c === void 0 || c.call(r), i.complete());
            },
            (c) => {
              var l;
              ((a = !1), (l = r.error) === null || l === void 0 || l.call(r, c), i.error(c));
            },
            () => {
              var c, l;
              (a && ((c = r.unsubscribe) === null || c === void 0 || c.call(r)),
                (l = r.finalize) === null || l === void 0 || l.call(r));
            },
          ),
        );
      })
    : ne;
}
var Zr$2 = `https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss`;
var M$1 = class extends Error {
  code;
  constructor(t, n) {
    (super(Bi$1(t, n)), (this.code = t));
  }
};
function mh(e) {
  return `NG0${Math.abs(e)}`;
}
function Bi$1(e, t) {
  return `${mh(e)}${t ? `: ` + t : ``}`;
}
function x$1(e) {
  for (let t in e) if (e[t] === x$1) return t;
  throw Error(``);
}
function zc(e, t) {
  for (let n in t) Object.hasOwn(t, n) && !Object.hasOwn(e, n) && (e[n] = t[n]);
}
function Mn$2(e) {
  if (typeof e == `string`) return e;
  if (Array.isArray(e)) return `[${e.map(Mn$2).join(`, `)}]`;
  if (e == null) return `` + e;
  let t = e.overriddenName || e.name;
  if (t) return `${t}`;
  let n = e.toString();
  if (n == null) return `` + n;
  let r = n.indexOf(`
`);
  return r >= 0 ? n.slice(0, r) : n;
}
function Yr$2(e, t) {
  return e ? (t ? `${e} ${t}` : e) : t || ``;
}
var yh = x$1({ __forward_ref__: x$1 });
function Kr$2(e) {
  return ((e.__forward_ref__ = Kr$2), e);
}
function V$2(e) {
  return $i$1(e) ? e() : e;
}
function $i$1(e) {
  return typeof e == `function` && Object.hasOwn(e, yh) && e.__forward_ref__ === Kr$2;
}
function se$1(e) {
  return { token: e.token, providedIn: e.providedIn || null, factory: e.factory, value: void 0 };
}
function Qc(e) {
  return { providers: e.providers || [], imports: e.imports || [] };
}
function Nn$2(e) {
  return Ih(e, Jr$1);
}
function vh(e) {
  return Nn$2(e) !== null;
}
function Ih(e, t) {
  return (Object.hasOwn(e, t) && e[t]) || null;
}
function Eh(e) {
  return (e?.[Jr$1] ?? null) || null;
}
function xi$1(e) {
  return e && Object.hasOwn(e, Wr$2) ? e[Wr$2] : null;
}
var Jr$1 = x$1({ ɵprov: x$1 });
var Wr$2 = x$1({ ɵinj: x$1 });
var A$1 = class {
  _desc;
  ngMetadataName = `InjectionToken`;
  ɵprov;
  constructor(t, n) {
    ((this._desc = t),
      (this.ɵprov = void 0),
      typeof n == `number`
        ? (this.__NG_ELEMENT_ID__ = n)
        : n !== void 0 && (this.ɵprov = se$1({ token: this, providedIn: n.providedIn || `root`, factory: n.factory })));
  }
  get multi() {
    return this;
  }
  toString() {
    return `InjectionToken ${this._desc}`;
  }
};
function Ui$1(e) {
  return e && !!e.ɵproviders;
}
var Sn$2 = x$1({ ɵcmp: x$1 });
var xn$2 = x$1({ ɵdir: x$1 });
var Wi$1 = x$1({ ɵpipe: x$1 });
var qi$1 = x$1({ ɵmod: x$1 });
var wn$2 = x$1({ ɵfac: x$1 });
var vt$1 = x$1({ __NG_ELEMENT_ID__: x$1 });
var Uc = x$1({ __NG_ENV_ID__: x$1 });
function Zc(e) {
  return (eo$1(e, `@NgModule`), e[qi$1] || null);
}
function Ge(e) {
  return (eo$1(e, `@Component`), e[Sn$2] || null);
}
function Xr$2(e) {
  return (eo$1(e, `@Directive`), e[xn$2] || null);
}
function Yc(e) {
  return (eo$1(e, `@Pipe`), e[Wi$1] || null);
}
function eo$1(e, t) {
  if (e == null) throw new M$1(-919, !1);
}
function An$2(e) {
  return typeof e == `string` ? e : e == null ? `` : String(e);
}
var Kc = x$1({ ngErrorCode: x$1 });
var Dh = x$1({ ngErrorMessage: x$1 });
var Th = x$1({ ngTokenPath: x$1 });
function Gi$1(e, t) {
  return Jc(``, -200, t);
}
function to$1(e, t) {
  throw new M$1(-201, !1);
}
function Jc(e, t, n) {
  let r = new M$1(t, e);
  return ((r[Kc] = t), (r[Dh] = e), n && (r[Th] = n), r);
}
function wh(e) {
  return e[Kc];
}
var Ai$1;
function Xc() {
  return Ai$1;
}
function K$1(e) {
  let t = Ai$1;
  return ((Ai$1 = e), t);
}
function zi$1(e, t, n) {
  let r = Nn$2(e);
  if (r && r.providedIn == `root`) return r.value === void 0 ? (r.value = r.factory()) : r.value;
  if (n & 8) return null;
  if (t !== void 0) return t;
  to$1(e, ``);
}
var ze$1 = globalThis;
var pt$2 = {};
var bh = `__NG_DI_FLAG__`;
var Oi$1 = class {
  injector;
  constructor(t) {
    this.injector = t;
  }
  retrieve(t, n) {
    let r = ht$2(n) || 0;
    try {
      return this.injector.get(t, r & 8 ? null : pt$2, r);
    } catch (o) {
      if (Ft$1(o)) return o;
      throw o;
    }
  }
};
function _h(e, t = 0) {
  let n = yr$1();
  if (n === void 0) throw new M$1(-203, !1);
  if (n === null) return zi$1(e, void 0, t);
  {
    let r = Mh(t),
      o = n.retrieve(e, r);
    if (Ft$1(o)) {
      if (r.optional) return null;
      throw o;
    }
    return o;
  }
}
function De$2(e, t = 0) {
  return (Xc() || _h)(V$2(e), t);
}
function w(e, t) {
  return De$2(e, ht$2(t));
}
function ht$2(e) {
  return typeof e > `u` || typeof e == `number`
    ? e
    : 0 | (e.optional && 8) | (e.host && 1) | (e.self && 2) | (e.skipSelf && 4);
}
function Mh(e) {
  return { optional: !!(e & 8), host: !!(e & 1), self: !!(e & 2), skipSelf: !!(e & 4) };
}
function Ri$1(e) {
  let t = [];
  for (let n = 0; n < e.length; n++) {
    let r = V$2(e[n]);
    if (Array.isArray(r)) {
      if (r.length === 0) throw new M$1(900, !1);
      let o,
        i = 0;
      for (let s = 0; s < r.length; s++) {
        let a = r[s],
          c = Nh(a);
        typeof c == `number` ? (c === -1 ? (o = a.token) : (i |= c)) : (o = a);
      }
      t.push(De$2(o, i));
    } else t.push(De$2(r));
  }
  return t;
}
function Nh(e) {
  return e[bh];
}
function qe$1(e, t) {
  return Object.hasOwn(e, wn$2) ? e[wn$2] : null;
}
function el(e, t, n) {
  if (e.length !== t.length) return !1;
  for (let r = 0; r < e.length; r++) {
    let o = e[r],
      i = t[r];
    if ((n && ((o = n(o)), (i = n(i))), i !== o)) return !1;
  }
  return !0;
}
function tl(e) {
  return e.flat(Number.POSITIVE_INFINITY);
}
function no$1(e, t) {
  e.forEach((n) => (Array.isArray(n) ? no$1(n, t) : t(n)));
}
function Qi$1(e, t, n) {
  t >= e.length ? e.push(n) : e.splice(t, 0, n);
}
function On$2(e, t) {
  return t >= e.length - 1 ? e.pop() : e.splice(t, 1)[0];
}
function nl(e, t) {
  let n = [];
  for (let r = 0; r < e; r++) n.push(t);
  return n;
}
function rl(e, t, n, r) {
  let o = e.length;
  if (o == t) e.push(n, r);
  else if (o === 1) (e.push(r, e[0]), (e[0] = n));
  else {
    for (o--, e.push(e[o - 1], e[o]); o > t;) ((e[o] = e[o - 2]), o--);
    ((e[t] = n), (e[t + 1] = r));
  }
}
function Rn$2(e, t, n) {
  let r = Qt$2(e, t);
  return (r >= 0 ? (e[r | 1] = n) : ((r = ~r), rl(e, r, t, n)), r);
}
function ro$1(e, t) {
  let n = Qt$2(e, t);
  if (n >= 0) return e[n | 1];
}
function Qt$2(e, t) {
  return Sh(e, t, 1);
}
function Sh(e, t, n) {
  let r = 0,
    o = e.length >> n;
  for (; o !== r;) {
    let i = r + ((o - r) >> 1),
      s = e[i << n];
    if (t === s) return i << n;
    s > t ? (o = i) : (r = i + 1);
  }
  return ~(o << n);
}
var Qe$2 = {};
var J$1 = [];
var Zt$2 = new A$1(``);
var kn$2 = new A$1(``, -1);
var Zi$1 = new A$1(``);
var zt$2 = class {
  get(t, n = pt$2) {
    if (n === pt$2) {
      let o = Jc(``, -201);
      throw ((o.name = `ɵNotFound`), o);
    }
    return n;
  }
};
function oo$1(e) {
  return { ɵproviders: e };
}
function ol(e) {
  return oo$1([{ provide: Zt$2, multi: !0, useValue: e }]);
}
function il(...e) {
  return { ɵproviders: Yi$1(!0, e), ɵfromNgModule: !0 };
}
function Yi$1(e, ...t) {
  let n = [],
    r = new Set(),
    o,
    i = (s) => {
      n.push(s);
    };
  return (
    no$1(t, (s) => {
      let a = s;
      qr$1(a, i, [], r) && ((o ||= []), o.push(a));
    }),
    o !== void 0 && sl(o, i),
    n
  );
}
function sl(e, t) {
  for (let n = 0; n < e.length; n++) {
    let { ngModule: r, providers: o } = e[n];
    Ki$1(o, (i) => {
      t(i, r);
    });
  }
}
function qr$1(e, t, n, r) {
  if (((e = V$2(e)), !e)) return !1;
  let o = null,
    i = xi$1(e),
    s = !i && Ge(e);
  if (!i && !s) {
    let c = e.ngModule;
    if (((i = xi$1(c)), i)) o = c;
    else return !1;
  } else {
    if (s && !s.standalone) return !1;
    o = e;
  }
  let a = r.has(o);
  if (s) {
    if (a) return !1;
    if ((r.add(o), s.dependencies)) {
      let c = typeof s.dependencies == `function` ? s.dependencies() : s.dependencies;
      for (let l of c) qr$1(l, t, n, r);
    }
  } else if (i) {
    if (i.imports != null && !a) {
      r.add(o);
      let l;
      (no$1(i.imports, (u) => {
        qr$1(u, t, n, r) && ((l ||= []), l.push(u));
      }),
        l !== void 0 && sl(l, t));
    }
    if (!a) {
      let l = qe$1(o) || (() => new o());
      (t({ provide: o, useFactory: l, deps: J$1 }, o),
        t({ provide: Zi$1, useValue: o, multi: !0 }, o),
        t({ provide: Zt$2, useValue: () => De$2(o), multi: !0 }, o));
    }
    let c = i.providers;
    if (c != null && !a) {
      let l = e;
      Ki$1(c, (u) => {
        t(u, l);
      });
    }
  } else return !1;
  return o !== e && e.providers !== void 0;
}
function Ki$1(e, t) {
  for (let n of e) (Ui$1(n) && (n = n.ɵproviders), Array.isArray(n) ? Ki$1(n, t) : t(n));
}
var xh = x$1({ provide: String, useValue: x$1 });
function al(e) {
  return e !== null && typeof e == `object` && xh in e;
}
function Ah(e) {
  return !!(e && e.useExisting);
}
function Oh(e) {
  return !!(e && e.useFactory);
}
function gt$2(e) {
  return typeof e == `function`;
}
function cl(e) {
  return !!e.useClass;
}
var Ji$1 = new A$1(``);
var Ur$1 = {};
var Wc = {};
var Si$1;
function Yt$2() {
  return (Si$1 === void 0 && (Si$1 = new zt$2()), Si$1);
}
var ie$1 = class {};
var mt$2 = class extends ie$1 {
  parent;
  source;
  scopes;
  records = new Map();
  _ngOnDestroyHooks = new Set();
  _onDestroyHooks = [];
  get destroyed() {
    return this._destroyed;
  }
  _destroyed = !1;
  injectorDefTypes;
  constructor(t, n, r, o) {
    (super(),
      (this.parent = n),
      (this.source = r),
      (this.scopes = o),
      Li$1(t, (s) => this.processProvider(s)),
      this.records.set(kn$2, Gt$2(void 0, this)),
      o.has(`environment`) && this.records.set(ie$1, Gt$2(void 0, this)));
    let i = this.records.get(Ji$1);
    (i != null && typeof i.value == `string` && this.scopes.add(i.value),
      (this.injectorDefTypes = new Set(this.get(Zi$1, J$1, { self: !0 }))));
  }
  retrieve(t, n) {
    let r = ht$2(n) || 0;
    try {
      return this.get(t, pt$2, r);
    } catch (o) {
      if (Ft$1(o)) return o;
      throw o;
    }
  }
  destroy() {
    (Tn$2(this), (this._destroyed = !0));
    let t = y$1(null);
    try {
      for (let r of this._ngOnDestroyHooks) r.ngOnDestroy();
      let n = this._onDestroyHooks;
      this._onDestroyHooks = [];
      for (let r of n) r();
    } finally {
      (this.records.clear(), this._ngOnDestroyHooks.clear(), this.injectorDefTypes.clear(), y$1(t));
    }
  }
  onDestroy(t) {
    return (Tn$2(this), this._onDestroyHooks.push(t), () => this.removeOnDestroy(t));
  }
  runInContext(t) {
    Tn$2(this);
    let n = ve$1(this),
      r = K$1(void 0);
    try {
      return t();
    } finally {
      (ve$1(n), K$1(r));
    }
  }
  get(t, n = pt$2, r) {
    if ((Tn$2(this), Object.hasOwn(t, Uc))) return t[Uc](this);
    let o = ht$2(r),
      s = ve$1(this),
      a = K$1(void 0);
    try {
      if (!(o & 4)) {
        let l = this.records.get(t);
        if (l === void 0) {
          let u = Fh(t) && Nn$2(t);
          (u && this.injectableDefInScope(u) ? (l = Gt$2(ki$1(t), Ur$1)) : (l = null), this.records.set(t, l));
        }
        if (l != null) return this.hydrate(t, l, o);
      }
      let c = o & 2 ? Yt$2() : this.parent;
      return ((n = o & 8 && n === pt$2 ? null : n), c.get(t, n));
    } catch (c) {
      let l = wh(c);
      throw l === -200 || l === -201 ? new M$1(l, null) : c;
    } finally {
      (K$1(a), ve$1(s));
    }
  }
  resolveInjectorInitializers() {
    let t = y$1(null),
      n = ve$1(this),
      r = K$1(void 0);
    try {
      let i = this.get(Zt$2, J$1, { self: !0 });
      for (let s of i) s();
    } finally {
      (ve$1(n), K$1(r), y$1(t));
    }
  }
  toString() {
    return `R3Injector[...]`;
  }
  processProvider(t) {
    t = V$2(t);
    let n = gt$2(t) ? t : V$2(t && t.provide),
      r = kh(t);
    if (!gt$2(t) && t.multi === !0) {
      let o = this.records.get(n);
      (o || ((o = Gt$2(void 0, Ur$1, !0)), (o.factory = () => Ri$1(o.multi)), this.records.set(n, o)),
        (n = t),
        o.multi.push(t));
    }
    this.records.set(n, r);
  }
  hydrate(t, n, r) {
    let o = y$1(null);
    try {
      if (n.value === Wc) throw Gi$1(``);
      return (
        n.value === Ur$1 && ((n.value = Wc), (n.value = n.factory(void 0, r))),
        typeof n.value == `object` && n.value && Ph(n.value) && this._ngOnDestroyHooks.add(n.value),
        n.value
      );
    } finally {
      y$1(o);
    }
  }
  injectableDefInScope(t) {
    if (!t.providedIn) return !1;
    let n = V$2(t.providedIn);
    return typeof n == `string` ? n === `any` || this.scopes.has(n) : this.injectorDefTypes.has(n);
  }
  removeOnDestroy(t) {
    let n = this._onDestroyHooks.indexOf(t);
    n !== -1 && this._onDestroyHooks.splice(n, 1);
  }
};
function ki$1(e) {
  let t = Nn$2(e),
    n = t !== null ? t.factory : qe$1(e);
  if (n !== null) return n;
  if (e instanceof A$1) throw new M$1(-204, !1);
  if (e instanceof Function) return Rh(e);
  throw new M$1(-204, !1);
}
function Rh(e) {
  if (e.length > 0) throw new M$1(-204, !1);
  let n = Eh(e);
  return n !== null ? () => n.factory(e) : () => new e();
}
function kh(e) {
  if (al(e)) return Gt$2(void 0, e.useValue);
  return Gt$2(Xi$1(e), Ur$1);
}
function Xi$1(e, t, n) {
  let r;
  if (gt$2(e)) {
    let o = V$2(e);
    return qe$1(o) || ki$1(o);
  } else if (al(e)) r = () => V$2(e.useValue);
  else if (Oh(e)) r = () => e.useFactory(...Ri$1(e.deps || []));
  else if (Ah(e)) r = (o, i) => De$2(V$2(e.useExisting), i !== void 0 && i & 8 ? 8 : void 0);
  else {
    let o = V$2(e && (e.useClass || e.provide));
    if (Lh(e)) r = () => new o(...Ri$1(e.deps));
    else return qe$1(o) || ki$1(o);
  }
  return r;
}
function Tn$2(e) {
  if (e.destroyed) throw new M$1(-205, !1);
}
function Gt$2(e, t, n = !1) {
  return { factory: e, value: t, multi: n ? [] : void 0 };
}
function Lh(e) {
  return !!e.deps;
}
function Ph(e) {
  return e !== null && typeof e == `object` && typeof e.ngOnDestroy == `function`;
}
function Fh(e) {
  return typeof e == `function` || (typeof e == `object` && e.ngMetadataName === `InjectionToken`);
}
function Li$1(e, t) {
  for (let n of e) Array.isArray(n) ? Li$1(n, t) : n && Ui$1(n) ? Li$1(n.ɵproviders, t) : t(n);
}
function io$1(e, t) {
  let n;
  e instanceof mt$2 ? (Tn$2(e), (n = e)) : (n = new Oi$1(e));
  let o = ve$1(n),
    i = K$1(void 0);
  try {
    return t();
  } finally {
    (ve$1(o), K$1(i));
  }
}
function ll() {
  return Xc() !== void 0 || yr$1() != null;
}
var pe$2 = 0;
var m$2 = 1;
var I$1 = 2;
var H = 3;
var ae$1 = 4;
var G$2 = 5;
var It = 6;
var Kt$1 = 7;
var j$1 = 8;
var _e$1 = 9;
var Me$2 = 10;
var k$1 = 11;
var Jt$2 = 12;
var es = 13;
var Ze$1 = 14;
var X$1 = 15;
var Ye$1 = 16;
var Et$1 = 17;
var Ne$2 = 18;
var Se$1 = 19;
var ts = 20;
var Pe$2 = 21;
var so$1 = 22;
var Fe = 23;
var re = 24;
var Dt$1 = 25;
var xe$2 = 26;
var L = 27;
var ul = 1;
var ns = 6;
var Tt = 7;
var Ln$2 = 8;
var wt = 9;
var P$2 = 10;
function Ve$1(e) {
  return Array.isArray(e) && typeof e[ul] == `object`;
}
function ce$2(e) {
  return Array.isArray(e) && e[ul] === !0;
}
function rs(e) {
  return (e.flags & 4) !== 0;
}
function He$1(e) {
  return e.componentOffset > -1;
}
function Pn$2(e) {
  return (e.flags & 1) === 1;
}
function he$2(e) {
  return !!e.template;
}
function Xt$2(e) {
  return (e[I$1] & 512) !== 0;
}
function Ct(e) {
  return (e[I$1] & 256) === 256;
}
var os = (function (e) {
  return (
    (e[(e.NONE = 0)] = `NONE`),
    (e[(e.HTML = 1)] = `HTML`),
    (e[(e.STYLE = 2)] = `STYLE`),
    (e[(e.SCRIPT = 3)] = `SCRIPT`),
    (e[(e.URL = 4)] = `URL`),
    (e[(e.RESOURCE_URL = 5)] = `RESOURCE_URL`),
    (e[(e.ATTRIBUTE_NO_BINDING = 6)] = `ATTRIBUTE_NO_BINDING`),
    e
  );
})(os || {});
var is = `svg`;
var dl = `math`;
function z$1(e) {
  for (; Array.isArray(e);) e = e[pe$2];
  return e;
}
function ss(e, t) {
  return z$1(t[e]);
}
function ge$2(e, t) {
  return z$1(t[e.index]);
}
function ao$1(e, t) {
  return e.data[t];
}
function co$1(e, t) {
  return e[t];
}
function as(e, t, n, r) {
  (n >= e.data.length && ((e.data[n] = null), (e.blueprint[n] = null)), (t[n] = r));
}
function le$2(e, t) {
  let n = t[e];
  return Ve$1(n) ? n : n[pe$2];
}
function fl(e) {
  return (e[I$1] & 4) === 4;
}
function lo$1(e) {
  return (e[I$1] & 128) === 128;
}
function pl(e) {
  return ce$2(e[H]);
}
function oe$1(e, t) {
  return t == null ? null : e[t];
}
function cs(e) {
  e[Et$1] = 0;
}
function ls(e) {
  e[I$1] & 1024 || ((e[I$1] |= 1024), lo$1(e) && bt(e));
}
function hl(e, t) {
  for (; e > 0;) ((t = t[Ze$1]), e--);
  return t;
}
function Fn$2(e) {
  return !!(e[I$1] & 9216 || e[re]?.dirty);
}
function uo$1(e) {
  (e[Me$2].changeDetectionScheduler?.notify(8), e[I$1] & 64 && (e[I$1] |= 1024), Fn$2(e) && bt(e));
}
function bt(e) {
  e[Me$2].changeDetectionScheduler?.notify(0);
  let t = je$2(e);
  for (; t !== null && !(t[I$1] & 8192 || ((t[I$1] |= 8192), !lo$1(t)));) t = je$2(t);
}
function fo$1(e, t) {
  if (Ct(e)) throw new M$1(911, !1);
  (e[Pe$2] === null && (e[Pe$2] = []), e[Pe$2].push(t));
}
function gl(e, t) {
  if (e[Pe$2] === null) return;
  let n = e[Pe$2].indexOf(t);
  n !== -1 && e[Pe$2].splice(n, 1);
}
function je$2(e) {
  let t = e[H];
  return ce$2(t) ? t[H] : t;
}
function us(e) {
  return (e[Kt$1] ??= []);
}
function ds(e) {
  return (e.cleanup ??= []);
}
function ml(e, t, n, r) {
  let o = us(t);
  (o.push(n), e.firstCreatePass && ds(e).push(r, o.length - 1));
}
var T = { lFrame: xl(null), bindingsEnabled: !0, skipHydrationRootTNode: null };
var Pi$1 = !1;
function yl() {
  return T.lFrame.elementDepthCount;
}
function vl() {
  T.lFrame.elementDepthCount++;
}
function fs() {
  T.lFrame.elementDepthCount--;
}
function ps() {
  return T.bindingsEnabled;
}
function hs() {
  return T.skipHydrationRootTNode !== null;
}
function gs(e) {
  return T.skipHydrationRootTNode === e;
}
function ms() {
  T.skipHydrationRootTNode = null;
}
function E$1() {
  return T.lFrame.lView;
}
function F$2() {
  return T.lFrame.tView;
}
function Il(e) {
  return ((T.lFrame.contextLView = e), e[j$1]);
}
function El(e) {
  return ((T.lFrame.contextLView = null), e);
}
function Q() {
  let e = ys();
  for (; e !== null && e.type === 64;) e = e.parent;
  return e;
}
function ys() {
  return T.lFrame.currentTNode;
}
function Dl() {
  let e = T.lFrame,
    t = e.currentTNode;
  return e.isParent ? t : t.parent;
}
function en$2(e, t) {
  let n = T.lFrame;
  ((n.currentTNode = e), (n.isParent = t));
}
function vs() {
  return T.lFrame.isParent;
}
function Is() {
  T.lFrame.isParent = !1;
}
function Tl() {
  return T.lFrame.contextLView;
}
function Es() {
  return Pi$1;
}
function Cn$2(e) {
  let t = Pi$1;
  return ((Pi$1 = e), t);
}
function Ds() {
  let e = T.lFrame,
    t = e.bindingRootIndex;
  return (t === -1 && (t = e.bindingRootIndex = e.tView.bindingStartIndex), t);
}
function wl() {
  return T.lFrame.bindingIndex;
}
function Cl(e) {
  return (T.lFrame.bindingIndex = e);
}
function _t() {
  return T.lFrame.bindingIndex++;
}
function po$1(e) {
  let t = T.lFrame,
    n = t.bindingIndex;
  return ((t.bindingIndex = t.bindingIndex + e), n);
}
function bl() {
  return T.lFrame.inI18n;
}
function _l(e, t) {
  let n = T.lFrame;
  ((n.bindingIndex = n.bindingRootIndex = e), ho$1(t));
}
function Ml() {
  return T.lFrame.currentDirectiveIndex;
}
function ho$1(e) {
  T.lFrame.currentDirectiveIndex = e;
}
function Nl(e) {
  let t = T.lFrame.currentDirectiveIndex;
  return t === -1 ? null : e[t];
}
function Ts() {
  return T.lFrame.currentQueryIndex;
}
function go$1(e) {
  T.lFrame.currentQueryIndex = e;
}
function jh(e) {
  let t = e[m$2];
  return t.type === 2 ? t.declTNode : t.type === 1 ? e[G$2] : null;
}
function ws(e, t, n) {
  if (n & 4) {
    let o = t,
      i = e;
    for (; (o = o.parent), o === null && !(n & 1);)
      if (((o = jh(i)), o === null || ((i = i[Ze$1]), o.type & 10))) break;
    if (o === null) return !1;
    ((t = o), (e = i));
  }
  let r = (T.lFrame = Sl());
  return ((r.currentTNode = t), (r.lView = e), !0);
}
function mo$1(e) {
  let t = Sl(),
    n = e[m$2];
  ((T.lFrame = t),
    (t.currentTNode = n.firstChild),
    (t.lView = e),
    (t.tView = n),
    (t.contextLView = e),
    (t.bindingIndex = n.bindingStartIndex),
    (t.inI18n = !1));
}
function Sl() {
  let e = T.lFrame,
    t = e === null ? null : e.child;
  return t === null ? xl(e) : t;
}
function xl(e) {
  let t = {
    currentTNode: null,
    isParent: !0,
    lView: null,
    tView: null,
    selectedIndex: -1,
    contextLView: null,
    elementDepthCount: 0,
    currentNamespace: null,
    currentDirectiveIndex: -1,
    bindingRootIndex: -1,
    bindingIndex: -1,
    currentQueryIndex: 0,
    parent: e,
    child: null,
    inI18n: !1,
  };
  return (e !== null && (e.child = t), t);
}
function Al() {
  let e = T.lFrame;
  return ((T.lFrame = e.parent), (e.currentTNode = null), (e.lView = null), e);
}
var Cs = Al;
function yo$1() {
  let e = Al();
  ((e.isParent = !0),
    (e.tView = null),
    (e.selectedIndex = -1),
    (e.contextLView = null),
    (e.elementDepthCount = 0),
    (e.currentDirectiveIndex = -1),
    (e.currentNamespace = null),
    (e.bindingRootIndex = -1),
    (e.bindingIndex = -1),
    (e.currentQueryIndex = 0));
}
function Ol(e) {
  return (T.lFrame.contextLView = hl(e, T.lFrame.contextLView))[j$1];
}
function Ae$1() {
  return T.lFrame.selectedIndex;
}
function Ke$1(e) {
  T.lFrame.selectedIndex = e;
}
function vo$1() {
  let e = T.lFrame;
  return ao$1(e.tView, e.selectedIndex);
}
function Rl() {
  T.lFrame.currentNamespace = is;
}
function kl() {
  Vh();
}
function Vh() {
  T.lFrame.currentNamespace = null;
}
function bs() {
  return T.lFrame.currentNamespace;
}
var Ll = !0;
function Io() {
  return Ll;
}
function Eo$1(e) {
  Ll = e;
}
function Fi$1(e, t = null, n = null, r) {
  let o = _s(e, t, n, r);
  return (o.resolveInjectorInitializers(), o);
}
function _s(e, t = null, n = null, r, o = new Set()) {
  return new mt$2([n || J$1, il(e)], t || Yt$2(), null, o);
}
var Te$1 = class e {
  static THROW_IF_NOT_FOUND = pt$2;
  static NULL = new zt$2();
  static create(t, n) {
    if (Array.isArray(t)) return Fi$1({ name: `` }, n, t, ``);
    {
      let r = t.name ?? ``;
      return Fi$1({ name: r }, t.parent, t.providers, r);
    }
  }
  static ɵprov = se$1({ token: e, providedIn: `any`, factory: () => De$2(kn$2) });
  static __NG_ELEMENT_ID__ = -1;
};
var jn$2 = new A$1(``);
var we$2 = class {
  static __NG_ELEMENT_ID__ = Hh;
  static __NG_ENV_ID__ = (t) => t;
};
var Gr$2 = class extends we$2 {
  _lView;
  constructor(t) {
    (super(), (this._lView = t));
  }
  get destroyed() {
    return Ct(this._lView);
  }
  onDestroy(t) {
    let n = this._lView;
    return (fo$1(n, t), () => gl(n, t));
  }
};
function Hh() {
  return new Gr$2(E$1());
}
var Pl = !1;
var Fl = new A$1(``);
var Mt = (() => {
  class e {
    taskId = 0;
    pendingTasks = new Set();
    destroyed = !1;
    pendingTask = new vn$1(!1);
    debugTaskTracker = w(Fl, { optional: !0 });
    get hasPendingTasks() {
      return this.destroyed ? !1 : this.pendingTask.value;
    }
    get hasPendingTasksObservable() {
      return this.destroyed
        ? new b((n) => {
            (n.next(!1), n.complete());
          })
        : this.pendingTask;
    }
    add() {
      !this.hasPendingTasks && !this.destroyed && this.pendingTask.next(!0);
      let n = this.taskId++;
      return (this.pendingTasks.add(n), this.debugTaskTracker?.add(n), n);
    }
    has(n) {
      return this.pendingTasks.has(n);
    }
    remove(n) {
      (this.pendingTasks.delete(n),
        this.debugTaskTracker?.remove(n),
        this.pendingTasks.size === 0 && this.hasPendingTasks && this.pendingTask.next(!1));
    }
    ngOnDestroy() {
      (this.pendingTasks.clear(),
        this.hasPendingTasks && this.pendingTask.next(!1),
        (this.destroyed = !0),
        this.pendingTask.unsubscribe());
    }
    static ɵprov = se$1({ token: e, providedIn: `root`, factory: () => new e() });
  }
  return e;
})();
var ji$1 = class extends Z$2 {
  __isAsync;
  destroyRef = void 0;
  pendingTasks = void 0;
  constructor(t = !1) {
    (super(),
      (this.__isAsync = t),
      ll() &&
        ((this.destroyRef = w(we$2, { optional: !0 }) ?? void 0),
        (this.pendingTasks = w(Mt, { optional: !0 }) ?? void 0)));
  }
  emit(t) {
    let n = y$1(null);
    try {
      super.next(t);
    } finally {
      y$1(n);
    }
  }
  subscribe(t, n, r) {
    let o = t,
      i = n || (() => null),
      s = r;
    if (t && typeof t == `object`) {
      let c = t;
      ((o = c.next?.bind(c)), (i = c.error?.bind(c)), (s = c.complete?.bind(c)));
    }
    this.__isAsync && ((i = this.wrapInTimeout(i)), o && (o = this.wrapInTimeout(o)), s && (s = this.wrapInTimeout(s)));
    let a = super.subscribe({ next: o, error: i, complete: s });
    return (t instanceof q && t.add(a), a);
  }
  wrapInTimeout(t) {
    return (n) => {
      let r = this.pendingTasks?.add();
      setTimeout(() => {
        try {
          t(n);
        } finally {
          r !== void 0 && this.pendingTasks?.remove(r);
        }
      });
    };
  }
};
var Le$2 = ji$1;
function zr$1(...e) {}
function Ms(e) {
  let t, n;
  function r() {
    e = zr$1;
    try {
      (n !== void 0 && typeof cancelAnimationFrame == `function` && cancelAnimationFrame(n),
        t !== void 0 && clearTimeout(t));
    } catch {}
  }
  return (
    (t = setTimeout(() => {
      (e(), r());
    })),
    typeof requestAnimationFrame == `function` &&
      (n = requestAnimationFrame(() => {
        (e(), r());
      })),
    () => r()
  );
}
function jl(e) {
  return (
    queueMicrotask(() => e()),
    () => {
      e = zr$1;
    }
  );
}
var Ns = `isAngularZone`;
var bn$2 = Ns + `_ID`;
var Bh = 0;
var Ce$1 = class e {
  hasPendingMacrotasks = !1;
  hasPendingMicrotasks = !1;
  isStable = !0;
  onUnstable = new Le$2(!1);
  onMicrotaskEmpty = new Le$2(!1);
  onStable = new Le$2(!1);
  onError = new Le$2(!1);
  constructor(t) {
    let {
      enableLongStackTrace: n = !1,
      shouldCoalesceEventChangeDetection: r = !1,
      shouldCoalesceRunChangeDetection: o = !1,
      scheduleInRootZone: i = Pl,
    } = t;
    if (typeof Zone > `u`) throw new M$1(908, !1);
    Zone.assertZonePatched();
    let s = this;
    ((s._nesting = 0),
      (s._outer = s._inner = Zone.current),
      Zone.TaskTrackingZoneSpec && (s._inner = s._inner.fork(new Zone.TaskTrackingZoneSpec())),
      n && Zone.longStackTraceZoneSpec && (s._inner = s._inner.fork(Zone.longStackTraceZoneSpec)),
      (s.shouldCoalesceEventChangeDetection = !o && r),
      (s.shouldCoalesceRunChangeDetection = o),
      (s.callbackScheduled = !1),
      (s.scheduleInRootZone = i),
      Wh(s));
  }
  static isInAngularZone() {
    return typeof Zone < `u` && Zone.current.get(Ns) === !0;
  }
  static assertInAngularZone() {
    if (!e.isInAngularZone()) throw new M$1(909, !1);
  }
  static assertNotInAngularZone() {
    if (e.isInAngularZone()) throw new M$1(909, !1);
  }
  run(t, n, r) {
    return this._inner.run(t, n, r);
  }
  runTask(t, n, r, o) {
    let i = this._inner,
      s = i.scheduleEventTask(`NgZoneEvent: ` + o, t, $h, zr$1, zr$1);
    try {
      return i.runTask(s, n, r);
    } finally {
      i.cancelTask(s);
    }
  }
  runGuarded(t, n, r) {
    return this._inner.runGuarded(t, n, r);
  }
  runOutsideAngular(t) {
    return this._outer.run(t);
  }
};
var $h = {};
function Ss(e) {
  if (e._nesting == 0 && !e.hasPendingMicrotasks && !e.isStable)
    try {
      (e._nesting++, e.onMicrotaskEmpty.emit(null));
    } finally {
      if ((e._nesting--, !e.hasPendingMicrotasks))
        try {
          e.runOutsideAngular(() => e.onStable.emit(null));
        } finally {
          e.isStable = !0;
        }
    }
}
function Uh(e) {
  if (e.isCheckStableRunning || e.callbackScheduled) return;
  e.callbackScheduled = !0;
  function t() {
    Ms(() => {
      ((e.callbackScheduled = !1), Vi$1(e), (e.isCheckStableRunning = !0), Ss(e), (e.isCheckStableRunning = !1));
    });
  }
  (e.scheduleInRootZone
    ? Zone.root.run(() => {
        t();
      })
    : e._outer.run(() => {
        t();
      }),
    Vi$1(e));
}
function Wh(e) {
  let t = () => {
      Uh(e);
    },
    n = Bh++;
  e._inner = e._inner.fork({
    name: `angular`,
    properties: { [Ns]: !0, [bn$2]: n, [bn$2 + n]: !0 },
    onInvokeTask: (r, o, i, s, a, c) => {
      if (qh(c)) return r.invokeTask(i, s, a, c);
      try {
        return (qc(e), r.invokeTask(i, s, a, c));
      } finally {
        (((e.shouldCoalesceEventChangeDetection && s.type === `eventTask`) || e.shouldCoalesceRunChangeDetection) &&
          t(),
          Gc(e));
      }
    },
    onInvoke: (r, o, i, s, a, c, l) => {
      try {
        return (qc(e), r.invoke(i, s, a, c, l));
      } finally {
        (e.shouldCoalesceRunChangeDetection && !e.callbackScheduled && !Gh(c) && t(), Gc(e));
      }
    },
    onHasTask: (r, o, i, s) => {
      (r.hasTask(i, s),
        o === i &&
          (s.change == `microTask`
            ? ((e._hasPendingMicrotasks = s.microTask), Vi$1(e), Ss(e))
            : s.change == `macroTask` && (e.hasPendingMacrotasks = s.macroTask)));
    },
    onHandleError: (r, o, i, s) => (r.handleError(i, s), e.runOutsideAngular(() => e.onError.emit(s)), !1),
  });
}
function Vi$1(e) {
  e._hasPendingMicrotasks ||
  ((e.shouldCoalesceEventChangeDetection || e.shouldCoalesceRunChangeDetection) && e.callbackScheduled === !0)
    ? (e.hasPendingMicrotasks = !0)
    : (e.hasPendingMicrotasks = !1);
}
function qc(e) {
  (e._nesting++, e.isStable && ((e.isStable = !1), e.onUnstable.emit(null)));
}
function Gc(e) {
  (e._nesting--, Ss(e));
}
var _n$2 = class {
  hasPendingMicrotasks = !1;
  hasPendingMacrotasks = !1;
  isStable = !0;
  onUnstable = new Le$2();
  onMicrotaskEmpty = new Le$2();
  onStable = new Le$2();
  onError = new Le$2();
  run(t, n, r) {
    return t.apply(n, r);
  }
  runGuarded(t, n, r) {
    return t.apply(n, r);
  }
  runOutsideAngular(t) {
    return t();
  }
  runTask(t, n, r, o) {
    return t.apply(n, r);
  }
};
function qh(e) {
  return Vl(e, `__ignore_ng_zone__`);
}
function Gh(e) {
  return Vl(e, `__scheduler_tick__`);
}
function Vl(e, t) {
  return !Array.isArray(e) || e.length !== 1 ? !1 : e[0]?.data?.[t] === !0;
}
var yt$2 = class {
  _console = console;
  handleError(t) {
    this._console.error(`ERROR`, t);
  }
};
var Je$2 = new A$1(``, {
  factory: () => {
    let e = w(Ce$1),
      t = w(ie$1),
      n;
    return (r) => {
      e.runOutsideAngular(() => {
        t.destroyed && !n
          ? setTimeout(() => {
              throw r;
            })
          : ((n ??= t.get(yt$2)), n.handleError(r));
      });
    };
  },
});
var Hl = {
  provide: Zt$2,
  useValue: () => {
    w(yt$2, { optional: !0 });
  },
  multi: !0,
};
var zh = new A$1(``, {
  factory: () => {
    let e = w(jn$2).defaultView;
    if (!e) return;
    let t = w(Je$2),
      n = (i) => {
        (t(i.reason), i.preventDefault());
      },
      r = (i) => {
        (i.error ? t(i.error) : t(new Error(i.message, { cause: i })), i.preventDefault());
      },
      o = () => {
        (e.addEventListener(`unhandledrejection`, n), e.addEventListener(`error`, r));
      };
    (typeof Zone < `u` ? Zone.root.run(o) : o(),
      w(we$2).onDestroy(() => {
        (e.removeEventListener(`error`, r), e.removeEventListener(`unhandledrejection`, n));
      }));
  },
});
function Qh() {
  return oo$1([
    ol(() => {
      w(zh);
    }),
  ]);
}
function Bl(e, t) {
  let [n, r, o] = di$2(e, t?.equal),
    i = n;
  i[W];
  return ((i.set = r), (i.update = o), (i.asReadonly = $l.bind(i)), i);
}
function $l() {
  let e = this[W];
  if (e.readonlyFn === void 0) {
    let t = () => this();
    ((t[W] = e), (e.readonlyFn = t));
  }
  return e.readonlyFn;
}
var Ul = new A$1(``, { factory: () => Zh });
var Zh = `ng`;
var Wl = new A$1(``);
var Yh = new A$1(``, { providedIn: `platform`, factory: () => `unknown` });
var Kh = new A$1(``);
var Jh = new A$1(``, {
  factory: () => w(jn$2).body?.querySelector(`[ngCspNonce]`)?.getAttribute(`ngCspNonce`) || null,
});
var tn$2 = (() => {
  class e {
    view;
    node;
    constructor(n, r) {
      ((this.view = n), (this.node = r));
    }
    static __NG_ELEMENT_ID__ = Xh;
  }
  return e;
})();
function Xh() {
  return new tn$2(E$1(), Q());
}
var be$1 = class {};
var Vn$1 = new A$1(``, { factory: () => !0 });
var xs = new A$1(``);
var Do$1 = (() => {
  class e {
    static ɵprov = se$1({ token: e, providedIn: `root`, factory: () => new Hi$1() });
  }
  return e;
})();
var Hi$1 = class {
  dirtyEffectCount = 0;
  queues = new Map();
  add(t) {
    (this.enqueue(t), this.schedule(t));
  }
  schedule(t) {
    t.dirty && this.dirtyEffectCount++;
  }
  remove(t) {
    let n = t.zone,
      r = this.queues.get(n);
    r.has(t) && (r.delete(t), t.dirty && this.dirtyEffectCount--);
  }
  enqueue(t) {
    let n = t.zone;
    this.queues.has(n) || this.queues.set(n, new Set());
    let r = this.queues.get(n);
    r.has(t) || r.add(t);
  }
  flush() {
    for (; this.dirtyEffectCount > 0;) {
      let t = !1;
      for (let [n, r] of this.queues) n === null ? (t ||= this.flushQueue(r)) : (t ||= n.run(() => this.flushQueue(r)));
      t || (this.dirtyEffectCount = 0);
    }
  }
  flushQueue(t) {
    let n = !1;
    for (let r of t) r.dirty && (this.dirtyEffectCount--, (n = !0), r.run());
    return n;
  }
};
var Qr$2 = class {
  [W];
  constructor(t) {
    this[W] = t;
  }
  destroy() {
    this[W].destroy();
  }
};
function eg(e, t) {
  let n = t?.injector ?? w(Te$1),
    r = t?.manualCleanup !== !0 ? n.get(we$2) : null,
    o,
    i = n.get(tn$2, null, { optional: !0 }),
    s = n.get(be$1);
  return (
    i !== null
      ? ((o = rg(i.view, s, e)), r instanceof Gr$2 && r._lView === i.view && (r = null))
      : (o = og(e, n.get(Do$1), s)),
    (o.injector = n),
    r !== null && (o.onDestroyFns = [r.onDestroy(() => o.destroy())]),
    new Qr$2(o)
  );
}
var ql = m$3(l({}, pi$1), {
  cleanupFns: void 0,
  zone: null,
  onDestroyFns: null,
  run() {
    let e = Cn$2(!1);
    try {
      hi$1(this);
    } finally {
      Cn$2(e);
    }
  },
  cleanup() {
    if (!this.cleanupFns?.length) return;
    let e = y$1(null);
    try {
      for (; this.cleanupFns.length;) this.cleanupFns.pop()();
    } finally {
      ((this.cleanupFns = []), y$1(e));
    }
  },
});
var tg = m$3(l({}, ql), {
  consumerMarkedDirty() {
    (this.scheduler.schedule(this), this.notifier.notify(12));
  },
  destroy() {
    if ((We(this), this.onDestroyFns !== null)) for (let e of this.onDestroyFns) e();
    (this.cleanup(), this.scheduler.remove(this));
  },
});
var ng = m$3(l({}, ql), {
  consumerMarkedDirty() {
    ((this.view[I$1] |= 8192), bt(this.view), this.notifier.notify(13));
  },
  destroy() {
    if ((We(this), this.onDestroyFns !== null)) for (let e of this.onDestroyFns) e();
    (this.cleanup(), this.view[Fe]?.delete(this));
  },
});
function rg(e, t, n) {
  let r = Object.create(ng);
  return (
    (r.view = e),
    (r.zone = typeof Zone < `u` ? Zone.current : null),
    (r.notifier = t),
    (r.fn = Gl(r, n)),
    (e[Fe] ??= new Set()),
    e[Fe].add(r),
    r.consumerMarkedDirty(r),
    r
  );
}
function og(e, t, n) {
  let r = Object.create(tg);
  return (
    (r.fn = Gl(r, e)),
    (r.scheduler = t),
    (r.notifier = n),
    (r.zone = typeof Zone < `u` ? Zone.current : null),
    r.scheduler.add(r),
    r.notifier.notify(12),
    r
  );
}
function Gl(e, t) {
  return () => {
    t((n) => (e.cleanupFns ??= []).push(n));
  };
}
function zl(e) {
  return typeof e == `function` && e[W] !== void 0;
}
var Ql = (() => {
  class e {
    internalPendingTasks = w(Mt);
    scheduler = w(be$1);
    errorHandler = w(Je$2);
    add() {
      let n = this.internalPendingTasks.add();
      return () => {
        this.internalPendingTasks.has(n) && (this.scheduler.notify(11), this.internalPendingTasks.remove(n));
      };
    }
    run(n) {
      let r = this.add();
      try {
        n().catch(this.errorHandler).finally(r);
      } catch (o) {
        (this.errorHandler(o), r());
      }
    }
    static ɵprov = se$1({ token: e, providedIn: `root`, factory: () => new e() });
  }
  return e;
})();
function Xn$2(e) {
  return { toString: e }.toString();
}
var N$1 = (function (e) {
  return (
    (e[(e.TemplateCreateStart = 0)] = `TemplateCreateStart`),
    (e[(e.TemplateCreateEnd = 1)] = `TemplateCreateEnd`),
    (e[(e.TemplateUpdateStart = 2)] = `TemplateUpdateStart`),
    (e[(e.TemplateUpdateEnd = 3)] = `TemplateUpdateEnd`),
    (e[(e.LifecycleHookStart = 4)] = `LifecycleHookStart`),
    (e[(e.LifecycleHookEnd = 5)] = `LifecycleHookEnd`),
    (e[(e.OutputStart = 6)] = `OutputStart`),
    (e[(e.OutputEnd = 7)] = `OutputEnd`),
    (e[(e.BootstrapApplicationStart = 8)] = `BootstrapApplicationStart`),
    (e[(e.BootstrapApplicationEnd = 9)] = `BootstrapApplicationEnd`),
    (e[(e.BootstrapComponentStart = 10)] = `BootstrapComponentStart`),
    (e[(e.BootstrapComponentEnd = 11)] = `BootstrapComponentEnd`),
    (e[(e.ChangeDetectionStart = 12)] = `ChangeDetectionStart`),
    (e[(e.ChangeDetectionEnd = 13)] = `ChangeDetectionEnd`),
    (e[(e.ChangeDetectionSyncStart = 14)] = `ChangeDetectionSyncStart`),
    (e[(e.ChangeDetectionSyncEnd = 15)] = `ChangeDetectionSyncEnd`),
    (e[(e.AfterRenderHooksStart = 16)] = `AfterRenderHooksStart`),
    (e[(e.AfterRenderHooksEnd = 17)] = `AfterRenderHooksEnd`),
    (e[(e.ComponentStart = 18)] = `ComponentStart`),
    (e[(e.ComponentEnd = 19)] = `ComponentEnd`),
    (e[(e.DeferBlockStateStart = 20)] = `DeferBlockStateStart`),
    (e[(e.DeferBlockStateEnd = 21)] = `DeferBlockStateEnd`),
    (e[(e.DynamicComponentStart = 22)] = `DynamicComponentStart`),
    (e[(e.DynamicComponentEnd = 23)] = `DynamicComponentEnd`),
    (e[(e.HostBindingsUpdateStart = 24)] = `HostBindingsUpdateStart`),
    (e[(e.HostBindingsUpdateEnd = 25)] = `HostBindingsUpdateEnd`),
    e
  );
})(N$1 || {});
var xo = class {
  previousValue;
  currentValue;
  firstChange;
  constructor(t, n, r) {
    ((this.previousValue = t), (this.currentValue = n), (this.firstChange = r));
  }
  isFirstChange() {
    return this.firstChange;
  }
};
function Ru(e, t, n, r) {
  t !== null ? t.applyValueToInputSignal(t, r) : (e[n] = r);
}
var ku = null;
var yg = (() => {
  ku = Zl;
  let e = () => Zl;
  return ((e.ngInherit = !0), e);
})();
function vg() {
  return ku;
}
function Zl(e) {
  return (e.type.prototype.ngOnChanges && (e.setInput = Eg), Ig);
}
function Ig() {
  let e = Lu(this),
    t = e?.current;
  if (t) {
    let n = e.previous;
    if (n === Qe$2) e.previous = t;
    else for (let r in t) n[r] = t[r];
    ((e.current = null), this.ngOnChanges(t));
  }
}
function Eg(e, t, n, r, o) {
  let i = this.declaredInputs[r],
    s = Lu(e) || Dg(e, { previous: Qe$2, current: null }),
    a = s.current || (s.current = {}),
    c = s.previous,
    l = c[i];
  ((a[i] = new xo(l && l.currentValue, n, c === Qe$2)), Ru(e, t, o, n));
}
var $s = `__ngSimpleChanges__`;
function Lu(e) {
  return (Object.hasOwn(e, $s) && e[$s]) || null;
}
function Dg(e, t) {
  return (e[$s] = t);
}
var Yl = [];
var O$1 = function (e, t = null, n) {
  for (let r = 0; r < Yl.length; r++) {
    let o = Yl[r];
    o(e, t, n);
  }
};
function Tg(e, t, n) {
  let { ngOnChanges: r, ngOnInit: o, ngDoCheck: i } = t.type.prototype;
  if (r) {
    let s = vg()(t);
    ((n.preOrderHooks ??= []).push(e, s), (n.preOrderCheckHooks ??= []).push(e, s));
  }
  (o && (n.preOrderHooks ??= []).push(0 - e, o),
    i && ((n.preOrderHooks ??= []).push(e, i), (n.preOrderCheckHooks ??= []).push(e, i)));
}
function Pu(e, t) {
  for (let n = t.directiveStart, r = t.directiveEnd; n < r; n++) {
    let {
      ngAfterContentInit: s,
      ngAfterContentChecked: a,
      ngAfterViewInit: c,
      ngAfterViewChecked: l,
      ngOnDestroy: u,
    } = e.data[n].type.prototype;
    (s && (e.contentHooks ??= []).push(-n, s),
      a && ((e.contentHooks ??= []).push(n, a), (e.contentCheckHooks ??= []).push(n, a)),
      c && (e.viewHooks ??= []).push(-n, c),
      l && ((e.viewHooks ??= []).push(n, l), (e.viewCheckHooks ??= []).push(n, l)),
      u != null && (e.destroyHooks ??= []).push(n, u));
  }
}
function bo$1(e, t, n) {
  Fu(e, t, 3, n);
}
function _o$1(e, t, n, r) {
  (e[I$1] & 3) === n && Fu(e, t, n, r);
}
function As(e, t) {
  let n = e[I$1];
  (n & 3) === t && ((n &= 16383), (n += 1), (e[I$1] = n));
}
function Fu(e, t, n, r) {
  let o = r !== void 0 ? e[Et$1] & 65535 : 0,
    i = r ?? -1,
    s = t.length - 1,
    a = 0;
  for (let c = o; c < s; c++)
    if (typeof t[c + 1] == `number`) {
      if (((a = t[c]), r != null && a >= r)) break;
    } else
      (t[c] < 0 && (e[Et$1] += 65536),
        (a < i || i == -1) && (wg(e, n, t, c), (e[Et$1] = (e[Et$1] & 4294901760) + c + 2)),
        c++);
}
function Kl(e, t) {
  O$1(N$1.LifecycleHookStart, e, t);
  let n = y$1(null);
  try {
    t.call(e);
  } finally {
    (y$1(n), O$1(N$1.LifecycleHookEnd, e, t));
  }
}
function wg(e, t, n, r) {
  let o = n[r] < 0,
    i = n[r + 1],
    a = e[o ? -n[r] : n[r]];
  o ? e[I$1] >> 14 < e[Et$1] >> 16 && (e[I$1] & 3) === t && ((e[I$1] += 16384), Kl(a, i)) : Kl(a, i);
}
var rn$2 = -1;
var St$1 = class {
  factory;
  name;
  injectImpl;
  resolving = !1;
  canSeeViewProviders;
  multi;
  componentProviders;
  index;
  providerFactory;
  constructor(t, n, r, o) {
    ((this.factory = t), (this.name = o), (this.canSeeViewProviders = n), (this.injectImpl = r));
  }
};
function Cg(e) {
  return (e.flags & 8) !== 0;
}
function bg(e) {
  return (e.flags & 16) !== 0;
}
function _g(e, t, n) {
  let r = 0;
  for (; r < n.length;) {
    let o = n[r];
    if (typeof o == `number`) {
      if (o !== 0) break;
      r++;
      let i = n[r++],
        s = n[r++],
        a = n[r++];
      e.setAttribute(t, s, a, i);
    } else {
      let i = o,
        s = n[++r];
      (Mg(i) ? e.setProperty(t, i, s) : e.setAttribute(t, i, s), r++);
    }
  }
  return r;
}
function ju(e) {
  return e === 3 || e === 4 || e === 6;
}
function Mg(e) {
  return e.charCodeAt(0) === 64;
}
function on$2(e, t) {
  if (!(t === null || t.length === 0))
    if (e === null || e.length === 0) e = t.slice();
    else {
      let n = -1;
      for (let r = 0; r < t.length; r++) {
        let o = t[r];
        typeof o == `number`
          ? (n = o)
          : n === 0 || (n === -1 || n === 2 ? Jl(e, n, o, null, t[++r]) : Jl(e, n, o, null, null));
      }
    }
  return e;
}
function Jl(e, t, n, r, o) {
  let i = 0,
    s = e.length;
  if (t === -1) s = -1;
  else
    for (; i < e.length;) {
      let a = e[i++];
      if (typeof a == `number`) {
        if (a === t) {
          s = -1;
          break;
        } else if (a > t) {
          s = i - 1;
          break;
        }
      }
    }
  for (; i < e.length;) {
    let a = e[i];
    if (typeof a == `number`) break;
    if (a === n) {
      o !== null && (e[i + 1] = o);
      return;
    }
    (i++, o !== null && i++);
  }
  (s !== -1 && (e.splice(s, 0, t), (i = s + 1)), e.splice(i++, 0, n), o !== null && e.splice(i++, 0, o));
}
function Vu(e) {
  return e !== rn$2;
}
function Ao(e) {
  return e & 32767;
}
function Ng(e) {
  return e >> 16;
}
function Oo(e, t) {
  let n = Ng(e),
    r = t;
  for (; n > 0;) ((r = r[Ze$1]), n--);
  return r;
}
var Us = !0;
function Ro$1(e) {
  let t = Us;
  return ((Us = e), t);
}
var Hu = 255;
var Bu = 5;
var xg = 0;
var Oe$2 = {};
function Ag(e, t, n) {
  let r;
  (typeof n == `string` ? (r = n.charCodeAt(0) || 0) : Object.hasOwn(n, vt$1) && (r = n[vt$1]), (r ??= n[vt$1] = xg++));
  let o = r & Hu,
    i = 1 << o;
  t.data[e + (o >> Bu)] |= i;
}
function ko(e, t) {
  let n = $u(e, t);
  if (n !== -1) return n;
  let r = t[m$2];
  r.firstCreatePass && ((e.injectorIndex = t.length), Os(r.data, e), Os(t, null), Os(r.blueprint, null));
  let o = _a(e, t),
    i = e.injectorIndex;
  if (Vu(o)) {
    let s = Ao(o),
      a = Oo(o, t),
      c = a[m$2].data;
    for (let l = 0; l < 8; l++) t[i + l] = a[s + l] | c[s + l];
  }
  return ((t[i + 8] = o), i);
}
function Os(e, t) {
  e.push(0, 0, 0, 0, 0, 0, 0, 0, t);
}
function $u(e, t) {
  return e.injectorIndex === -1 ||
    (e.parent && e.parent.injectorIndex === e.injectorIndex) ||
    t[e.injectorIndex + 8] === null
    ? -1
    : e.injectorIndex;
}
function _a(e, t) {
  if (e.parent && e.parent.injectorIndex !== -1) return e.parent.injectorIndex;
  let n = 0,
    r = null,
    o = t;
  for (; o !== null;) {
    if (((r = zu(o)), r === null)) return rn$2;
    if ((n++, (o = o[Ze$1]), r.injectorIndex !== -1)) return r.injectorIndex | (n << 16);
  }
  return rn$2;
}
function Ws(e, t, n) {
  Ag(e, t, n);
}
function Og(e, t) {
  if (t === `class`) return e.classes;
  if (t === `style`) return e.styles;
  let n = e.attrs;
  if (n) {
    let r = n.length,
      o = 0;
    for (; o < r;) {
      let i = n[o];
      if (ju(i)) break;
      if (i === 0) o = o + 2;
      else if (typeof i == `number`) for (o++; o < r && typeof n[o] == `string`;) o++;
      else {
        if (i === t) return n[o + 1];
        o = o + 2;
      }
    }
  }
  return null;
}
function Uu(e, t, n) {
  if (n & 8 || e !== void 0) return e;
  to$1(t, `NodeInjector`);
}
function Wu(e, t, n, r) {
  if ((n & 8 && r === void 0 && (r = null), (n & 3) === 0)) {
    let o = e[_e$1],
      i = K$1(void 0);
    try {
      return o ? o.get(t, r, n & 8) : zi$1(t, r, n & 8);
    } finally {
      K$1(i);
    }
  }
  return Uu(r, t, n);
}
function qu(e, t, n, r = 0, o) {
  if (e !== null) {
    if (t[I$1] & 2048 && !(r & 2)) {
      let s = Fg(e, t, n, r, Oe$2);
      if (s !== Oe$2) return s;
    }
    let i = Gu(e, t, n, r, Oe$2);
    if (i !== Oe$2) return i;
  }
  return Wu(t, n, r, o);
}
function Gu(e, t, n, r, o) {
  let i = kg(n);
  if (typeof i == `function`) {
    if (!ws(t, e, r)) return r & 1 ? Uu(o, n, r) : Wu(t, n, r, o);
    try {
      let s;
      if (((s = i(r)), s == null && !(r & 8))) to$1(n);
      else return s;
    } finally {
      Cs();
    }
  } else if (typeof i == `number`) {
    let s = null,
      a = $u(e, t),
      c = rn$2,
      l = r & 1 ? t[X$1][G$2] : null;
    for (
      (a === -1 || r & 4) &&
      ((c = a === -1 ? _a(e, t) : t[a + 8]),
      c === rn$2 || !eu(r, !1) ? (a = -1) : ((s = t[m$2]), (a = Ao(c)), (t = Oo(c, t))));
      a !== -1;
    ) {
      let u = t[m$2];
      if (Xl(i, a, u.data)) {
        let d = Rg(a, t, n, s, r, l);
        if (d !== Oe$2) return d;
      }
      ((c = t[a + 8]),
        c !== rn$2 && eu(r, t[m$2].data[a + 8] === l) && Xl(i, a, t)
          ? ((s = u), (a = Ao(c)), (t = Oo(c, t)))
          : (a = -1));
    }
  }
  return o;
}
function Rg(e, t, n, r, o, i) {
  let s = t[m$2],
    a = s.data[e + 8],
    u = Mo$1(a, s, n, r == null ? He$1(a) && Us : r != s && (a.type & 3) !== 0, o & 1 && i === a);
  return u !== null ? Wn$1(t, s, u, a, o) : Oe$2;
}
function Mo$1(e, t, n, r, o) {
  let i = e.providerIndexes,
    s = t.data,
    a = i & 1048575,
    c = e.directiveStart,
    l = e.directiveEnd,
    u = i >> 20,
    d = r ? a : a + u,
    p = o ? a + u : l;
  for (let f = d; f < p; f++) {
    let h = s[f];
    if ((f < c && n === h) || (f >= c && h.type === n)) return f;
  }
  if (o) {
    let f = s[c];
    if (f && he$2(f) && f.type === n) return c;
  }
  return null;
}
function Wn$1(e, t, n, r, o) {
  let i = e[n],
    s = t.data;
  if (i instanceof St$1) {
    let a = i;
    if (a.resolving) throw Gi$1(``);
    let c = Ro$1(a.canSeeViewProviders);
    a.resolving = !0;
    s[n].type || s[n];
    let d = a.injectImpl ? K$1(a.injectImpl) : null;
    ws(e, r, 0);
    try {
      ((i = e[n] = a.factory(void 0, o, s, e, r)), t.firstCreatePass && n >= r.directiveStart && Tg(n, s[n], t));
    } finally {
      (d !== null && K$1(d), Ro$1(c), (a.resolving = !1), Cs());
    }
  }
  return i;
}
function kg(e) {
  if (typeof e == `string`) return e.charCodeAt(0) || 0;
  let t = Object.hasOwn(e, vt$1) ? e[vt$1] : void 0;
  return typeof t == `number` ? (t >= 0 ? t & Hu : Lg) : t;
}
function Xl(e, t, n) {
  let r = 1 << e;
  return !!(n[t + (e >> Bu)] & r);
}
function eu(e, t) {
  return !(e & 2) && !(e & 1 && t);
}
var Xe$1 = class {
  _tNode;
  _lView;
  constructor(t, n) {
    ((this._tNode = t), (this._lView = n));
  }
  get(t, n, r) {
    return qu(this._tNode, this._lView, t, ht$2(r), n);
  }
};
function Lg() {
  return new Xe$1(Q(), E$1());
}
function Pg(e) {
  return Xn$2(() => {
    let t = e.prototype.constructor,
      n = t[wn$2] || qs(t),
      r = Object.prototype,
      o = Object.getPrototypeOf(e.prototype).constructor;
    for (; o && o !== r;) {
      let i = o[wn$2] || qs(o);
      if (i && i !== n) return i;
      o = Object.getPrototypeOf(o);
    }
    return (i) => new i();
  });
}
function qs(e) {
  return $i$1(e)
    ? () => {
        let t = qs(V$2(e));
        return t && t();
      }
    : qe$1(e);
}
function Fg(e, t, n, r, o) {
  let i = e,
    s = t;
  for (; i !== null && s !== null && s[I$1] & 2048 && !Xt$2(s);) {
    let a = Gu(i, s, n, r | 2, Oe$2);
    if (a !== Oe$2) return a;
    let c = i.parent;
    if (!c) {
      let l = s[ts];
      if (l) {
        let u = l.get(n, Oe$2, r & -5);
        if (u !== Oe$2) return u;
      }
      ((c = zu(s)), (s = s[Ze$1]));
    }
    i = c;
  }
  return o;
}
function zu(e) {
  let t = e[m$2],
    n = t.type;
  return n === 2 ? t.declTNode : n === 1 ? e[G$2] : null;
}
function Qu(e) {
  return Og(Q(), e);
}
function er$2(e) {
  return { token: e.token, providedIn: e.autoProvided === !1 ? null : `root`, factory: e.factory, value: void 0 };
}
function jg() {
  return hn$2(Q(), E$1());
}
function hn$2(e, t) {
  return new tr$2(ge$2(e, t));
}
var tr$2 = (() => {
  class e {
    nativeElement;
    constructor(n) {
      this.nativeElement = n;
    }
    static __NG_ELEMENT_ID__ = jg;
  }
  return e;
})();
function Vg(e) {
  return e instanceof tr$2 ? e.nativeElement : e;
}
function Hg() {
  return this._results[Symbol.iterator]();
}
var Lo$1 = class {
  _emitDistinctChangesOnly;
  dirty = !0;
  _onDirty = void 0;
  _results = [];
  _changesDetected = !1;
  _changes = void 0;
  length = 0;
  first = void 0;
  last = void 0;
  get changes() {
    return (this._changes ??= new Z$2());
  }
  constructor(t = !1) {
    this._emitDistinctChangesOnly = t;
  }
  get(t) {
    return this._results[t];
  }
  map(t) {
    return this._results.map(t);
  }
  filter(t) {
    return this._results.filter(t);
  }
  find(t) {
    return this._results.find(t);
  }
  reduce(t, n) {
    return this._results.reduce(t, n);
  }
  forEach(t) {
    this._results.forEach(t);
  }
  some(t) {
    return this._results.some(t);
  }
  toArray() {
    return this._results.slice();
  }
  toString() {
    return this._results.toString();
  }
  reset(t, n) {
    this.dirty = !1;
    let r = tl(t);
    (this._changesDetected = !el(this._results, r, n)) &&
      ((this._results = r), (this.length = r.length), (this.last = r[this.length - 1]), (this.first = r[0]));
  }
  notifyOnChanges() {
    this._changes !== void 0 && (this._changesDetected || !this._emitDistinctChangesOnly) && this._changes.next(this);
  }
  onDirty(t) {
    this._onDirty = t;
  }
  setDirty() {
    ((this.dirty = !0), this._onDirty?.());
  }
  destroy() {
    this._changes !== void 0 && (this._changes.complete(), this._changes.unsubscribe());
  }
  [Symbol.iterator] = Hg;
};
function Zu(e) {
  return (e.flags & 128) === 128;
}
var Ma = (function (e) {
  return ((e[(e.OnPush = 0)] = `OnPush`), (e[(e.Eager = 1)] = `Eager`), (e[(e.Default = 1)] = `Default`), e);
})(Ma || {});
var Yu = new Map();
var Bg = 0;
function $g() {
  return Bg++;
}
function Ug(e) {
  Yu.set(e[Se$1], e);
}
function Gs(e) {
  Yu.delete(e[Se$1]);
}
var tu = `__ngContext__`;
function sn$2(e, t) {
  Ve$1(t) ? ((e[tu] = t[Se$1]), Ug(t)) : (e[tu] = t);
}
function Ku(e) {
  return Xu(e[Jt$2]);
}
function Ju(e) {
  return Xu(e[ae$1]);
}
function Xu(e) {
  for (; e !== null && !ce$2(e);) e = e[ae$1];
  return e;
}
var zs;
function Wg(e) {
  zs = e;
}
function ed() {
  if (zs !== void 0) return zs;
  if (typeof document < `u`) return document;
  throw new M$1(210, !1);
}
var td = `r`;
var nd = `di`;
var rd = !1;
var od = new A$1(``, { factory: () => rd });
var nu = new WeakMap();
function qg(e, t) {
  if (e == null || typeof e != `object`) return;
  let n = nu.get(e);
  (n || ((n = new WeakSet()), nu.set(e, n)), n.add(t));
}
function Qo(e) {
  return (e.flags & 32) === 32;
}
var Qg = () => null;
function id(e, t, n = !1) {
  return Qg(e, t, n);
}
function sd(e, t) {
  let n = e.contentQueries;
  if (n !== null) {
    let r = y$1(null);
    try {
      for (let o = 0; o < n.length; o += 2) {
        let i = n[o],
          s = n[o + 1];
        if (s !== -1) {
          let a = e.data[s];
          (go$1(i), a.contentQueries(2, t[s], s));
        }
      }
    } finally {
      y$1(r);
    }
  }
}
function Qs(e, t, n) {
  go$1(0);
  let r = y$1(null);
  try {
    t(e, n);
  } finally {
    y$1(r);
  }
}
function ad(e, t, n) {
  if (rs(t)) {
    let r = y$1(null);
    try {
      let o = t.directiveStart,
        i = t.directiveEnd;
      for (let s = o; s < i; s++) {
        let a = e.data[s];
        if (a.contentQueries) {
          let c = n[s];
          a.contentQueries(1, c, s);
        }
      }
    } finally {
      y$1(r);
    }
  }
}
var xt$1 = (function (e) {
  return (
    (e[(e.Emulated = 0)] = `Emulated`),
    (e[(e.None = 2)] = `None`),
    (e[(e.ShadowDom = 3)] = `ShadowDom`),
    (e[(e.ExperimentalIsolatedShadowDom = 4)] = `ExperimentalIsolatedShadowDom`),
    e
  );
})(xt$1 || {});
var To$1;
function Zg() {
  if (To$1 === void 0 && ((To$1 = null), ze$1.trustedTypes))
    try {
      To$1 = ze$1.trustedTypes.createPolicy(`angular`, {
        createHTML: (e) => e,
        createScript: (e) => e,
        createScriptURL: (e) => e,
      });
    } catch {}
  return To$1;
}
function Zo(e) {
  return Zg()?.createHTML(e) || e;
}
var Be$1 = class {
  changingThisBreaksApplicationSecurity;
  constructor(t) {
    this.changingThisBreaksApplicationSecurity = t;
  }
  toString() {
    return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${Zr$2})`;
  }
};
var Zs = class extends Be$1 {
  getTypeName() {
    return `HTML`;
  }
};
var Ys = class extends Be$1 {
  getTypeName() {
    return `Style`;
  }
};
var Ks = class extends Be$1 {
  getTypeName() {
    return `Script`;
  }
};
var Js = class extends Be$1 {
  getTypeName() {
    return `URL`;
  }
};
var Xs = class extends Be$1 {
  getTypeName() {
    return `ResourceURL`;
  }
};
function qn$2(e) {
  return e instanceof Be$1 ? e.changingThisBreaksApplicationSecurity : e;
}
function Yg(e, t) {
  let n = cd(e);
  if (n != null && n !== t) {
    if (n === `ResourceURL` && t === `URL`) return !0;
    throw new Error(`Required a safe ${t}, got a ${n} (see ${Zr$2})`);
  }
  return n === t;
}
function cd(e) {
  return (e instanceof Be$1 && e.getTypeName()) || null;
}
function Kg(e) {
  return new Zs(e);
}
function Jg(e) {
  return new Ys(e);
}
function Xg(e) {
  return new Ks(e);
}
function em(e) {
  return new Js(e);
}
function tm(e) {
  return new Xs(e);
}
function nm(e) {
  let t = new ta(e);
  return rm() ? new ea(t) : t;
}
var ea = class {
  inertDocumentHelper;
  constructor(t) {
    this.inertDocumentHelper = t;
  }
  getInertBodyElement(t) {
    t = `<body><remove></remove>` + t;
    try {
      let n = new window.DOMParser().parseFromString(Zo(t), `text/html`).body;
      return n === null ? this.inertDocumentHelper.getInertBodyElement(t) : (n.firstChild?.remove(), n);
    } catch {
      return null;
    }
  }
};
var ta = class {
  defaultDoc;
  inertDocument;
  constructor(t) {
    ((this.defaultDoc = t),
      (this.inertDocument = this.defaultDoc.implementation.createHTMLDocument(`sanitization-inert`)));
  }
  getInertBodyElement(t) {
    let n = this.inertDocument.createElement(`template`);
    return ((n.innerHTML = Zo(t)), n);
  }
};
function rm() {
  try {
    return !!new window.DOMParser().parseFromString(Zo(``), `text/html`);
  } catch {
    return !1;
  }
}
var om = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;
function ld(e) {
  return ((e = String(e)), e.match(om) ? e : `unsafe:` + e);
}
function $e$1(e) {
  let t = Object.create(null);
  for (let n of e.split(`,`)) t[n] = !0;
  return t;
}
function nr$2(...e) {
  let t = Object.create(null);
  for (let n of e) for (let r in n) Object.hasOwn(n, r) && (t[r] = !0);
  return t;
}
var ud = $e$1(`area,br,col,hr,img,wbr`);
var dd = $e$1(`colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr`);
var fd = $e$1(`rp,rt`);
var im = nr$2(fd, dd);
var ru = nr$2(
  ud,
  nr$2(
    dd,
    $e$1(
      `address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul`,
    ),
  ),
  nr$2(
    fd,
    $e$1(
      `a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video`,
    ),
  ),
  im,
);
var pd = $e$1(`background,cite,href,itemtype,longdesc,poster,src,xlink:href`);
var um = nr$2(
  pd,
  $e$1(
    `abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width`,
  ),
  $e$1(
    `aria-activedescendant,aria-atomic,aria-autocomplete,aria-busy,aria-checked,aria-colcount,aria-colindex,aria-colspan,aria-controls,aria-current,aria-describedby,aria-details,aria-disabled,aria-dropeffect,aria-errormessage,aria-expanded,aria-flowto,aria-grabbed,aria-haspopup,aria-hidden,aria-invalid,aria-keyshortcuts,aria-label,aria-labelledby,aria-level,aria-live,aria-modal,aria-multiline,aria-multiselectable,aria-orientation,aria-owns,aria-placeholder,aria-posinset,aria-pressed,aria-readonly,aria-relevant,aria-required,aria-roledescription,aria-rowcount,aria-rowindex,aria-rowspan,aria-selected,aria-setsize,aria-sort,aria-valuemax,aria-valuemin,aria-valuenow,aria-valuetext`,
  ),
);
var dm = $e$1(`script,style,template`);
var na = class {
  sanitizedSomething = !1;
  buf = [];
  sanitizeChildren(t) {
    let n = t.firstChild,
      r = !0,
      o = [];
    for (; n;) {
      if (
        (n.nodeType === Node.ELEMENT_NODE
          ? (r = this.startElement(n))
          : n.nodeType === Node.TEXT_NODE
            ? this.chars(n.nodeValue)
            : (this.sanitizedSomething = !0),
        r && n.firstChild)
      ) {
        (o.push(n), (n = hm(n)));
        continue;
      }
      for (; n;) {
        n.nodeType === Node.ELEMENT_NODE && this.endElement(n);
        let i = pm(n);
        if (i) {
          n = i;
          break;
        }
        n = o.pop();
      }
    }
    return this.buf.join(``);
  }
  startElement(t) {
    let n = ou(t).toLowerCase();
    if (!Object.hasOwn(ru, n)) return ((this.sanitizedSomething = !0), !Object.hasOwn(dm, n));
    (this.buf.push(`<`), this.buf.push(n));
    let r = t.attributes;
    for (let o = 0; o < r.length; o++) {
      let i = r.item(o),
        s = i.name,
        a = s.toLowerCase();
      if (!Object.hasOwn(um, a)) {
        this.sanitizedSomething = !0;
        continue;
      }
      let c = i.value;
      (pd[a] && (c = ld(c)), this.buf.push(` `, s, `="`, iu(c), `"`));
    }
    return (this.buf.push(`>`), !0);
  }
  endElement(t) {
    let n = ou(t).toLowerCase();
    Object.hasOwn(ru, n) && !Object.hasOwn(ud, n) && (this.buf.push(`</`), this.buf.push(n), this.buf.push(`>`));
  }
  chars(t) {
    this.buf.push(iu(t));
  }
};
function fm(e, t) {
  return (e.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_CONTAINED_BY) !== Node.DOCUMENT_POSITION_CONTAINED_BY;
}
function pm(e) {
  let t = e.nextSibling;
  if (t && e !== t.previousSibling) throw hd(t);
  return t;
}
function hm(e) {
  let t = e.firstChild;
  if (t && fm(e, t)) throw hd(t);
  return t;
}
function ou(e) {
  let t = e.nodeName;
  return typeof t == `string` ? t : `FORM`;
}
function hd(e) {
  return new Error(`Failed to sanitize html because the element is clobbered: ${e.outerHTML}`);
}
var gm = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var mm = /([^\#-~ |!])/g;
function iu(e) {
  return e
    .replace(/&/g, `&amp;`)
    .replace(gm, function (t) {
      let n = t.charCodeAt(0),
        r = t.charCodeAt(1);
      return `&#` + ((n - 55296) * 1024 + (r - 56320) + 65536) + `;`;
    })
    .replace(mm, function (t) {
      return `&#` + t.charCodeAt(0) + `;`;
    })
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`);
}
var wo$1;
function ym(e, t) {
  let n = null;
  try {
    wo$1 = wo$1 || nm(e);
    let r = t ? String(t) : ``;
    n = wo$1.getInertBodyElement(r);
    let o = 5,
      i = r;
    do {
      if (o === 0) throw new Error(`Failed to sanitize html because the input is unstable`);
      (o--, (r = i), (i = n.innerHTML), (n = wo$1.getInertBodyElement(r)));
    } while (r !== i);
    return Zo(new na().sanitizeChildren(su(n) || n));
  } finally {
    if (n) {
      let r = su(n) || n;
      for (; r.firstChild;) r.firstChild.remove();
    }
  }
}
function su(e) {
  return `content` in e && vm(e) ? e.content : null;
}
function vm(e) {
  return e.nodeType === Node.ELEMENT_NODE && e.nodeName === `TEMPLATE`;
}
function Im(e, t) {
  return e.createText(t);
}
function Em(e, t, n) {
  e.setValue(t, n);
}
function gd(e, t, n) {
  return e.createElement(t, n);
}
function Nt(e, t, n, r, o) {
  e.insertBefore(t, n, r, o);
}
function md(e, t, n) {
  e.appendChild(t, n);
}
function au(e, t, n, r, o) {
  r !== null ? Nt(e, t, n, r, o) : md(e, t, n);
}
function yd(e, t, n, r) {
  e.removeChild(null, t, n, r);
}
function Dm(e, t, n) {
  e.setAttribute(t, `style`, n);
}
function Tm(e, t, n) {
  n === `` ? e.removeAttribute(t, `class`) : e.setAttribute(t, `class`, n);
}
function vd(e, t, n) {
  let { mergedAttrs: r, classes: o, styles: i } = n;
  (r !== null && _g(e, t, r), o !== null && Tm(e, t, o), i !== null && Dm(e, t, i));
}
function wm(e) {
  return e.ownerDocument;
}
function Cm(e) {
  return e instanceof Function ? e() : e;
}
function bm(e, t, n) {
  let r = e.length;
  for (;;) {
    let o = e.indexOf(t, n);
    if (o === -1) return o;
    if (o === 0 || e.charCodeAt(o - 1) <= 32) {
      let i = t.length;
      if (o + i === r || e.charCodeAt(o + i) <= 32) return o;
    }
    n = o + 1;
  }
}
var Id = `ng-template`;
function _m(e, t, n, r) {
  let o = 0;
  if (r) {
    for (; o < t.length && typeof t[o] == `string`; o += 2)
      if (t[o] === `class` && bm(t[o + 1].toLowerCase(), n, 0) !== -1) return !0;
  } else if (Na(e)) return !1;
  if (((o = t.indexOf(1, o)), o > -1)) {
    let i;
    for (; ++o < t.length && typeof (i = t[o]) == `string`;) if (i.toLowerCase() === n) return !0;
  }
  return !1;
}
function Na(e) {
  return e.type === 4 && e.value !== Id;
}
function Mm(e, t, n) {
  return t === (e.type === 4 && !n ? Id : e.value);
}
function Nm(e, t, n) {
  let r = 4,
    o = e.attrs,
    i = o !== null ? Am(o) : 0,
    s = !1;
  for (let a = 0; a < t.length; a++) {
    let c = t[a];
    if (typeof c == `number`) {
      if (!s && !me$1(r) && !me$1(c)) return !1;
      if (s && me$1(c)) continue;
      ((s = !1), (r = c | (r & 1)));
      continue;
    }
    if (!s)
      if (r & 4) {
        if (((r = 2 | (r & 1)), (c !== `` && !Mm(e, c, n)) || (c === `` && t.length === 1))) {
          if (me$1(r)) return !1;
          s = !0;
        }
      } else if (r & 8) {
        if (o === null || !_m(e, o, c, n)) {
          if (me$1(r)) return !1;
          s = !0;
        }
      } else {
        let l = t[++a],
          u = Sm(c, o, Na(e), n);
        if (u === -1) {
          if (me$1(r)) return !1;
          s = !0;
          continue;
        }
        if (l !== ``) {
          let d;
          if ((u > i ? (d = ``) : (d = o[u + 1].toLowerCase()), r & 2 && l !== d)) {
            if (me$1(r)) return !1;
            s = !0;
          }
        }
      }
  }
  return me$1(r) || s;
}
function me$1(e) {
  return (e & 1) === 0;
}
function Sm(e, t, n, r) {
  if (t === null) return -1;
  let o = 0;
  if (r || !n) {
    let i = !1;
    for (; o < t.length;) {
      let s = t[o];
      if (s === e) return o;
      if (s === 3 || s === 6) i = !0;
      else if (s === 1 || s === 2) {
        let a = t[++o];
        for (; typeof a == `string`;) a = t[++o];
        continue;
      } else {
        if (s === 4) break;
        if (s === 0) {
          o += 4;
          continue;
        }
      }
      o += i ? 1 : 2;
    }
    return -1;
  } else return Om(t, e);
}
function Ed(e, t, n = !1) {
  for (let r = 0; r < t.length; r++) if (Nm(e, t[r], n)) return !0;
  return !1;
}
function xm(e) {
  let t = e.attrs;
  if (t != null) {
    let n = t.indexOf(5);
    if ((n & 1) === 0) return t[n + 1];
  }
  return null;
}
function Am(e) {
  for (let t = 0; t < e.length; t++) {
    let n = e[t];
    if (ju(n)) return t;
  }
  return e.length;
}
function Om(e, t) {
  let n = e.indexOf(4);
  if (n > -1)
    for (n++; n < e.length;) {
      let r = e[n];
      if (typeof r == `number`) return -1;
      if (r === t) return n;
      n++;
    }
  return -1;
}
function Rm(e, t) {
  e: for (let n = 0; n < t.length; n++) {
    let r = t[n];
    if (e.length === r.length) {
      for (let o = 0; o < e.length; o++) if (e[o] !== r[o]) continue e;
      return !0;
    }
  }
  return !1;
}
function cu(e, t) {
  return e ? `:not(` + t.trim() + `)` : t;
}
function km(e) {
  let t = e[0],
    n = 1,
    r = 2,
    o = ``,
    i = !1;
  for (; n < e.length;) {
    let s = e[n];
    if (typeof s == `string`)
      if (r & 2) {
        let a = e[++n];
        o += `[` + s + (a.length > 0 ? `="` + a + `"` : ``) + `]`;
      } else r & 8 ? (o += `.` + s) : r & 4 && (o += ` ` + s);
    else (o !== `` && !me$1(s) && ((t += cu(i, o)), (o = ``)), (r = s), (i = i || !me$1(r)));
    n++;
  }
  return (o !== `` && (t += cu(i, o)), t);
}
function Lm(e) {
  return e.map(km).join(`,`);
}
function Pm(e) {
  let t = [],
    n = [],
    r = 1,
    o = 2;
  for (; r < e.length;) {
    let i = e[r];
    if (typeof i == `string`) o === 2 ? i !== `` && t.push(i, e[++r]) : o === 8 && n.push(i);
    else {
      if (!me$1(o)) break;
      o = i;
    }
    r++;
  }
  return (n.length && t.push(1, ...n), t);
}
var te$1 = {};
var Po$1 = (function (e) {
  return ((e[(e.Important = 1)] = `Important`), (e[(e.DashCase = 2)] = `DashCase`), e);
})(Po$1 || {});
var Fm;
function Sa(e, t) {
  return Fm(e, t);
}
var an$2 = new Set();
typeof document < `u` && document?.documentElement?.getAnimations;
var ra = new WeakMap();
function Dd(e) {
  return e ? (e[Ze$1] ?? e) : null;
}
var Bn$1 = new WeakSet();
function jm(e, t, n) {
  let r = ra.get(e);
  if (!r || r.length === 0) return;
  let o = t.parentNode,
    i = t.previousSibling,
    s = Dd(n);
  for (let a = r.length - 1; a >= 0; a--) {
    let { el: c, declarationView: l } = r[a],
      u = c.parentNode;
    c === t
      ? (r.splice(a, 1), Bn$1.add(c), c.dispatchEvent(new CustomEvent(`animationend`, { detail: { cancel: !0 } })))
      : i && c === i
        ? (r.splice(a, 1),
          c.dispatchEvent(new CustomEvent(`animationend`, { detail: { cancel: !0 } })),
          c.parentNode?.removeChild(c))
        : u &&
          o &&
          u !== o &&
          (s === null || l === null || s === l) &&
          (r.splice(a, 1),
          c.dispatchEvent(new CustomEvent(`animationend`, { detail: { cancel: !0 } })),
          c.parentNode?.removeChild(c));
  }
}
function Vm(e, t, n) {
  let r = Dd(n),
    o = ra.get(e);
  o ? o.some((i) => i.el === t) || o.push({ el: t, declarationView: r }) : ra.set(e, [{ el: t, declarationView: r }]);
}
var Yo = (function (e) {
  return ((e[(e.CHANGE_DETECTION = 0)] = `CHANGE_DETECTION`), (e[(e.AFTER_NEXT_RENDER = 1)] = `AFTER_NEXT_RENDER`), e);
})(Yo || {});
var Ot = new A$1(``);
var lu = new Set();
function Rt$1(e) {
  lu.has(e) || (lu.add(e), performance?.mark?.(`mark_feature_usage`, { detail: { feature: e } }));
}
var Ko = (() => {
  class e {
    impl = null;
    execute() {
      this.impl?.execute();
    }
    static ɵprov = se$1({ token: e, providedIn: `root`, factory: () => new e() });
  }
  return e;
})();
var xa = [0, 1, 2, 3];
var Aa = (() => {
  class e {
    ngZone = w(Ce$1);
    scheduler = w(be$1);
    errorHandler = w(yt$2, { optional: !0 });
    sequences = new Set();
    deferredRegistrations = new Set();
    executing = !1;
    constructor() {
      w(Ot, { optional: !0 });
    }
    execute() {
      let n = this.sequences.size > 0;
      (n && O$1(N$1.AfterRenderHooksStart), (this.executing = !0));
      for (let r of xa)
        for (let o of this.sequences)
          if (!(o.erroredOrDestroyed || !o.hooks[r]))
            try {
              o.pipelinedValue = this.ngZone.runOutsideAngular(() =>
                this.maybeTrace(() => {
                  let i = o.hooks[r];
                  return i(o.pipelinedValue);
                }, o.snapshot),
              );
            } catch (i) {
              ((o.erroredOrDestroyed = !0), this.errorHandler?.handleError(i));
            }
      this.executing = !1;
      for (let r of this.sequences) (r.afterRun(), r.once && (this.sequences.delete(r), r.destroy()));
      for (let r of this.deferredRegistrations) this.sequences.add(r);
      (this.deferredRegistrations.size > 0 && this.scheduler.notify(7),
        this.deferredRegistrations.clear(),
        n && O$1(N$1.AfterRenderHooksEnd));
    }
    register(n) {
      let { view: r } = n;
      r !== void 0
        ? ((r[Dt$1] ??= []).push(n), bt(r), (r[I$1] |= 8192))
        : this.executing
          ? this.deferredRegistrations.add(n)
          : this.addSequence(n);
    }
    addSequence(n) {
      (this.sequences.add(n), this.scheduler.notify(7));
    }
    unregister(n) {
      this.executing && this.sequences.has(n)
        ? ((n.erroredOrDestroyed = !0), (n.pipelinedValue = void 0), (n.once = !0))
        : (this.sequences.delete(n), this.deferredRegistrations.delete(n));
    }
    maybeTrace(n, r) {
      return r ? r.run(Yo.AFTER_NEXT_RENDER, n) : n();
    }
    static ɵprov = se$1({ token: e, providedIn: `root`, factory: () => new e() });
  }
  return e;
})();
var Gn$2 = class {
  impl;
  hooks;
  view;
  once;
  snapshot;
  erroredOrDestroyed = !1;
  pipelinedValue = void 0;
  unregisterOnDestroy;
  constructor(t, n, r, o, i, s = null) {
    ((this.impl = t),
      (this.hooks = n),
      (this.view = r),
      (this.once = o),
      (this.snapshot = s),
      (this.unregisterOnDestroy = i?.onDestroy(() => this.destroy())));
  }
  afterRun() {
    ((this.erroredOrDestroyed = !1), (this.pipelinedValue = void 0), this.snapshot?.dispose(), (this.snapshot = null));
  }
  destroy() {
    (this.impl.unregister(this), this.unregisterOnDestroy?.());
    let t = this.view?.[Dt$1];
    t && (this.view[Dt$1] = t.filter((n) => n !== this));
  }
};
function Hm(e, t) {
  let n = t?.injector ?? w(Te$1);
  return (Rt$1(`NgAfterNextRender`), $m(e, n, t, !0));
}
function Bm(e) {
  return e instanceof Function ? [void 0, void 0, e, void 0] : [e.earlyRead, e.write, e.mixedReadWrite, e.read];
}
function $m(e, t, n, r) {
  let o = t.get(Ko);
  o.impl ??= t.get(Aa);
  let i = t.get(Ot, null, { optional: !0 }),
    s = n?.manualCleanup !== !0 ? t.get(we$2) : null,
    a = t.get(tn$2, null, { optional: !0 }),
    c = new Gn$2(o.impl, Bm(e), a?.view, r, s, i?.snapshot(null));
  return (o.impl.register(c), c);
}
var Oa = new A$1(``, {
  factory: () => {
    let e = w(ie$1),
      t = new Set();
    return (e.onDestroy(() => t.clear()), { queue: t, isScheduled: !1, scheduler: null, injector: e });
  },
});
function Td(e, t, n) {
  let r = e.get(Oa);
  if (Array.isArray(t)) for (let o of t) (r.queue.add(o), n?.detachedLeaveAnimationFns?.push(o));
  else (r.queue.add(t), n?.detachedLeaveAnimationFns?.push(t));
  r.scheduler && r.scheduler(e);
}
function Um(e, t) {
  let n = e.get(Oa);
  if (Array.isArray(t)) for (let r of t) n.queue.delete(r);
  else n.queue.delete(t);
}
function Wm(e, t) {
  let n = e.get(Oa);
  if (t.detachedLeaveAnimationFns) {
    for (let r of t.detachedLeaveAnimationFns) n.queue.delete(r);
    t.detachedLeaveAnimationFns = void 0;
  }
}
function qm(e, t) {
  for (let [n, r] of t) Td(e, r.animateFns);
}
function uu(e, t, n, r) {
  let o = e?.[xe$2]?.enter;
  t !== null && o && o.has(n.index) && qm(r, o);
}
function du(e, t, n, r) {
  try {
    n.get(kn$2);
  } catch {
    return r(!1);
  }
  let o = e?.[xe$2];
  o?.enter?.has(t.index) && Um(n, o.enter.get(t.index).animateFns);
  let i = Gm(e, t, o);
  if (i.size === 0) {
    let s = !1;
    if (e) {
      let a = [];
      (Jo(e, t, a), (s = a.length > 0));
    }
    if (!s) return r(!1);
  }
  (e && an$2.add(e[Se$1]), Td(n, () => zm(e, t, o || void 0, i, r), o || void 0));
}
function Gm(e, t, n) {
  let r = new Map(),
    o = n?.leave;
  if ((o && o.has(t.index) && r.set(t.index, o.get(t.index)), e && o))
    for (let [i, s] of o) {
      if (r.has(i)) continue;
      let c = e[m$2].data[i].parent;
      for (; c;) {
        if (c === t) {
          r.set(i, s);
          break;
        }
        c = c.parent;
      }
    }
  return r;
}
function zm(e, t, n, r, o) {
  let i = [];
  if (n && n.leave)
    for (let [s] of r) {
      if (!n.leave.has(s)) continue;
      let a = n.leave.get(s);
      for (let c of a.animateFns) {
        let { promise: l } = c();
        i.push(l);
      }
      n.detachedLeaveAnimationFns = void 0;
    }
  if ((e && Jo(e, t, i), i.length > 0)) {
    let s = n || e?.[xe$2];
    if (s) {
      let a = s.running;
      (a && i.push(a), (s.running = Promise.allSettled(i)), Zm(e, s.running, o));
    } else
      Promise.allSettled(i).then(() => {
        (e && an$2.delete(e[Se$1]), o(!0));
      });
  } else (e && an$2.delete(e[Se$1]), o(!1));
}
function Jo(e, t, n) {
  if (t.type & 12) {
    let o = e[t.index];
    if (ce$2(o))
      for (let i = P$2; i < o.length; i++) {
        let s = o[i];
        s[m$2].type === 2 && Qm(s, n);
      }
  }
  let r = t.child;
  for (; r;) (Jo(e, r, n), (r = r.next));
}
function Qm(e, t) {
  let n = e[xe$2];
  if (n && n.leave)
    for (let o of n.leave.values())
      for (let i of o.animateFns) {
        let { promise: s } = i();
        t.push(s);
      }
  let r = e[m$2].firstChild;
  for (; r;) (Jo(e, r, t), (r = r.next));
}
function Zm(e, t, n) {
  t.then(() => {
    (e[xe$2]?.running === t && ((e[xe$2].running = void 0), an$2.delete(e[Se$1])), n(!0));
  });
}
function nn$2(e, t, n, r, o, i, s, a) {
  if (o != null) {
    let c,
      l = !1;
    ce$2(o) ? (c = o) : Ve$1(o) && ((l = !0), (o = o[pe$2]));
    let u = z$1(o);
    (e === 0 && r !== null
      ? (uu(a, r, i, n), s == null ? md(t, r, u) : Nt(t, r, u, s || null, !0))
      : e === 1 && r !== null
        ? (uu(a, r, i, n), Nt(t, r, u, s || null, !0), jm(i, u, a))
        : e === 2
          ? (a?.[xe$2]?.leave?.has(i.index) && Vm(i, u, a),
            Bn$1.delete(u),
            du(a, i, n, (d) => {
              if (Bn$1.has(u)) {
                Bn$1.delete(u);
                return;
              }
              yd(t, u, l, d);
            }))
          : e === 3 &&
            (Bn$1.delete(u),
            du(a, i, n, () => {
              t.destroyNode(u);
            })),
      c != null && sy(t, e, n, c, i, r, s));
  }
}
function Ym(e, t) {
  (wd(e, t), (t[pe$2] = null), (t[G$2] = null));
}
function Km(e, t, n, r, o, i) {
  ((r[pe$2] = o), (r[G$2] = t), ei$2(e, r, n, 1, o, i));
}
function wd(e, t) {
  (t[Me$2].changeDetectionScheduler?.notify(9), ei$2(e, t, t[k$1], 2, null, null));
}
function Jm(e) {
  let t = e[Jt$2];
  if (!t) return Rs(e[m$2], e);
  for (; t;) {
    let n = null;
    if (Ve$1(t)) n = t[Jt$2];
    else {
      let r = t[P$2];
      r && (n = r);
    }
    if (!n) {
      for (; t && !t[ae$1] && t !== e;) (Ve$1(t) && Rs(t[m$2], t), (t = t[H]));
      (t === null && (t = e), Ve$1(t) && Rs(t[m$2], t), (n = t && t[ae$1]));
    }
    t = n;
  }
}
function Ra(e, t) {
  let n = e[wt],
    r = n.indexOf(t);
  n.splice(r, 1);
}
function Xo(e, t) {
  if (Ct(t)) return;
  let n = t[k$1];
  (n.destroyNode && ei$2(e, t, n, 3, null, null), Jm(t));
}
function Rs(e, t) {
  if (Ct(t)) return;
  let n = y$1(null);
  try {
    ((t[I$1] &= -129), (t[I$1] |= 256), t[re] && We(t[re]), ey(e, t), Xm(e, t), t[m$2].type === 1 && t[k$1].destroy());
    let r = t[Ye$1];
    if (r !== null && ce$2(t[H])) {
      r !== t[H] && Ra(r, t);
      let o = t[Ne$2];
      o !== null && o.detachView(e);
    }
    Gs(t);
  } finally {
    y$1(n);
  }
}
function Xm(e, t) {
  let n = e.cleanup,
    r = t[Kt$1];
  if (n !== null)
    for (let s = 0; s < n.length - 1; s += 2)
      if (typeof n[s] == `string`) {
        let a = n[s + 3];
        (a >= 0 ? r[a]() : r[-a].unsubscribe(), (s += 2));
      } else {
        let a = r[n[s + 1]];
        n[s].call(a);
      }
  r !== null && (t[Kt$1] = null);
  let o = t[Pe$2];
  if (o !== null) {
    t[Pe$2] = null;
    for (let s = 0; s < o.length; s++) {
      let a = o[s];
      a();
    }
  }
  let i = t[Fe];
  if (i !== null) {
    t[Fe] = null;
    for (let s of i) s.destroy();
  }
}
function ey(e, t) {
  let n;
  if (e != null && (n = e.destroyHooks) != null)
    for (let r = 0; r < n.length; r += 2) {
      let o = t[n[r]];
      if (!(o instanceof St$1)) {
        let i = n[r + 1];
        if (Array.isArray(i))
          for (let s = 0; s < i.length; s += 2) {
            let a = o[i[s]],
              c = i[s + 1];
            O$1(N$1.LifecycleHookStart, a, c);
            try {
              c.call(a);
            } finally {
              O$1(N$1.LifecycleHookEnd, a, c);
            }
          }
        else {
          O$1(N$1.LifecycleHookStart, o, i);
          try {
            i.call(o);
          } finally {
            O$1(N$1.LifecycleHookEnd, o, i);
          }
        }
      }
    }
}
function Cd(e, t, n) {
  if (t === null) throw new M$1(510, !1);
  return ty(e, t.parent, n);
}
function ty(e, t, n) {
  let r = t;
  for (; r !== null && r.type & 168;) ((t = r), (r = t.parent));
  if (r === null) return n[pe$2];
  if (He$1(r)) {
    let { encapsulation: o } = e.data[r.directiveStart + r.componentOffset];
    if (o === xt$1.None || o === xt$1.Emulated) return null;
  }
  return ge$2(r, n);
}
function bd(e, t, n) {
  return ry(e, t, n);
}
function ny(e, t, n) {
  return e.type & 40 ? ge$2(e, n) : null;
}
var ry = ny;
var fu;
function ka(e, t, n, r) {
  let o = Cd(e, r, t),
    i = t[k$1],
    a = bd(r.parent || t[G$2], r, t);
  if (o != null)
    if (Array.isArray(n)) for (let c = 0; c < n.length; c++) au(i, o, n[c], a, !1);
    else au(i, o, n, a, !1);
  fu !== void 0 && fu(i, r, t, n, o);
}
function $n$2(e, t) {
  if (t !== null) {
    let n = t.type;
    if (n & 3) return ge$2(t, e);
    if (n & 4) return oa(-1, e[t.index]);
    if (n & 8) {
      let r = t.child;
      if (r !== null) return $n$2(e, r);
      {
        let o = e[t.index];
        return ce$2(o) ? oa(-1, o) : z$1(o);
      }
    } else {
      if (n & 128) return $n$2(e, t.next);
      if (n & 32) return Sa(t, e)() || z$1(e[t.index]);
      {
        let r = _d(e, t);
        if (r !== null) {
          if (Array.isArray(r)) return r[0];
          return $n$2(je$2(e[X$1]), r);
        } else return $n$2(e, t.next);
      }
    }
  }
  return null;
}
function _d(e, t) {
  if (t !== null) {
    let r = e[X$1][G$2],
      o = t.projection;
    return r.projection[o];
  }
  return null;
}
function oa(e, t) {
  let n = P$2 + e + 1;
  if (n < t.length) {
    let r = t[n],
      o = r[m$2].firstChild;
    if (o !== null) return $n$2(r, o);
  }
  return t[Tt];
}
function La(e, t, n, r, o, i, s) {
  for (; n != null;) {
    let a = r[_e$1];
    if (n.type === 128) {
      n = n.next;
      continue;
    }
    let c = r[n.index],
      l = n.type;
    if ((s && t === 0 && (c && sn$2(z$1(c), r), (n.flags |= 2)), !Qo(n)))
      if (l & 8) (La(e, t, n.child, r, o, i, !1), nn$2(t, e, a, o, c, n, i, r));
      else if (l & 32) {
        let u = Sa(n, r),
          d;
        for (; (d = u());) nn$2(t, e, a, o, d, n, i, r);
        nn$2(t, e, a, o, c, n, i, r);
      } else l & 16 ? Md(e, t, r, n, o, i) : nn$2(t, e, a, o, c, n, i, r);
    n = s ? n.projectionNext : n.next;
  }
}
function ei$2(e, t, n, r, o, i) {
  e.type === 3 ? oy(n, r, t, o, i) : La(n, r, e.firstChild, t, o, i, !1);
}
function oy(e, t, n, r, o) {
  let s = n[m$2].firstChild,
    a = s.next,
    c = z$1(n[s.index]),
    l = z$1(n[a.index]),
    u = a.index + 1,
    d = n[u];
  if (t === 1 || t === 0)
    r !== null && (d && d.hasChildNodes() ? Nt(e, r, d, o, !0) : (Nt(e, r, c, o, !0), Nt(e, r, l, o, !0)));
  else if (t === 2) {
    if ((d || ((d = document.createDocumentFragment()), (n[u] = d)), c && c.parentNode === d)) return;
    let p = c;
    for (; p !== null;) {
      let f = p.nextSibling;
      if ((d.appendChild(p), p === l)) break;
      p = f;
    }
  }
}
function iy(e, t, n) {
  let r = t[k$1];
  Md(r, 0, t, n, Cd(e, n, t), bd(n.parent || t[G$2], n, t));
}
function Md(e, t, n, r, o, i) {
  let s = n[X$1],
    c = s[G$2].projection[r.projection];
  if (Array.isArray(c))
    for (let l = 0; l < c.length; l++) {
      let u = c[l];
      nn$2(t, e, n[_e$1], o, u, r, i, n);
    }
  else {
    let l = c,
      u = s[H];
    (Zu(r) && (l.flags |= 128), La(e, t, l, u, o, i, !0));
  }
}
function sy(e, t, n, r, o, i, s) {
  let a = r[Tt];
  if ((a !== z$1(r) && nn$2(t, e, n, i, a, o, s), (r[I$1] & 4) === 0))
    for (let l = P$2; l < r.length; l++) {
      let u = r[l];
      ei$2(u[m$2], u, e, t, i, a);
    }
}
function ay(e, t, n, r, o) {
  if (t) o ? e.addClass(n, r) : e.removeClass(n, r);
  else {
    let i = r.indexOf(`-`) === -1 ? void 0 : Po$1.DashCase;
    o == null
      ? e.removeStyle(n, r, i)
      : (typeof o == `string` && o.endsWith(`!important`) && ((o = o.slice(0, -10)), (i |= Po$1.Important)),
        e.setStyle(n, r, o, i));
  }
}
function Pa(e, t, n, r, o, i, s, a, c, l, u) {
  let d = L + r,
    p = d + o,
    f = cy(d, p),
    h = typeof l == `function` ? l() : l;
  return (f[m$2] = {
    type: e,
    blueprint: f,
    template: n,
    queries: null,
    viewQuery: a,
    declTNode: t,
    data: f.slice().fill(null, d),
    bindingStartIndex: d,
    expandoStartIndex: p,
    hostBindingOpCodes: null,
    firstCreatePass: !0,
    firstUpdatePass: !0,
    staticViewQueries: !1,
    staticContentQueries: !1,
    preOrderHooks: null,
    preOrderCheckHooks: null,
    contentHooks: null,
    contentCheckHooks: null,
    viewHooks: null,
    viewCheckHooks: null,
    destroyHooks: null,
    cleanup: null,
    contentQueries: null,
    components: null,
    directiveRegistry: typeof i == `function` ? i() : i,
    pipeRegistry: typeof s == `function` ? s() : s,
    firstChild: null,
    schemas: c,
    consts: h,
    incompleteFirstPass: !1,
    ssrId: u,
  });
}
function cy(e, t) {
  let n = [];
  for (let r = 0; r < t; r++) n.push(r < e ? null : te$1);
  return n;
}
function ly(e) {
  let t = e.tView;
  return t === null || t.incompleteFirstPass
    ? (e.tView = Pa(
        1,
        null,
        e.template,
        e.decls,
        e.vars,
        e.directiveDefs,
        e.pipeDefs,
        e.viewQuery,
        e.schemas,
        e.consts,
        e.id,
      ))
    : t;
}
function Fa(e, t, n, r, o, i, s, a, c, l, u) {
  let d = t.blueprint.slice();
  return (
    (d[pe$2] = o),
    (d[I$1] = r | 1228),
    (l !== null || (e && e[I$1] & 2048)) && (d[I$1] |= 2048),
    cs(d),
    (d[H] = d[Ze$1] = e),
    (d[j$1] = n),
    (d[Me$2] = s || (e && e[Me$2])),
    (d[k$1] = a || (e && e[k$1])),
    (d[_e$1] = c || (e && e[_e$1]) || null),
    (d[G$2] = i),
    (d[Se$1] = $g()),
    (d[It] = u),
    (d[ts] = l),
    (d[X$1] = t.type == 2 ? e[X$1] : d),
    d
  );
}
function uy(e, t, n) {
  let r = ge$2(t, e),
    o = ly(n),
    i = e[Me$2].rendererFactory,
    s = ja(e, Fa(e, o, null, Nd(n), r, t, null, i.createRenderer(r, n), null, null, null));
  return (e[t.index] = s);
}
function Nd(e) {
  let t = 16;
  return (e.signals ? (t = 4096) : e.onPush && (t = 64), t);
}
function Sd(e, t, n, r) {
  if (n === 0) return -1;
  let o = t.length;
  for (let i = 0; i < n; i++) (t.push(r), e.blueprint.push(r), e.data.push(null));
  return o;
}
function ja(e, t) {
  return (e[Jt$2] ? (e[es][ae$1] = t) : (e[Jt$2] = t), (e[es] = t), t);
}
function dy(e = 1) {
  xd(F$2(), E$1(), Ae$1() + e, !1);
}
function xd(e, t, n, r) {
  if (!r)
    if ((t[I$1] & 3) === 3) {
      let i = e.preOrderCheckHooks;
      i !== null && bo$1(t, i, n);
    } else {
      let i = e.preOrderHooks;
      i !== null && _o$1(t, i, 0, n);
    }
  Ke$1(n);
}
var ti$2 = (function (e) {
  return (
    (e[(e.None = 0)] = `None`),
    (e[(e.SignalBased = 1)] = `SignalBased`),
    (e[(e.HasDecoratorInputTransform = 2)] = `HasDecoratorInputTransform`),
    e
  );
})(ti$2 || {});
function ia(e, t, n, r) {
  let o = y$1(null);
  try {
    let [i, s, a] = e.inputs[n],
      c = null;
    ((s & ti$2.SignalBased) !== 0 && (c = t[i][W]),
      c !== null && c.transformFn !== void 0 ? (r = c.transformFn(r)) : a !== null && (r = a.call(t, r)),
      e.setInput !== null ? e.setInput(t, c, r, n, i) : Ru(t, c, i, r));
  } finally {
    y$1(o);
  }
}
function Ad(e, t, n, r, o) {
  let i = Ae$1(),
    s = r & 2;
  try {
    (Ke$1(-1), s && t.length > L && xd(e, t, L, !1));
    (O$1(s ? N$1.TemplateUpdateStart : N$1.TemplateCreateStart, o, n), n(r, o));
  } finally {
    Ke$1(i);
    O$1(s ? N$1.TemplateUpdateEnd : N$1.TemplateCreateEnd, o, n);
  }
}
function Va(e, t, n) {
  (vy(e, t, n), (n.flags & 64) === 64 && Iy(e, t, n));
}
function ni$2(e, t, n = ge$2) {
  let r = t.localNames;
  if (r !== null) {
    let o = t.index + 1;
    for (let i = 0; i < r.length; i += 2) {
      let s = r[i + 1],
        a = s === -1 ? n(t, e) : e[s];
      e[o++] = a;
    }
  }
}
function fy(e, t, n, r) {
  let i = r.get(od, rd) || n === xt$1.ShadowDom || n === xt$1.ExperimentalIsolatedShadowDom;
  return e.selectRootElement(t, i);
}
function gy(e) {
  return e === `class`
    ? `className`
    : e === `for`
      ? `htmlFor`
      : e === `formaction`
        ? `formAction`
        : e === `innerHtml`
          ? `innerHTML`
          : e === `readonly`
            ? `readOnly`
            : e === `tabindex`
              ? `tabIndex`
              : e;
}
function my(e, t, n, r, o, i) {
  let s = t[m$2];
  if (Ha(e, s, t, n, r)) {
    He$1(e) && yy(t, e.index);
    return;
  }
  (e.type & 3 && (n = gy(n)), Od(e, t, n, r, o, i));
}
function Od(e, t, n, r, o, i) {
  if (e.type & 3) {
    let s = ge$2(e, t);
    ((r = i != null ? i(r, e.value || ``, n) : r), o.setProperty(s, n, r));
  } else e.type & 12;
}
function yy(e, t) {
  let n = le$2(t, e);
  n[I$1] & 16 || (n[I$1] |= 64);
}
function vy(e, t, n) {
  let r = n.directiveStart,
    o = n.directiveEnd;
  (He$1(n) && uy(t, n, e.data[r + n.componentOffset]), e.firstCreatePass || ko(n, t));
  let i = n.initialInputs;
  for (let s = r; s < o; s++) {
    let a = e.data[s],
      c = Wn$1(t, e, s, n);
    if ((sn$2(c, t), i !== null && wy(t, s - r, c, a, n, i), he$2(a))) {
      let l = le$2(n.index, t);
      l[j$1] = Wn$1(t, e, s, n);
    }
  }
}
function Iy(e, t, n) {
  let r = n.directiveStart,
    o = n.directiveEnd,
    i = n.index,
    s = Ml();
  try {
    Ke$1(i);
    for (let a = r; a < o; a++) {
      let c = e.data[a],
        l = t[a];
      (ho$1(a), (c.hostBindings !== null || c.hostVars !== 0 || c.hostAttrs !== null) && Ey(c, l));
    }
  } finally {
    (Ke$1(-1), ho$1(s));
  }
}
function Ey(e, t) {
  e.hostBindings !== null && e.hostBindings(1, t);
}
function Rd(e, t) {
  let n = e.directiveRegistry,
    r = null;
  if (n)
    for (let o = 0; o < n.length; o++) {
      let i = n[o];
      Ed(t, i.selectors, !1) && ((r ??= []), he$2(i) ? r.unshift(i) : r.push(i));
    }
  return r;
}
function Dy(e, t, n, r, o, i) {
  let s = ge$2(e, t);
  Ty(t[k$1], s, i, e.value, n, r, o);
}
function Ty(e, t, n, r, o, i, s) {
  if (i == null) (s?.(i, r || ``, o), e.removeAttribute(t, o, n));
  else {
    let a = s == null ? An$2(i) : s(i, r || ``, o);
    e.setAttribute(t, o, a, n);
  }
}
function wy(e, t, n, r, o, i) {
  let s = i[t];
  if (s !== null)
    for (let a = 0; a < s.length; a += 2) {
      let c = s[a],
        l = s[a + 1];
      ia(r, n, c, l);
    }
}
function kd(e, t, n, r, o) {
  let i = L + n,
    s = t[m$2],
    a = o(s, t, e, r, n);
  ((t[i] = a), en$2(e, !0));
  let c = e.type === 2;
  return (
    c ? (vd(t[k$1], a, e), (yl() === 0 || Pn$2(e)) && sn$2(a, t), vl()) : sn$2(a, t),
    Io() && (!c || !Qo(e)) && ka(s, t, a, e),
    e
  );
}
function Ld(e) {
  let t = e;
  return (vs() ? Is() : ((t = t.parent), en$2(t, !1)), t);
}
function Cy(e, t) {
  let n = e[_e$1];
  if (!n) return;
  let r;
  try {
    r = n.get(Je$2, null);
  } catch {
    r = null;
  }
  r?.(t);
}
function Ha(e, t, n, r, o) {
  let i = e.inputs?.[r],
    s = e.hostDirectiveInputs?.[r],
    a = !1;
  if (s)
    for (let c = 0; c < s.length; c += 2) {
      let l = s[c],
        u = s[c + 1],
        d = t.data[l];
      (ia(d, n[l], u, o), (a = !0));
    }
  if (i)
    for (let c of i) {
      let l = n[c],
        u = t.data[c];
      (ia(u, l, r, o), (a = !0));
    }
  return a;
}
function by(e, t) {
  let n = le$2(t, e),
    r = n[m$2];
  _y(r, n);
  let o = n[pe$2];
  (o !== null && n[It] === null && (n[It] = id(o, n[_e$1])), O$1(N$1.ComponentStart));
  try {
    Ba(r, n, n[j$1]);
  } finally {
    O$1(N$1.ComponentEnd, n[j$1]);
  }
}
function _y(e, t) {
  for (let n = t.length; n < e.blueprint.length; n++) t.push(e.blueprint[n]);
}
function Ba(e, t, n) {
  mo$1(t);
  try {
    let r = e.viewQuery;
    r !== null && Qs(1, r, n);
    let o = e.template;
    (o !== null && Ad(e, t, o, 1, n),
      e.firstCreatePass && (e.firstCreatePass = !1),
      t[Ne$2]?.finishViewCreation(e),
      e.staticContentQueries && sd(e, t),
      e.staticViewQueries && Qs(2, e.viewQuery, n));
    let i = e.components;
    i !== null && My(t, i);
  } catch (r) {
    throw (e.firstCreatePass && ((e.incompleteFirstPass = !0), (e.firstCreatePass = !1)), r);
  } finally {
    ((t[I$1] &= -5), yo$1());
  }
}
function My(e, t) {
  for (let n = 0; n < t.length; n++) by(e, t[n]);
}
function rr$2(e, t, n, r) {
  let o = y$1(null);
  try {
    let i = t.tView,
      c = Fa(
        e,
        i,
        n,
        e[I$1] & 4096 ? 4096 : 16,
        null,
        t,
        null,
        null,
        r?.injector ?? null,
        r?.embeddedViewInjector ?? null,
        r?.dehydratedView ?? null,
      );
    c[Ye$1] = e[t.index];
    let u = e[Ne$2];
    return (u !== null && (c[Ne$2] = u.createEmbeddedView(i)), Ba(i, c, n), c);
  } finally {
    y$1(o);
  }
}
function cn$2(e, t) {
  return !t || t.firstChild === null || Zu(e);
}
function zn$2(e, t, n, r, o = !1) {
  if (e.type === 3) {
    let i = e.firstChild,
      s = i.next,
      a = z$1(t[i.index]),
      c = z$1(t[s.index]),
      l = a;
    for (; l !== null && (r.push(l), l !== c);) l = l.nextSibling;
    return r;
  }
  for (; n !== null;) {
    if (n.type === 128) {
      n = o ? n.projectionNext : n.next;
      continue;
    }
    let i = t[n.index];
    if (i !== null)
      if (ce$2(i)) {
        let a = i[Tt];
        (a !== i[pe$2] && r.push(z$1(i)), i[I$1] & 4 || Pd(i, r), r.push(a));
      } else r.push(z$1(i));
    let s = n.type;
    if (s & 8) zn$2(e, t, n.child, r);
    else if (s & 32) {
      let a = Sa(n, t),
        c;
      for (; (c = a());) r.push(c);
    } else if (s & 16) {
      let a = _d(t, n);
      if (Array.isArray(a)) r.push(...a);
      else {
        let c = je$2(t[X$1]);
        zn$2(c[m$2], c, a, r, !0);
      }
    }
    n = o ? n.projectionNext : n.next;
  }
  return r;
}
function Pd(e, t) {
  for (let n = P$2; n < e.length; n++) {
    let r = e[n],
      o = r[m$2].firstChild;
    o !== null && zn$2(r[m$2], r, o, t);
  }
}
function Fd(e) {
  if (e[Dt$1] !== null) {
    for (let t of e[Dt$1]) t.impl.addSequence(t);
    e[Dt$1].length = 0;
  }
}
var jd = [];
function Ny(e) {
  return e[re] ?? Sy(e);
}
function Sy(e) {
  let t = jd.pop() ?? Object.create(Ay);
  return ((t.lView = e), t);
}
function xy(e) {
  e.lView[re] !== e && ((e.lView = null), jd.push(e));
}
var Ay = m$3(l({}, nt$2), {
  consumerIsAlwaysLive: !0,
  kind: `template`,
  consumerMarkedDirty: (e) => {
    bt(e.lView);
  },
  consumerOnSignalRead() {
    this.lView[re] = this;
  },
});
function Oy(e) {
  let t = e[re] ?? Object.create(Ry);
  return ((t.lView = e), t);
}
var Ry = m$3(l({}, nt$2), {
  consumerIsAlwaysLive: !0,
  kind: `template`,
  consumerMarkedDirty: (e) => {
    let t = je$2(e.lView);
    for (; t && !Vd(t[m$2]);) t = je$2(t);
    t && ls(t);
  },
  consumerOnSignalRead() {
    this.lView[re] = this;
  },
});
function Vd(e) {
  return e.type !== 2;
}
function Hd(e) {
  if (e[Fe] === null) return;
  let t = !0;
  for (; t;) {
    let n = !1;
    for (let r of e[Fe])
      if (
        r.dirty &&
        ((n = !0), r.zone === null || Zone.current === r.zone ? r.run() : r.zone.run(() => r.run()), e[Fe] === null)
      )
        return;
    t = n && !!(e[I$1] & 8192);
  }
}
var ky = 100;
function Bd(e, t = 0) {
  let r = e[Me$2].rendererFactory;
  r.begin?.();
  try {
    Ly(e, t);
  } finally {
    r.end?.();
  }
}
function Ly(e, t) {
  let n = Es();
  try {
    (Cn$2(!0), sa(e, t));
    let r = 0;
    for (; Fn$2(e);) {
      if (r === ky) throw new M$1(103, !1);
      (r++, sa(e, 1));
    }
  } finally {
    Cn$2(n);
  }
}
function Py(e, t, n, r) {
  if (Ct(t)) return;
  let o = t[I$1];
  mo$1(t);
  let a = !0,
    c = null,
    l = null;
  Vd(e)
    ? ((l = Ny(t)), (c = Ue$2(l)))
    : fr$1() === null
      ? ((a = !1), (l = Oy(t)), (c = Ue$2(l)))
      : t[re] && (We(t[re]), (t[re] = null));
  try {
    (cs(t), Cl(e.bindingStartIndex), n !== null && Ad(e, t, n, 2, r));
    let u = (o & 3) === 3;
    if (u) {
      let f = e.preOrderCheckHooks;
      f !== null && bo$1(t, f, null);
    } else {
      let f = e.preOrderHooks;
      (f !== null && _o$1(t, f, 0, null), As(t, 0));
    }
    if ((Fy(t), Hd(t), $d(t, 0), e.contentQueries !== null && sd(e, t), true))
      if (u) {
        let f = e.contentCheckHooks;
        f !== null && bo$1(t, f);
      } else {
        let f = e.contentHooks;
        (f !== null && _o$1(t, f, 1), As(t, 1));
      }
    Vy(e, t);
    let d = e.components;
    d !== null && Wd(t, d, 0);
    let p = e.viewQuery;
    if ((p !== null && Qs(2, p, r), true))
      if (u) {
        let f = e.viewCheckHooks;
        f !== null && bo$1(t, f);
      } else {
        let f = e.viewHooks;
        (f !== null && _o$1(t, f, 2), As(t, 2));
      }
    if ((e.firstUpdatePass === !0 && (e.firstUpdatePass = !1), t[so$1])) {
      for (let f of t[so$1]) f();
      t[so$1] = null;
    }
    (Fd(t), (t[I$1] &= -73));
  } catch (u) {
    throw (bt(t), u);
  } finally {
    (l !== null && (ot$2(l, c), a && xy(l)), yo$1());
  }
}
function $d(e, t) {
  for (let n = Ku(e); n !== null; n = Ju(n))
    for (let r = P$2; r < n.length; r++) {
      let o = n[r];
      Ud(o, t);
    }
}
function Fy(e) {
  for (let t = Ku(e); t !== null; t = Ju(t)) {
    if (!(t[I$1] & 2)) continue;
    let n = t[wt];
    for (let r = 0; r < n.length; r++) {
      let o = n[r];
      ls(o);
    }
  }
}
function jy(e, t, n) {
  O$1(N$1.ComponentStart);
  let r = le$2(t, e);
  try {
    Ud(r, n);
  } finally {
    O$1(N$1.ComponentEnd, r[j$1]);
  }
}
function Ud(e, t) {
  lo$1(e) && sa(e, t);
}
function sa(e, t) {
  let r = e[m$2],
    o = e[I$1],
    i = e[re],
    s = !!(t === 0 && o & 16);
  if (
    ((s ||= !!(o & 64 && t === 0)),
    (s ||= !!(o & 1024)),
    (s ||= !!(i?.dirty && kt$1(i))),
    (s ||= !1),
    i && (i.dirty = !1),
    (e[I$1] &= -9217),
    s)
  )
    Py(r, e, r.template, e[j$1]);
  else if (o & 8192) {
    let a = y$1(null);
    try {
      (Hd(e), $d(e, 1));
      let c = r.components;
      (c !== null && Wd(e, c, 1), Fd(e));
    } finally {
      y$1(a);
    }
  }
}
function Wd(e, t, n) {
  for (let r = 0; r < t.length; r++) jy(e, t[r], n);
}
function Vy(e, t) {
  let n = e.hostBindingOpCodes;
  if (n !== null)
    try {
      for (let r = 0; r < n.length; r++) {
        let o = n[r];
        if (o < 0) Ke$1(~o);
        else {
          let i = o,
            s = n[++r],
            a = n[++r];
          _l(s, i);
          let c = t[i];
          O$1(N$1.HostBindingsUpdateStart, c);
          try {
            a(2, c);
          } finally {
            O$1(N$1.HostBindingsUpdateEnd, c);
          }
        }
      }
    } finally {
      Ke$1(-1);
    }
}
function $a(e, t) {
  let n = Es() ? 64 : 1088;
  for (e[Me$2].changeDetectionScheduler?.notify(t); e;) {
    e[I$1] |= n;
    let r = je$2(e);
    if (Xt$2(e) && !r) return e;
    e = r;
  }
  return null;
}
function qd(e, t, n, r) {
  return [e, !0, 0, t, null, r, null, n, null, null];
}
function Gd(e, t) {
  let n = P$2 + t;
  if (n < e.length) return e[n];
}
function or$2(e, t, n, r = !0) {
  let o = t[m$2];
  if ((Hy(o, t, e, n), r)) {
    let s = oa(n, e),
      a = t[k$1],
      c = a.parentNode(e[Tt]);
    c !== null && Km(o, e[G$2], a, t, c, s);
  }
  let i = t[It];
  i !== null && i.firstChild !== null && (i.firstChild = null);
}
function zd(e, t) {
  let n = Qn$1(e, t);
  return (n !== void 0 && Xo(n[m$2], n), n);
}
function Qn$1(e, t) {
  if (e.length <= P$2) return;
  let n = P$2 + t,
    r = e[n];
  if (r) {
    let o = r[Ye$1];
    (o !== null && o !== e && Ra(o, r), t > 0 && (e[n - 1][ae$1] = r[ae$1]));
    let i = On$2(e, P$2 + t);
    Ym(r[m$2], r);
    let s = i[Ne$2];
    (s !== null && s.detachView(i[m$2]), (r[H] = null), (r[ae$1] = null), (r[I$1] &= -129));
  }
  return r;
}
function Hy(e, t, n, r) {
  let o = P$2 + r,
    i = n.length;
  (r > 0 && (n[o - 1][ae$1] = t),
    r < i - P$2 ? ((t[ae$1] = n[o]), Qi$1(n, P$2 + r, t)) : (n.push(t), (t[ae$1] = null)),
    (t[H] = n));
  let s = t[Ye$1];
  s !== null && n !== s && Qd(s, t);
  let a = t[Ne$2];
  (a !== null && a.insertView(e), uo$1(t), (t[I$1] |= 128));
}
function Qd(e, t) {
  let n = e[wt],
    r = t[H];
  if (Ve$1(r)) e[I$1] |= 2;
  else {
    let o = r[H][X$1];
    t[X$1] !== o && (e[I$1] |= 2);
  }
  n === null ? (e[wt] = [t]) : n.push(t);
}
var et$2 = class {
  _lView;
  _cdRefInjectingView;
  _appRef = null;
  _attachedToViewContainer = !1;
  exhaustive;
  get rootNodes() {
    let t = this._lView,
      n = t[m$2];
    return zn$2(n, t, n.firstChild, []);
  }
  constructor(t, n) {
    ((this._lView = t), (this._cdRefInjectingView = n));
  }
  get context() {
    return this._lView[j$1];
  }
  set context(t) {
    this._lView[j$1] = t;
  }
  get destroyed() {
    return Ct(this._lView);
  }
  destroy() {
    if (this._appRef) this._appRef.detachView(this);
    else if (this._attachedToViewContainer) {
      let t = this._lView[H];
      if (ce$2(t)) {
        let n = t[Ln$2],
          r = n ? n.indexOf(this) : -1;
        r > -1 && (Qn$1(t, r), On$2(n, r));
      }
      this._attachedToViewContainer = !1;
    }
    Xo(this._lView[m$2], this._lView);
  }
  onDestroy(t) {
    fo$1(this._lView, t);
  }
  markForCheck() {
    $a(this._cdRefInjectingView || this._lView, 4);
  }
  detach() {
    this._lView[I$1] &= -129;
  }
  reattach() {
    (uo$1(this._lView), (this._lView[I$1] |= 128));
  }
  detectChanges() {
    ((this._lView[I$1] |= 1024), Bd(this._lView));
  }
  checkNoChanges() {}
  attachToViewContainerRef() {
    if (this._appRef) throw new M$1(902, !1);
    this._attachedToViewContainer = !0;
  }
  detachFromAppRef() {
    this._appRef = null;
    let t = Xt$2(this._lView),
      n = this._lView[Ye$1];
    (n !== null && !t && Ra(n, this._lView), wd(this._lView[m$2], this._lView));
  }
  attachToAppRef(t) {
    if (this._attachedToViewContainer) throw new M$1(902, !1);
    this._appRef = t;
    let n = Xt$2(this._lView),
      r = this._lView[Ye$1];
    (r !== null && !n && Qd(r, this._lView), uo$1(this._lView));
  }
};
var Zn$2 = (() => {
  class e {
    _declarationLView;
    _declarationTContainer;
    elementRef;
    static __NG_ELEMENT_ID__ = By;
    constructor(n, r, o) {
      ((this._declarationLView = n), (this._declarationTContainer = r), (this.elementRef = o));
    }
    get ssrId() {
      return this._declarationTContainer.tView?.ssrId || null;
    }
    createEmbeddedView(n, r) {
      return this.createEmbeddedViewImpl(n, r);
    }
    createEmbeddedViewImpl(n, r, o) {
      return new et$2(
        rr$2(this._declarationLView, this._declarationTContainer, n, { embeddedViewInjector: r, dehydratedView: o }),
      );
    }
  }
  return e;
})();
function By() {
  return Ua(Q(), E$1());
}
function Ua(e, t) {
  return e.type & 4 ? new Zn$2(t, e, hn$2(e, t)) : null;
}
function gn$2(e, t, n, r, o) {
  let i = e.data[t];
  if (i === null) ((i = $y(e, t, n, r, o)), bl() && (i.flags |= 32));
  else if (i.type & 64) {
    ((i.type = n), (i.value = r), (i.attrs = o));
    let s = Dl();
    i.injectorIndex = s === null ? -1 : s.injectorIndex;
  }
  return (en$2(i, !0), i);
}
function $y(e, t, n, r, o) {
  let i = ys(),
    s = vs(),
    a = s ? i : i && i.parent,
    c = (e.data[t] = Wy(e, a, n, t, r, o));
  return (Uy(e, c, i, s), c);
}
function Uy(e, t, n, r) {
  (e.firstChild === null && (e.firstChild = t),
    n !== null &&
      (r ? n.child == null && t.parent !== null && (n.child = t) : n.next === null && ((n.next = t), (t.prev = n))));
}
function Wy(e, t, n, r, o, i) {
  let s = t ? t.injectorIndex : -1,
    a = 0;
  return (
    hs() && (a |= 128),
    {
      type: n,
      index: r,
      insertBeforeIndex: null,
      injectorIndex: s,
      directiveStart: -1,
      directiveEnd: -1,
      directiveStylingLast: -1,
      componentOffset: -1,
      controlDirectiveIndex: -1,
      customControlIndex: -1,
      propertyBindings: null,
      flags: a,
      providerIndexes: 0,
      value: o,
      namespace: bs(),
      attrs: i,
      mergedAttrs: null,
      localNames: null,
      initialInputs: null,
      inputs: null,
      hostDirectiveInputs: null,
      outputs: null,
      hostDirectiveOutputs: null,
      directiveToIndex: null,
      tView: null,
      next: null,
      prev: null,
      projectionNext: null,
      child: null,
      parent: t,
      projection: null,
      styles: null,
      stylesWithoutHost: null,
      residualStyles: void 0,
      classes: null,
      classesWithoutHost: null,
      residualClasses: void 0,
      classBindings: 0,
      styleBindings: 0,
    }
  );
}
function qy(e) {
  let t = e[ns] ?? [],
    r = e[H][k$1],
    o = [];
  for (let i of t) i.data[nd] !== void 0 ? o.push(i) : Gy(i, r);
  e[ns] = o;
}
function Gy(e, t) {
  let n = 0,
    r = e.firstChild;
  if (r) {
    let o = e.data[td];
    for (; n < o;) {
      let i = r.nextSibling;
      (yd(t, r, !1), (r = i), n++);
    }
  }
}
var zy = () => null;
var Qy = () => null;
function Fo(e, t) {
  return zy(e, t);
}
function Zd(e, t, n) {
  return Qy(e, t, n);
}
var Yd = class {};
var Yn$2 = class {};
var aa = class {
  destroyNode = null;
  static __NG_ELEMENT_ID__ = () => Zy();
};
function Zy() {
  let e = E$1(),
    n = le$2(Q().index, e);
  return (Ve$1(n) ? n : e)[k$1];
}
var Kd = (() => {
  class e {
    static ɵprov = se$1({ token: e, providedIn: `root`, factory: () => null });
  }
  return e;
})();
function Jd(e) {
  return e.debugInfo?.className || e.type.name || null;
}
var No$1 = {};
var jo = class {
  injector;
  parentInjector;
  constructor(t, n) {
    ((this.injector = t), (this.parentInjector = n));
  }
  get(t, n, r) {
    let o = this.injector.get(t, No$1, r);
    return o !== No$1 || n === No$1 ? o : this.parentInjector.get(t, n, r);
  }
};
function Xd(e, t, n) {
  return (e[t] = n);
}
function ye$1(e, t, n) {
  if (n === te$1) return !1;
  let r = e[t];
  return Object.is(r, n) ? !1 : ((e[t] = n), !0);
}
function ef(e, t, n, r) {
  let o = ye$1(e, t, n);
  return ye$1(e, t + 1, r) || o;
}
function So$1(e, t, n) {
  return function r(o) {
    let i = r.__ngNativeEl__;
    i !== void 0 && qg(o, i);
    $a(He$1(e) ? le$2(e.index, t) : t, 5);
    let a = t[j$1],
      c = pu(t, a, n, o),
      l = r.__ngNextListenerFn__;
    for (; l;) ((c = pu(t, a, l, o) && c), (l = l.__ngNextListenerFn__));
    return c;
  };
}
function pu(e, t, n, r) {
  let o = y$1(null);
  try {
    return (O$1(N$1.OutputStart, t, n), n(r) !== !1);
  } catch (i) {
    return (Cy(e, i), !1);
  } finally {
    (O$1(N$1.OutputEnd, t, n), y$1(o));
  }
}
function tf(e, t, n, r, o, i, s, a) {
  let c = Pn$2(e),
    l = !1,
    u = null;
  if ((!r && c && (u = Ky(t, n, i, e.index)), u !== null)) {
    let d = u.__ngLastListenerFn__ || u;
    ((d.__ngNextListenerFn__ = s), (u.__ngLastListenerFn__ = s), (l = !0));
  } else {
    let d = ge$2(e, n),
      p = r ? r(d) : d;
    r || (a.__ngNativeEl__ = d);
    let f = o.listen(p, i, a);
    if (!Yy(i)) nf(r ? (g) => r(z$1(g[e.index])) : e.index, t, n, i, a, f, !1);
  }
  return l;
}
function Yy(e) {
  return e.startsWith(`animation`) || e.startsWith(`transition`);
}
function Ky(e, t, n, r) {
  let o = e.cleanup;
  if (o != null)
    for (let i = 0; i < o.length - 1; i += 2) {
      let s = o[i];
      if (s === n && o[i + 1] === r) {
        let a = t[Kt$1],
          c = o[i + 2];
        return a && a.length > c ? a[c] : null;
      }
      typeof s == `string` && (i += 2);
    }
  return null;
}
function nf(e, t, n, r, o, i, s) {
  let a = t.firstCreatePass ? ds(t) : null,
    c = us(n),
    l = c.length;
  (c.push(o, i), a && a.push(r, e, l, (l + 1) * (s ? -1 : 1)));
}
function hu(e, t, n, r, o, i) {
  let s = t[n],
    a = t[m$2],
    d = s[a.data[n].outputs[r]].subscribe(i);
  nf(e.index, a, t, o, i, d, !0);
}
var ca = Symbol(`BINDING`);
var rf = new A$1(``);
function Vo(e, t, n) {
  let r = n ? e.styles : null,
    o = n ? e.classes : null,
    i = 0;
  if (t !== null)
    for (let s = 0; s < t.length; s++) {
      let a = t[s];
      if (typeof a == `number`) i = a;
      else if (i == 1) o = Yr$2(o, a);
      else if (i == 2) {
        let c = a,
          l = t[++s];
        r = Yr$2(r, c + `: ` + l + `;`);
      }
    }
  (n ? (e.styles = r) : (e.stylesWithoutHost = r), n ? (e.classes = o) : (e.classesWithoutHost = o));
}
function ir$2(e, t = 0) {
  let n = E$1();
  if (n === null) return De$2(e, t);
  return qu(Q(), n, V$2(e), t);
}
function Jy() {
  throw new Error(`invalid`);
}
function of(e, t, n, r, o) {
  let i = r === null ? null : { '': -1 },
    s = o(e, n);
  if (s !== null) {
    let a = s,
      c = null,
      l = null;
    for (let u of s)
      if (u.resolveHostDirectives !== null) {
        [a, c, l] = u.resolveHostDirectives(s);
        break;
      }
    tv(e, t, n, a, i, c, l);
  }
  i !== null && r !== null && Xy(n, r, i);
}
function Xy(e, t, n) {
  let r = (e.localNames = []);
  for (let o = 0; o < t.length; o += 2) {
    let i = n[t[o + 1]];
    if (i == null) throw new M$1(-301, !1);
    r.push(t[o], i);
  }
}
function ev(e, t, n) {
  ((t.componentOffset = n), (e.components ??= []).push(t.index));
}
function tv(e, t, n, r, o, i, s) {
  let a = r.length,
    c = null;
  for (let p = 0; p < a; p++) {
    let f = r[p];
    (c === null && he$2(f) && ((c = f), ev(e, n, p)), Ws(ko(n, t), e, f.type));
  }
  (av(n, e.data.length, a), c?.viewProvidersResolver && c.viewProvidersResolver(c));
  for (let p = 0; p < a; p++) {
    let f = r[p];
    f.providersResolver && f.providersResolver(f);
  }
  let l = !1,
    u = !1,
    d = Sd(e, t, a, null);
  a > 0 && (n.directiveToIndex = new Map());
  for (let p = 0; p < a; p++) {
    let f = r[p];
    if (((n.mergedAttrs = on$2(n.mergedAttrs, f.hostAttrs)), rv(e, n, t, d, f), sv(d, f, o), s !== null && s.has(f))) {
      let [g, R] = s.get(f);
      n.directiveToIndex.set(f.type, [d, g + n.directiveStart, R + n.directiveStart]);
    } else (i === null || !i.has(f)) && n.directiveToIndex.set(f.type, d);
    (f.contentQueries !== null && (n.flags |= 4),
      (f.hostBindings !== null || f.hostAttrs !== null || f.hostVars !== 0) && (n.flags |= 64));
    let h = f.type.prototype;
    (!l && (h.ngOnChanges || h.ngOnInit || h.ngDoCheck) && ((e.preOrderHooks ??= []).push(n.index), (l = !0)),
      !u && (h.ngOnChanges || h.ngDoCheck) && ((e.preOrderCheckHooks ??= []).push(n.index), (u = !0)),
      d++);
  }
  nv(e, n, i);
}
function nv(e, t, n) {
  for (let r = t.directiveStart; r < t.directiveEnd; r++) {
    let o = e.data[r];
    if (n === null || !n.has(o)) (gu(0, t, o, r), gu(1, t, o, r), yu(t, r, !1));
    else {
      let i = n.get(o);
      (mu(0, t, i, r), mu(1, t, i, r), yu(t, r, !0));
    }
  }
}
function gu(e, t, n, r) {
  let o = e === 0 ? n.inputs : n.outputs;
  for (let i in o)
    if (Object.hasOwn(o, i)) {
      let s;
      (e === 0 ? (s = t.inputs ??= {}) : (s = t.outputs ??= {}), (s[i] ??= []), s[i].push(r), sf(t, i));
    }
}
function mu(e, t, n, r) {
  let o = e === 0 ? n.inputs : n.outputs;
  for (let i in o)
    if (Object.hasOwn(o, i)) {
      let s = o[i],
        a;
      (e === 0 ? (a = t.hostDirectiveInputs ??= {}) : (a = t.hostDirectiveOutputs ??= {}),
        (a[s] ??= []),
        a[s].push(r, i),
        sf(t, s));
    }
}
function sf(e, t) {
  t === `class` ? (e.flags |= 8) : t === `style` && (e.flags |= 16);
}
function yu(e, t, n) {
  let { attrs: r, inputs: o, hostDirectiveInputs: i } = e;
  if (r === null || (!n && o === null) || (n && i === null) || Na(e)) {
    ((e.initialInputs ??= []), e.initialInputs.push(null));
    return;
  }
  let s = null,
    a = 0;
  for (; a < r.length;) {
    let c = r[a];
    if (c === 0) {
      a += 4;
      continue;
    } else if (c === 5) {
      a += 2;
      continue;
    } else if (typeof c == `number`) break;
    if (!n && Object.hasOwn(o, c)) {
      let l = o[c];
      for (let u of l)
        if (u === t) {
          ((s ??= []), s.push(c, r[a + 1]));
          break;
        }
    } else if (n && Object.hasOwn(i, c)) {
      let l = i[c];
      for (let u = 0; u < l.length; u += 2)
        if (l[u] === t) {
          ((s ??= []), s.push(l[u + 1], r[a + 1]));
          break;
        }
    }
    a += 2;
  }
  ((e.initialInputs ??= []), e.initialInputs.push(s));
}
function rv(e, t, n, r, o) {
  e.data[r] = o;
  let s = new St$1(o.factory || (o.factory = qe$1(o.type, !0)), he$2(o), ir$2, null);
  ((e.blueprint[r] = s), (n[r] = s), ov(e, t, r, Sd(e, n, o.hostVars, te$1), o));
}
function ov(e, t, n, r, o) {
  let i = o.hostBindings;
  if (i) {
    let s = e.hostBindingOpCodes;
    s === null && (s = e.hostBindingOpCodes = []);
    let a = ~t.index;
    (iv(s) != a && s.push(a), s.push(n, r, i));
  }
}
function iv(e) {
  let t = e.length;
  for (; t > 0;) {
    let n = e[--t];
    if (typeof n == `number` && n < 0) return n;
  }
  return 0;
}
function sv(e, t, n) {
  if (n) {
    if (t.exportAs) for (let r = 0; r < t.exportAs.length; r++) n[t.exportAs[r]] = e;
    he$2(t) && (n[``] = e);
  }
}
function av(e, t, n) {
  ((e.flags |= 1), (e.directiveStart = t), (e.directiveEnd = t + n), (e.providerIndexes = t));
}
function af(e, t, n, r, o, i, s, a) {
  let c = t[m$2],
    l = c.consts,
    d = gn$2(c, e, n, r, oe$1(l, s));
  return (
    i && of(c, t, d, oe$1(l, a), o),
    (d.mergedAttrs = on$2(d.mergedAttrs, d.attrs)),
    d.attrs !== null && Vo(d, d.attrs, !1),
    d.mergedAttrs !== null && Vo(d, d.mergedAttrs, !0),
    c.queries !== null && c.queries.elementStart(c, d),
    d
  );
}
function cf(e, t) {
  (Pu(e, t), rs(t) && e.queries.elementEnd(t));
}
function cv(e, t, n, r, o, i) {
  let s = t.consts,
    c = gn$2(t, e, n, r, oe$1(s, o));
  if (((c.mergedAttrs = on$2(c.mergedAttrs, c.attrs)), i != null)) {
    let l = oe$1(s, i);
    c.localNames = [];
    for (let u = 0; u < l.length; u += 2) c.localNames.push(l[u], -1);
  }
  return (
    c.attrs !== null && Vo(c, c.attrs, !1),
    c.mergedAttrs !== null && Vo(c, c.mergedAttrs, !0),
    t.queries !== null && t.queries.elementStart(t, c),
    c
  );
}
var lf = typeof ShadowRoot < `u`;
var lv = typeof Document < `u`;
function uv(e) {
  return Object.keys(e).map((t) => {
    let [n, r, o] = e[t],
      i = { propName: n, templateName: t, isSignal: (r & ti$2.SignalBased) !== 0 };
    return (o && (i.transform = o), i);
  });
}
function dv(e) {
  return Object.keys(e).map((t) => ({ propName: e[t], templateName: t }));
}
function fv(e, t, n) {
  let r = t instanceof ie$1 ? t : t?.injector;
  return (r && e.getStandaloneInjector !== null && (r = e.getStandaloneInjector(r) || r), r ? new jo(n, r) : n);
}
function pv(e) {
  let t = e.get(Yn$2, null);
  if (t === null) throw new M$1(407, !1);
  return {
    rendererFactory: t,
    sanitizer: e.get(Kd, null),
    changeDetectionScheduler: e.get(be$1, null),
    ngReflect: !1,
    tracingService: e.get(Ot, null, { optional: !0 }),
  };
}
function hv(e, t, n) {
  let r = uf(e);
  return gd(t, r, r === `svg` ? is : r === `math` ? dl : n);
}
function gv(e) {
  if ((e && `localName` in e && typeof e.localName == `string` ? e.localName : e?.tagName)?.toLowerCase() === `script`)
    throw new M$1(905, !1);
}
function uf(e) {
  return (e.selectors[0][0] || `div`).toLowerCase();
}
var ln$2 = class {
  componentDef;
  ngModule;
  selector;
  componentType;
  ngContentSelectors;
  isBoundToModule;
  cachedInputs = null;
  cachedOutputs = null;
  get inputs() {
    return ((this.cachedInputs ??= uv(this.componentDef.inputs)), this.cachedInputs);
  }
  get outputs() {
    return ((this.cachedOutputs ??= dv(this.componentDef.outputs)), this.cachedOutputs);
  }
  constructor(t, n) {
    ((this.componentDef = t),
      (this.ngModule = n),
      (this.componentType = t.type),
      (this.selector = Lm(t.selectors)),
      (this.ngContentSelectors = t.ngContentSelectors ?? []),
      (this.isBoundToModule = !!n));
  }
  create(t, n, r, o, i, s, a) {
    O$1(N$1.DynamicComponentStart);
    let c = y$1(null);
    try {
      let l = this.componentDef,
        u = fv(l, o || this.ngModule, t),
        d = pv(u),
        p = d.tracingService;
      return p && p.componentCreate
        ? p.componentCreate(Jd(l), () => this.createComponentRef(d, u, n, r, i, s, a))
        : this.createComponentRef(d, u, n, r, i, s, a);
    } finally {
      y$1(c);
    }
  }
  createComponentRef(t, n, r, o, i, s, a) {
    let c = this.componentDef,
      l = mv(o, c, s, i),
      u = t.rendererFactory.createRenderer(null, c),
      d = o ? fy(u, o, c.encapsulation, n) : hv(c, u, a ?? null);
    gv(d);
    let p = n.get(rf, null),
      f = yv(d, () => n.get(jn$2, null) ?? ed());
    p && p.addHost(f);
    let h = s?.some(vu) || i?.some((D) => typeof D != `function` && D.bindings.some(vu)),
      g = Fa(null, l, null, 512 | Nd(c), null, null, t, u, n, null, id(d, n, !0));
    (p &&
      lf &&
      f instanceof ShadowRoot &&
      fo$1(g, () => {
        p.removeHost(f);
      }),
      (g[L] = d),
      mo$1(g));
    let R = null;
    try {
      let D = af(L, g, 2, `#host`, () => l.directiveRegistry, !0, 0);
      (vd(u, d, D),
        sn$2(d, g),
        Va(l, g, D),
        ad(l, D, g),
        cf(l, D),
        r !== void 0 && Iv(D, this.ngContentSelectors, r),
        (R = le$2(D.index, g)),
        (g[j$1] = R[j$1]),
        Ba(l, g, null));
    } catch (D) {
      throw (R !== null && Gs(R), Gs(g), D);
    } finally {
      (O$1(N$1.DynamicComponentEnd), yo$1());
    }
    return new Ho(this.componentType, g, !!h);
  }
};
function mv(e, t, n, r) {
  let o = e ? [`ng-version`, `22.1.4`] : Pm(t.selectors[0]),
    i = null,
    s = null,
    a = 0;
  if (n)
    for (let u of n)
      ((a += u[ca].requiredVars),
        u.create && ((u.targetIdx = 0), (i ??= []).push(u)),
        u.update && ((u.targetIdx = 0), (s ??= []).push(u)));
  if (r)
    for (let u = 0; u < r.length; u++) {
      let d = r[u];
      if (typeof d != `function`)
        for (let p of d.bindings) {
          a += p[ca].requiredVars;
          let f = u + 1;
          (p.create && ((p.targetIdx = f), (i ??= []).push(p)), p.update && ((p.targetIdx = f), (s ??= []).push(p)));
        }
    }
  let c = [t];
  if (r)
    for (let u of r) {
      let p = Xr$2(typeof u == `function` ? u : u.type);
      c.push(p);
    }
  return Pa(0, null, vv(i, s), 1, a, c, null, null, null, [o], null);
}
function yv(e, t) {
  let n = e.getRootNode?.();
  return lv && n instanceof Document ? n.head : n && lf && n instanceof ShadowRoot ? n : t().head;
}
function vv(e, t) {
  return !e && !t
    ? null
    : (n) => {
        if (n & 1 && e) for (let r of e) r.create();
        if (n & 2 && t) for (let r of t) r.update();
      };
}
function vu(e) {
  let t = e[ca].kind;
  return t === `input` || t === `twoWay`;
}
var Ho = class extends Yd {
  _rootLView;
  _hasInputBindings;
  instance;
  hostView;
  changeDetectorRef;
  componentType;
  location;
  previousInputValues = null;
  _tNode;
  constructor(t, n, r) {
    (super(),
      (this._rootLView = n),
      (this._hasInputBindings = r),
      (this._tNode = ao$1(n[m$2], L)),
      (this.location = hn$2(this._tNode, n)),
      (this.instance = le$2(this._tNode.index, n)[j$1]),
      (this.hostView = this.changeDetectorRef = new et$2(n, void 0)),
      (this.componentType = t));
  }
  setInput(t, n) {
    this._hasInputBindings;
    let r = this._tNode;
    if (
      ((this.previousInputValues ??= new Map()),
      this.previousInputValues.has(t) && Object.is(this.previousInputValues.get(t), n))
    )
      return;
    let o = this._rootLView;
    Ha(r, o[m$2], o, t, n);
    this.previousInputValues.set(t, n);
    $a(le$2(r.index, o), 1);
  }
  get injector() {
    return new Xe$1(this._tNode, this._rootLView);
  }
  destroy() {
    this.hostView.destroy();
  }
  onDestroy(t) {
    this.hostView.onDestroy(t);
  }
};
function Iv(e, t, n) {
  let r = (e.projection = []);
  for (let o = 0; o < t.length; o++) {
    let i = n[o];
    r.push(i != null && i.length ? Array.from(i) : null);
  }
}
var ri$2 = (() => {
  class e {
    static __NG_ELEMENT_ID__ = Ev;
  }
  return e;
})();
function Ev() {
  return df(Q(), E$1());
}
var la = class e extends ri$2 {
  _lContainer;
  _hostTNode;
  _hostLView;
  constructor(t, n, r) {
    (super(), (this._lContainer = t), (this._hostTNode = n), (this._hostLView = r));
  }
  get element() {
    return hn$2(this._hostTNode, this._hostLView);
  }
  get injector() {
    return new Xe$1(this._hostTNode, this._hostLView);
  }
  get parentInjector() {
    let t = _a(this._hostTNode, this._hostLView);
    if (Vu(t)) {
      let n = Oo(t, this._hostLView),
        r = Ao(t),
        o = n[m$2].data[r + 8];
      return new Xe$1(o, n);
    } else return new Xe$1(null, this._hostLView);
  }
  clear() {
    for (; this.length > 0;) this.remove(this.length - 1);
  }
  get(t) {
    let n = Iu(this._lContainer);
    return (n !== null && n[t]) || null;
  }
  get length() {
    return this._lContainer.length - P$2;
  }
  createEmbeddedView(t, n, r) {
    let o, i;
    typeof r == `number` ? (o = r) : r != null && ((o = r.index), (i = r.injector));
    let s = Fo(this._lContainer, t.ssrId),
      a = t.createEmbeddedViewImpl(n || {}, i, s);
    return (this.insertImpl(a, o, cn$2(this._hostTNode, s)), a);
  }
  createComponent(t, n, r, o, i, s, a) {
    let c,
      l = n || {};
    ((c = l.index),
      (r = l.injector),
      (o = l.projectableNodes),
      (i = l.environmentInjector || l.ngModuleRef),
      (s = l.directives),
      (a = l.bindings));
    let u = new ln$2(Ge(t)),
      d = r || this.parentInjector;
    if (!i && u.ngModule == null) {
      let D = this.parentInjector.get(ie$1, null);
      D && (i = D);
    }
    let p = Ge(u.componentType ?? {}),
      f = Fo(this._lContainer, p?.id ?? null),
      h = f?.firstChild ?? null,
      g = u.create(d, o, h, i, s, a, this._getHostElementNamespace());
    return (this.insertImpl(g.hostView, c, cn$2(this._hostTNode, f)), g);
  }
  _getHostElementNamespace() {
    if (this._hostTNode.type & 2) {
      let t = this._hostTNode.parent ?? this._hostLView[G$2];
      return t !== null && t.type & 2 && typeof t.value == `string` && t.value.toLowerCase() === `foreignobject`
        ? null
        : (t?.namespace ?? null);
    }
    return this._hostTNode.namespace;
  }
  insert(t, n) {
    return this.insertImpl(t, n, !0);
  }
  insertImpl(t, n, r) {
    let o = t._lView;
    if (pl(o)) {
      let a = this.indexOf(t);
      if (a !== -1) this.detach(a);
      else {
        let c = o[H],
          l = new e(c, c[G$2], c[H]);
        l.detach(l.indexOf(t));
      }
    }
    let i = this._adjustIndex(n),
      s = this._lContainer;
    return (or$2(s, o, i, r), t.attachToViewContainerRef(), Qi$1(ks(s), i, t), t);
  }
  move(t, n) {
    return this.insert(t, n);
  }
  indexOf(t) {
    let n = Iu(this._lContainer);
    return n !== null ? n.indexOf(t) : -1;
  }
  remove(t) {
    let n = this._adjustIndex(t, -1),
      r = Qn$1(this._lContainer, n);
    r && (On$2(ks(this._lContainer), n), Xo(r[m$2], r));
  }
  detach(t) {
    let n = this._adjustIndex(t, -1),
      r = Qn$1(this._lContainer, n);
    return r && On$2(ks(this._lContainer), n) != null ? new et$2(r) : null;
  }
  _adjustIndex(t, n = 0) {
    return t ?? this.length + n;
  }
};
function Iu(e) {
  return e[Ln$2];
}
function ks(e) {
  return e[Ln$2] || (e[Ln$2] = []);
}
function df(e, t) {
  let n,
    r = t[e.index];
  return (ce$2(r) ? (n = r) : ((n = qd(r, t, null, e)), (t[e.index] = n), ja(t, n)), Tv(n, t, e, r), new la(n, e, t));
}
function Dv(e, t) {
  let n = e[k$1],
    r = n.createComment(``),
    o = ge$2(t, e);
  return (Nt(n, n.parentNode(o), r, n.nextSibling(o), !1), r);
}
var Tv = bv;
var wv = () => !1;
function Cv(e, t, n) {
  return wv(e, t, n);
}
function bv(e, t, n, r) {
  if (e[Tt]) return;
  let o;
  (n.type & 8 ? (o = z$1(r)) : (o = Dv(t, n)), (e[Tt] = o));
}
var ua = class e {
  queryList;
  matches = null;
  constructor(t) {
    this.queryList = t;
  }
  clone() {
    return new e(this.queryList);
  }
  setDirty() {
    this.queryList.setDirty();
  }
};
var da = class e {
  queries;
  constructor(t = []) {
    this.queries = t;
  }
  createEmbeddedView(t) {
    let n = t.queries;
    if (n !== null) {
      let r = t.contentQueries !== null ? t.contentQueries[0] : n.length,
        o = [];
      for (let i = 0; i < r; i++) {
        let s = n.getByIndex(i),
          a = this.queries[s.indexInDeclarationView];
        o.push(a.clone());
      }
      return new e(o);
    }
    return null;
  }
  insertView(t) {
    this.dirtyQueriesWithMatches(t);
  }
  detachView(t) {
    this.dirtyQueriesWithMatches(t);
  }
  finishViewCreation(t) {
    this.dirtyQueriesWithMatches(t);
  }
  dirtyQueriesWithMatches(t) {
    for (let n = 0; n < this.queries.length; n++) Wa(t, n).matches !== null && this.queries[n].setDirty();
  }
};
var Bo = class {
  flags;
  read;
  predicate;
  constructor(t, n, r = null) {
    ((this.flags = n), (this.read = r), typeof t == `string` ? (this.predicate = Rv(t)) : (this.predicate = t));
  }
};
var fa$1 = class e {
  queries;
  constructor(t = []) {
    this.queries = t;
  }
  elementStart(t, n) {
    for (let r = 0; r < this.queries.length; r++) this.queries[r].elementStart(t, n);
  }
  elementEnd(t) {
    for (let n = 0; n < this.queries.length; n++) this.queries[n].elementEnd(t);
  }
  embeddedTView(t) {
    let n = null;
    for (let r = 0; r < this.length; r++) {
      let o = n !== null ? n.length : 0,
        i = this.getByIndex(r).embeddedTView(t, o);
      i && ((i.indexInDeclarationView = r), n !== null ? n.push(i) : (n = [i]));
    }
    return n !== null ? new e(n) : null;
  }
  template(t, n) {
    for (let r = 0; r < this.queries.length; r++) this.queries[r].template(t, n);
  }
  getByIndex(t) {
    return this.queries[t];
  }
  get length() {
    return this.queries.length;
  }
  track(t) {
    this.queries.push(t);
  }
};
var pa = class e {
  metadata;
  matches = null;
  indexInDeclarationView = -1;
  crossesNgTemplate = !1;
  _declarationNodeIndex;
  _appliesToNextNode = !0;
  constructor(t, n = -1) {
    ((this.metadata = t), (this._declarationNodeIndex = n));
  }
  elementStart(t, n) {
    this.isApplyingToNode(n) && this.matchTNode(t, n);
  }
  elementEnd(t) {
    this._declarationNodeIndex === t.index && (this._appliesToNextNode = !1);
  }
  template(t, n) {
    this.elementStart(t, n);
  }
  embeddedTView(t, n) {
    return this.isApplyingToNode(t)
      ? ((this.crossesNgTemplate = !0), this.addMatch(-t.index, n), new e(this.metadata))
      : null;
  }
  isApplyingToNode(t) {
    if (this._appliesToNextNode && (this.metadata.flags & 1) !== 1) {
      let n = this._declarationNodeIndex,
        r = t.parent;
      for (; r !== null && r.type & 8 && r.index !== n;) r = r.parent;
      return n === (r !== null ? r.index : -1);
    }
    return this._appliesToNextNode;
  }
  matchTNode(t, n) {
    let r = this.metadata.predicate;
    if (Array.isArray(r))
      for (let o = 0; o < r.length; o++) {
        let i = r[o];
        (this.matchTNodeWithReadOption(t, n, _v(n, i)), this.matchTNodeWithReadOption(t, n, Mo$1(n, t, i, !1, !1)));
      }
    else
      r === Zn$2
        ? n.type & 4 && this.matchTNodeWithReadOption(t, n, -1)
        : this.matchTNodeWithReadOption(t, n, Mo$1(n, t, r, !1, !1));
  }
  matchTNodeWithReadOption(t, n, r) {
    if (r !== null) {
      let o = this.metadata.read;
      if (o !== null)
        if (o === tr$2 || o === ri$2 || (o === Zn$2 && n.type & 4)) this.addMatch(n.index, -2);
        else {
          let i = Mo$1(n, t, o, !1, !1);
          i !== null && this.addMatch(n.index, i);
        }
      else this.addMatch(n.index, r);
    }
  }
  addMatch(t, n) {
    this.matches === null ? (this.matches = [t, n]) : this.matches.push(t, n);
  }
};
function _v(e, t) {
  let n = e.localNames;
  if (n !== null) {
    for (let r = 0; r < n.length; r += 2) if (n[r] === t) return n[r + 1];
  }
  return null;
}
function Mv(e, t) {
  return e.type & 11 ? hn$2(e, t) : e.type & 4 ? Ua(e, t) : null;
}
function Nv(e, t, n, r) {
  return n === -1 ? Mv(t, e) : n === -2 ? Sv(e, t, r) : Wn$1(e, e[m$2], n, t);
}
function Sv(e, t, n) {
  if (n === tr$2) return hn$2(t, e);
  if (n === Zn$2) return Ua(t, e);
  if (n === ri$2) return df(t, e);
}
function ff(e, t, n, r) {
  let o = t[Ne$2].queries[r];
  if (o.matches === null) {
    let i = e.data,
      s = n.matches,
      a = [];
    for (let c = 0; s !== null && c < s.length; c += 2) {
      let l = s[c];
      if (l < 0) a.push(null);
      else {
        let u = i[l];
        a.push(Nv(t, u, s[c + 1], n.metadata.read));
      }
    }
    o.matches = a;
  }
  return o.matches;
}
function ha(e, t, n, r) {
  let o = e.queries.getByIndex(n),
    i = o.matches;
  if (i !== null) {
    let s = ff(e, t, o, n);
    for (let a = 0; a < i.length; a += 2) {
      let c = i[a];
      if (c > 0) r.push(s[a / 2]);
      else {
        let l = i[a + 1],
          u = t[-c];
        for (let d = P$2; d < u.length; d++) {
          let p = u[d];
          p[Ye$1] === p[H] && ha(p[m$2], p, l, r);
        }
        if (u[wt] !== null) {
          let d = u[wt];
          for (let p = 0; p < d.length; p++) {
            let f = d[p];
            ha(f[m$2], f, l, r);
          }
        }
      }
    }
  }
  return r;
}
function xv(e, t) {
  return e[Ne$2].queries[t].queryList;
}
function pf(e, t, n) {
  let r = new Lo$1((n & 4) === 4);
  return (ml(e, t, r, r.destroy), (t[Ne$2] ??= new da()).queries.push(new ua(r)) - 1);
}
function Av(e, t, n) {
  let r = F$2();
  return (
    r.firstCreatePass && (hf(r, new Bo(e, t, n), -1), (t & 2) === 2 && (r.staticViewQueries = !0)),
    pf(r, E$1(), t)
  );
}
function Ov(e, t, n, r) {
  let o = F$2();
  if (o.firstCreatePass) {
    let i = Q();
    (hf(o, new Bo(t, n, r), i.index), kv(o, e), (n & 2) === 2 && (o.staticContentQueries = !0));
  }
  return pf(o, E$1(), n);
}
function Rv(e) {
  return e.split(`,`).map((t) => t.trim());
}
function hf(e, t, n) {
  (e.queries === null && (e.queries = new fa$1()), e.queries.track(new pa(t, n)));
}
function kv(e, t) {
  let n = e.contentQueries || (e.contentQueries = []);
  t !== (n.length ? n[n.length - 1] : -1) && n.push(e.queries.length - 1, t);
}
function Wa(e, t) {
  return e.queries.getByIndex(t);
}
function Lv(e, t) {
  let n = e[m$2],
    r = Wa(n, t);
  return r.crossesNgTemplate ? ha(n, e, t, []) : ff(n, e, r, t);
}
function qa(e) {
  return !!e && typeof e.then == `function`;
}
function gf(e) {
  return !!e && typeof e.subscribe == `function`;
}
var un$2 = class {};
var mf = class {};
var $o = class extends un$2 {
  ngModuleType;
  _parent;
  _bootstrapComponents = [];
  _r3Injector;
  instance;
  destroyCbs = [];
  constructor(t, n, r, o = !0) {
    (super(), (this.ngModuleType = t), (this._parent = n));
    let i = Zc(t);
    ((this._bootstrapComponents = Cm(i.bootstrap)),
      (this._r3Injector = _s(t, n, [{ provide: un$2, useValue: this }, ...r], Mn$2(t), new Set([`environment`]))),
      o && this.resolveInjectorInitializers());
  }
  resolveInjectorInitializers() {
    (this._r3Injector.resolveInjectorInitializers(), (this.instance = this._r3Injector.get(this.ngModuleType)));
  }
  get injector() {
    return this._r3Injector;
  }
  destroy() {
    let t = this._r3Injector;
    (!t.destroyed && t.destroy(), this.destroyCbs.forEach((n) => n()), (this.destroyCbs = null));
  }
  onDestroy(t) {
    this.destroyCbs.push(t);
  }
};
var Uo$1 = class extends mf {
  moduleType;
  constructor(t) {
    (super(), (this.moduleType = t));
  }
  create(t) {
    return new $o(this.moduleType, t, []);
  }
};
var Kn$1 = class extends un$2 {
  injector;
  instance = null;
  constructor(t) {
    super();
    let n = new mt$2(
      [...t.providers, { provide: un$2, useValue: this }],
      t.parent || Yt$2(),
      t.debugName,
      new Set([`environment`]),
    );
    ((this.injector = n), t.runEnvironmentInitializers && n.resolveInjectorInitializers());
  }
  destroy() {
    this.injector.destroy();
  }
  onDestroy(t) {
    this.injector.onDestroy(t);
  }
};
function yf(e, t, n = null) {
  return new Kn$1({ providers: e, parent: t, debugName: n, runEnvironmentInitializers: !0 }).injector;
}
var Pv = (() => {
  class e {
    _injector;
    cachedInjectors = new Map();
    constructor(n) {
      this._injector = n;
    }
    getOrCreateStandaloneInjector(n) {
      if (!n.standalone) return null;
      if (!this.cachedInjectors.has(n)) {
        let r = Yi$1(!1, n.type),
          o = r.length > 0 ? yf([r], this._injector, ``) : null;
        this.cachedInjectors.set(n, o);
      }
      return this.cachedInjectors.get(n);
    }
    ngOnDestroy() {
      try {
        for (let n of this.cachedInjectors.values()) n !== null && n.destroy();
      } finally {
        this.cachedInjectors.clear();
      }
    }
    static ɵprov = se$1({ token: e, providedIn: `environment`, factory: () => new e(De$2(ie$1)) });
  }
  return e;
})();
function Fv(e) {
  return Xn$2(() => {
    let t = vf(e),
      n = m$3(l({}, t), {
        decls: e.decls,
        vars: e.vars,
        template: e.template,
        consts: e.consts || null,
        ngContentSelectors: e.ngContentSelectors,
        onPush: e.changeDetection !== Ma.Eager,
        directiveDefs: null,
        pipeDefs: null,
        dependencies: (t.standalone && e.dependencies) || null,
        getStandaloneInjector: t.standalone ? (o) => o.get(Pv).getOrCreateStandaloneInjector(n) : null,
        getExternalStyles: null,
        signals: e.signals ?? !1,
        data: e.data || {},
        encapsulation: e.encapsulation || xt$1.Emulated,
        styles: e.styles || J$1,
        _: null,
        schemas: e.schemas || null,
        tView: null,
        id: ``,
      });
    (t.standalone && Rt$1(`NgStandalone`), If(n));
    let r = e.dependencies;
    return ((n.directiveDefs = Eu(r, jv)), (n.pipeDefs = Eu(r, Yc)), (n.id = Wv(n)), n);
  });
}
function jv(e) {
  return Ge(e) || Xr$2(e);
}
function Vv(e) {
  return Xn$2(() => ({
    type: e.type,
    bootstrap: e.bootstrap || J$1,
    declarations: e.declarations || J$1,
    imports: e.imports || J$1,
    exports: e.exports || J$1,
    transitiveCompileScopes: null,
    schemas: e.schemas || null,
    id: e.id || null,
  }));
}
function Hv(e, t) {
  if (e == null) return Qe$2;
  let n = {};
  for (let r in e)
    if (Object.hasOwn(e, r)) {
      let o = e[r],
        i,
        s,
        a,
        c;
      (Array.isArray(o)
        ? ((a = o[0]), (i = o[1]), (s = o[2] ?? i), (c = o[3] || null))
        : ((i = o), (s = o), (a = ti$2.None), (c = null)),
        (n[i] = [r, a, c]),
        (t[i] = s));
    }
  return n;
}
function Bv(e) {
  if (e == null) return Qe$2;
  let t = {};
  for (let n in e) Object.hasOwn(e, n) && (t[e[n]] = n);
  return t;
}
function $v(e) {
  return Xn$2(() => {
    let t = vf(e);
    return (If(t), t);
  });
}
function Uv(e) {
  return {
    type: e.type,
    name: e.name,
    factory: null,
    pure: e.pure !== !1,
    standalone: e.standalone ?? !0,
    onDestroy: e.type.prototype.ngOnDestroy || null,
  };
}
function vf(e) {
  let t = {};
  return {
    type: e.type,
    providersResolver: null,
    viewProvidersResolver: null,
    factory: null,
    hostBindings: e.hostBindings || null,
    hostVars: e.hostVars || 0,
    hostAttrs: e.hostAttrs || null,
    contentQueries: e.contentQueries || null,
    declaredInputs: t,
    inputConfig: e.inputs || Qe$2,
    exportAs: e.exportAs || null,
    standalone: e.standalone ?? !0,
    signals: e.signals === !0,
    selectors: e.selectors || J$1,
    viewQuery: e.viewQuery || null,
    features: e.features || null,
    setInput: null,
    resolveHostDirectives: null,
    hostDirectives: null,
    controlDef: null,
    signalFormsInputPresence: null,
    inputs: Hv(e.inputs, t),
    outputs: Bv(e.outputs),
    debugInfo: null,
  };
}
function If(e) {
  e.features?.forEach((t) => t(e));
}
function Eu(e, t) {
  return e
    ? () => {
        let n = typeof e == `function` ? e() : e,
          r = [];
        for (let o of n) {
          let i = t(o);
          i !== null && r.push(i);
        }
        return r;
      }
    : null;
}
function Wv(e) {
  let t = 0,
    n = typeof e.consts == `function` ? `` : e.consts,
    r = [
      e.selectors,
      e.ngContentSelectors,
      e.hostVars,
      e.hostAttrs,
      n,
      e.vars,
      e.decls,
      e.encapsulation,
      e.standalone,
      e.signals,
      e.exportAs,
      JSON.stringify(e.inputs),
      JSON.stringify(e.outputs),
      Object.getOwnPropertyNames(e.type.prototype),
      !!e.contentQueries,
      !!e.viewQuery,
    ];
  for (let i of r.join(`|`)) t = (Math.imul(31, t) + i.charCodeAt(0)) << 0;
  return ((t += 2147483648), `c` + t);
}
var Ef = new A$1(``);
var Ga = (() => {
  class e {
    resolve;
    reject;
    initialized = !1;
    done = !1;
    donePromise = new Promise((n, r) => {
      ((this.resolve = n), (this.reject = r));
    });
    appInits = w(Ef, { optional: !0 }) ?? [];
    injector = w(Te$1);
    constructor() {}
    runInitializers() {
      if (this.initialized) return;
      let n = [];
      for (let o of this.appInits) {
        let i = io$1(this.injector, o);
        if (qa(i)) n.push(i);
        else if (gf(i)) {
          let s = new Promise((a, c) => {
            i.subscribe({ complete: a, error: c });
          });
          n.push(s);
        }
      }
      let r = () => {
        ((this.done = !0), this.resolve());
      };
      (Promise.all(n)
        .then(() => {
          r();
        })
        .catch((o) => {
          this.reject(o);
        }),
        n.length === 0 && r(),
        (this.initialized = !0));
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = er$2({ token: e, factory: e.ɵfac });
  }
  return e;
})();
function qv(e) {
  let t = (n) => {
    let r = Array.isArray(e);
    n.hostDirectives === null
      ? ((n.resolveHostDirectives = Gv), (n.hostDirectives = r ? e.map(ga) : [e]))
      : r
        ? n.hostDirectives.unshift(...e.map(ga))
        : n.hostDirectives.unshift(e);
  };
  return ((t.ngInherit = !0), t);
}
function Gv(e) {
  let t = [],
    n = !1,
    r = null,
    o = null;
  for (let i = 0; i < e.length; i++) {
    let s = e[i];
    if (s.hostDirectives !== null) {
      let a = t.length;
      ((r ??= new Map()), (o ??= new Map()), Df(s, t, r, e), o.set(s, [a, t.length - 1]));
    }
    i === 0 && he$2(s) && ((n = !0), t.push(s));
  }
  for (let i = n ? 1 : 0; i < e.length; i++) t.push(e[i]);
  return (
    r !== null &&
      r.forEach((i, s) => {
        zv(s.declaredInputs, i.inputs);
      }),
    [t, r, o]
  );
}
function Df(e, t, n, r) {
  if (e.hostDirectives !== null)
    for (let o of e.hostDirectives)
      if (typeof o == `function`) {
        let i = o();
        for (let s of i) Du(ga(s), t, n, r);
      } else Du(o, t, n, r);
}
function Du(e, t, n, r) {
  let o = Xr$2(e.directive);
  if ((Df(o, t, n, r), n.has(o))) {
    let i = n.get(o);
    (Tu(i, e.inputs, `input`), Tu(i, e.outputs, `output`));
  } else r.includes(o) || (n.set(o, e), t.push(o));
}
function Tu(e, t, n) {
  let r = n === `input` ? e.inputs : e.outputs;
  Object.keys(t).forEach((o) => {
    let i = t[o];
    (!Object.hasOwn(r, o) || r[o] === i) && (r[o] = i);
  });
}
function ga(e) {
  return typeof e == `function`
    ? { directive: V$2(e), inputs: {}, outputs: {} }
    : { directive: V$2(e.directive), inputs: wu(e.inputs), outputs: wu(e.outputs) };
}
function wu(e) {
  let t = {};
  if (e !== void 0 && e.length > 0) for (let n = 0; n < e.length; n += 2) t[e[n]] = e[n + 1];
  return t;
}
function zv(e, t) {
  for (let n in t)
    if (Object.hasOwn(t, n)) {
      let r = t[n];
      e[r] = e[n];
    }
}
function Qv(e) {
  return Object.getPrototypeOf(e.prototype).constructor;
}
function Tf(e) {
  let t = Qv(e.type),
    n = !0,
    r = [e];
  for (; t && t !== Function.prototype && t !== Object.prototype;) {
    let o,
      i = Object.hasOwn(t, Sn$2) ? t[Sn$2] : void 0,
      s = Object.hasOwn(t, xn$2) ? t[xn$2] : void 0;
    if (he$2(e)) o = i ?? s;
    else {
      if (i) throw new M$1(903, !1);
      o = s;
    }
    if (o) {
      if (n) {
        r.push(o);
        let c = e;
        ((c.inputs = Ls(e.inputs)), (c.declaredInputs = Ls(e.declaredInputs)), (c.outputs = Ls(e.outputs)));
        let l = o.hostBindings;
        l && Xv(e, l);
        let u = o.viewQuery,
          d = o.contentQueries;
        if ((u && Kv(e, u), d && Jv(e, d), Zv(e, o), zc(e.outputs, o.outputs), he$2(o) && o.data.animation)) {
          let p = e.data;
          p.animation = (p.animation || []).concat(o.data.animation);
        }
      }
      let a = o.features;
      if (a)
        for (let c = 0; c < a.length; c++) {
          let l = a[c];
          (l && l.ngInherit && l(e), l === Tf && (n = !1));
        }
    }
    t = Object.getPrototypeOf(t);
  }
  Yv(r);
}
function Zv(e, t) {
  for (let n in t.inputs) {
    if (!Object.hasOwn(t.inputs, n) || Object.hasOwn(e.inputs, n)) continue;
    let r = t.inputs[n];
    r !== void 0 && ((e.inputs[n] = r), (e.declaredInputs[n] = t.declaredInputs[n]));
  }
}
function Yv(e) {
  let t = 0,
    n = null;
  for (let r = e.length - 1; r >= 0; r--) {
    let o = e[r];
    ((o.hostVars = t += o.hostVars), (o.hostAttrs = on$2(o.hostAttrs, (n = on$2(n, o.hostAttrs)))));
  }
}
function Ls(e) {
  return e === Qe$2 ? {} : e === J$1 ? [] : e;
}
function Kv(e, t) {
  let n = e.viewQuery;
  n
    ? (e.viewQuery = (r, o) => {
        (t(r, o), n(r, o));
      })
    : (e.viewQuery = t);
}
function Jv(e, t) {
  let n = e.contentQueries;
  n
    ? (e.contentQueries = (r, o, i) => {
        (t(r, o, i), n(r, o, i));
      })
    : (e.contentQueries = t);
}
function Xv(e, t) {
  let n = e.hostBindings;
  n
    ? (e.hostBindings = (r, o) => {
        (t(r, o), n(r, o));
      })
    : (e.hostBindings = t);
}
function wf(e, t, n, r, o, i, s, a) {
  if (n.firstCreatePass) {
    e.mergedAttrs = on$2(e.mergedAttrs, e.attrs);
    let u = (e.tView = Pa(2, e, o, i, s, n.directiveRegistry, n.pipeRegistry, null, n.schemas, n.consts, null));
    n.queries !== null && (n.queries.template(n, e), (u.queries = n.queries.embeddedTView(e)));
  }
  (a && (e.flags |= a), en$2(e, !1));
  let c = tI(n, t, e, r);
  (Io() && ka(n, t, c, e), sn$2(c, t));
  let l = qd(c, t, c, e);
  ((t[r + L] = l), ja(t, l), Cv(l, e, t));
}
function eI(e, t, n, r, o, i, s, a, c, l, u) {
  let d = n + L,
    p;
  return (
    t.firstCreatePass
      ? ((p = gn$2(t, d, 4, s || null, a || null)), ps() && of(t, e, p, oe$1(t.consts, l), Rd), Pu(t, p))
      : (p = t.data[d]),
    wf(p, e, t, n, r, o, i, c),
    Pn$2(p) && Va(t, e, p),
    l != null && ni$2(e, p, u),
    p
  );
}
function dn$2(e, t, n, r, o, i, s, a, c, l, u) {
  let d = n + L,
    p;
  if (t.firstCreatePass) {
    if (((p = gn$2(t, d, 4, s || null, a || null)), l != null)) {
      let f = oe$1(t.consts, l);
      p.localNames = [];
      for (let h = 0; h < f.length; h += 2) p.localNames.push(f[h], -1);
    }
  } else p = t.data[d];
  return (wf(p, e, t, n, r, o, i, c), l != null && ni$2(e, p, u), p);
}
function Cf(e, t, n, r, o, i, s, a) {
  let c = E$1(),
    l = F$2();
  return (eI(c, l, e, t, n, r, o, oe$1(l.consts, i), void 0, s, a), Cf);
}
function bf(e, t, n, r, o, i, s, a) {
  let c = E$1(),
    l = F$2();
  return (dn$2(c, l, e, t, n, r, o, oe$1(l.consts, i), void 0, s, a), bf);
}
var tI = nI;
function nI(e, t, n, r) {
  return (Eo$1(!0), t[k$1].createComment(``));
}
var rI = (() => {
  class e {
    log(n) {
      console.log(n);
    }
    warn(n) {
      console.warn(n);
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = se$1({ token: e, factory: e.ɵfac, providedIn: `platform` });
  }
  return e;
})();
var _f = new A$1(``);
var Mf = new A$1(``);
function Nf() {
  ui$2(() => {
    throw new M$1(600, ``);
  });
}
var oI = 10;
var oi$2 = (() => {
  class e {
    _runningTick = !1;
    _destroyed = !1;
    _destroyListeners = [];
    _views = [];
    internalErrorHandler = w(Je$2);
    afterRenderManager = w(Ko);
    zonelessEnabled = w(Vn$1);
    rootEffectScheduler = w(Do$1);
    dirtyFlags = 0;
    tracingSnapshot = null;
    allTestViews = new Set();
    autoDetectTestViews = new Set();
    includeAllTestViews = !1;
    afterTick = new Z$2();
    get allViews() {
      return [...(this.includeAllTestViews ? this.allTestViews : this.autoDetectTestViews).keys(), ...this._views];
    }
    get destroyed() {
      return this._destroyed;
    }
    componentTypes = [];
    components = [];
    internalPendingTask = w(Mt);
    get isStable() {
      return this.internalPendingTask.hasPendingTasksObservable.pipe(ke$2((n) => !n));
    }
    constructor() {
      w(Ot, { optional: !0 });
    }
    whenStable() {
      let n;
      return new Promise((r) => {
        n = this.isStable.subscribe({
          next: (o) => {
            o && r();
          },
        });
      }).finally(() => {
        n.unsubscribe();
      });
    }
    _injector = w(ie$1);
    _rendererFactory = null;
    get injector() {
      return this._injector;
    }
    bootstrap(n, r) {
      return this.bootstrapImpl(n, r);
    }
    bootstrapImpl(n, r, o = Te$1.NULL) {
      return this._injector.get(Ce$1).run(() => {
        if ((O$1(N$1.BootstrapComponentStart), !this._injector.get(Ga).done)) throw new M$1(405, ``);
        let a = Ge(n),
          c = this._injector.get(un$2),
          l = new ln$2(a, c);
        this.componentTypes.push(n);
        let { hostElement: u, directives: d, bindings: p } = iI(r),
          f = u || l.selector,
          h = l.create(o, [], f, c.injector, d, p),
          g = h.location.nativeElement,
          R = h.injector.get(_f, null);
        return (
          R?.registerApplication(g),
          h.onDestroy(() => {
            (this.detachView(h.hostView), Un$2(this.components, h), R?.unregisterApplication(g));
          }),
          this._loadComponent(h),
          O$1(N$1.BootstrapComponentEnd, h),
          h
        );
      });
    }
    tick() {
      (this.zonelessEnabled || (this.dirtyFlags |= 1), this._tick());
    }
    _tick() {
      (O$1(N$1.ChangeDetectionStart),
        this.tracingSnapshot !== null ? this.tracingSnapshot.run(Yo.CHANGE_DETECTION, this.tickImpl) : this.tickImpl());
    }
    tickImpl = () => {
      if (this._runningTick) throw (O$1(N$1.ChangeDetectionEnd), new M$1(101, !1));
      let n = y$1(null);
      try {
        ((this._runningTick = !0), this.synchronize());
      } finally {
        ((this._runningTick = !1),
          this.tracingSnapshot?.dispose(),
          (this.tracingSnapshot = null),
          y$1(n),
          this.afterTick.next(),
          O$1(N$1.ChangeDetectionEnd));
      }
    };
    synchronize() {
      this._rendererFactory === null &&
        !this._injector.destroyed &&
        (this._rendererFactory = this._injector.get(Yn$2, null, { optional: !0 }));
      let n = 0;
      for (; this.dirtyFlags !== 0 && n++ < oI;) {
        O$1(N$1.ChangeDetectionSyncStart);
        try {
          this.synchronizeOnce();
        } finally {
          O$1(N$1.ChangeDetectionSyncEnd);
        }
      }
    }
    synchronizeOnce() {
      this.dirtyFlags & 16 && ((this.dirtyFlags &= -17), this.rootEffectScheduler.flush());
      let n = !1;
      if (this.dirtyFlags & 7) {
        let r = !!(this.dirtyFlags & 1);
        ((this.dirtyFlags &= -8), (this.dirtyFlags |= 8));
        for (let { _lView: o } of this.allViews) {
          if (!r && !Fn$2(o)) continue;
          (Bd(o, r && !this.zonelessEnabled ? 0 : 1), (n = !0));
        }
        if (((this.dirtyFlags &= -5), this.syncDirtyFlagsWithViews(), this.dirtyFlags & 23)) return;
      }
      (n || (this._rendererFactory?.begin?.(), this._rendererFactory?.end?.()),
        this.dirtyFlags & 8 && ((this.dirtyFlags &= -9), this.afterRenderManager.execute()),
        this.syncDirtyFlagsWithViews());
    }
    syncDirtyFlagsWithViews() {
      if (this.allViews.some(({ _lView: n }) => Fn$2(n))) {
        this.dirtyFlags |= 2;
        return;
      } else this.dirtyFlags &= -8;
    }
    attachView(n) {
      let r = n;
      (this._views.push(r), r.attachToAppRef(this));
    }
    detachView(n) {
      let r = n;
      (Un$2(this._views, r), r.detachFromAppRef());
    }
    _loadComponent(n) {
      this.attachView(n.hostView);
      try {
        this.tick();
      } catch (o) {
        this.internalErrorHandler(o);
      }
      (this.components.push(n), this._injector.get(Mf, []).forEach((o) => o(n)));
    }
    ngOnDestroy() {
      if (!this._destroyed)
        try {
          (this._destroyListeners.forEach((n) => n()), this._views.slice().forEach((n) => n.destroy()));
        } finally {
          ((this._destroyed = !0), (this._views = []), (this._destroyListeners = []));
        }
    }
    onDestroy(n) {
      return (this._destroyListeners.push(n), () => Un$2(this._destroyListeners, n));
    }
    destroy() {
      if (this._destroyed) throw new M$1(406, !1);
      let n = this._injector;
      n.destroy && !n.destroyed && n.destroy();
    }
    get viewCount() {
      return this._views.length;
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = er$2({ token: e, factory: e.ɵfac });
  }
  return e;
})();
function iI(e) {
  return e === void 0 || typeof e == `string` || e instanceof Element ? { hostElement: e } : e;
}
function Un$2(e, t) {
  let n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}
function Sf(e, t, n, r) {
  let o = E$1();
  if (ye$1(o, _t(), t)) {
    F$2();
    Dy(vo$1(), o, e, t, n, r);
  }
  return Sf;
}
var ma = class {
  destroy(t) {}
  updateValue(t, n) {}
  swap(t, n) {
    let r = Math.min(t, n),
      o = Math.max(t, n),
      i = this.detach(o);
    if (o - r > 1) {
      let s = this.detach(r);
      (this.attach(r, i), this.attach(o, s));
    } else this.attach(r, i);
  }
  move(t, n) {
    this.attach(n, this.detach(t));
  }
};
function Ps(e, t, n, r, o) {
  return e === n && Object.is(t, r) ? 1 : Object.is(o(e, t), o(n, r)) ? -1 : 0;
}
function sI(e, t, n, r) {
  let o,
    i,
    s = 0,
    a = e.length - 1;
  if (Array.isArray(t)) {
    y$1(r);
    let l = t.length - 1;
    for (y$1(null); s <= a && s <= l;) {
      let u = e.at(s),
        d = t[s],
        p = Ps(s, u, s, d, n);
      if (p !== 0) {
        (p < 0 && e.updateValue(s, d), s++);
        continue;
      }
      let f = e.at(a),
        h = t[l],
        g = Ps(a, f, l, h, n);
      if (g !== 0) {
        (g < 0 && e.updateValue(a, h), a--, l--);
        continue;
      }
      let R = n(s, u),
        D = n(a, f),
        ue = n(s, d);
      if (Object.is(ue, D)) {
        let si = n(l, h);
        (Object.is(si, R) ? (e.swap(s, a), e.updateValue(a, h), l--, a--) : e.move(a, s), e.updateValue(s, d), s++);
        continue;
      }
      if (((o ??= new Wo()), (i ??= bu(e, s, a, n)), ya(e, o, s, ue))) (e.updateValue(s, d), s++, a++);
      else if (i.has(ue)) (o.set(R, e.detach(s)), a--);
      else {
        let si = e.create(s, t[s]);
        (e.attach(s, si), s++, a++);
      }
    }
    for (; s <= l;) (Cu(e, o, n, s, t[s]), s++);
  } else if (t != null) {
    y$1(r);
    let l = t[Symbol.iterator]();
    y$1(null);
    let u = l.next();
    for (; !u.done && s <= a;) {
      let d = e.at(s),
        p = u.value,
        f = Ps(s, d, s, p, n);
      if (f !== 0) (f < 0 && e.updateValue(s, p), s++, (u = l.next()));
      else {
        ((o ??= new Wo()), (i ??= bu(e, s, a, n)));
        let h = n(s, p);
        if (ya(e, o, s, h)) (e.updateValue(s, p), s++, a++, (u = l.next()));
        else if (!i.has(h)) (e.attach(s, e.create(s, p)), s++, a++, (u = l.next()));
        else {
          let g = n(s, d);
          (o.set(g, e.detach(s)), a--);
        }
      }
    }
    for (; !u.done;) (Cu(e, o, n, e.length, u.value), (u = l.next()));
  }
  for (; s <= a;) e.destroy(e.detach(a--));
  o?.forEach((l) => {
    e.destroy(l);
  });
}
function ya(e, t, n, r) {
  return t !== void 0 && t.has(r) ? (e.attach(n, t.get(r)), t.delete(r), !0) : !1;
}
function Cu(e, t, n, r, o) {
  if (ya(e, t, r, n(r, o))) e.updateValue(r, o);
  else {
    let i = e.create(r, o);
    e.attach(r, i);
  }
}
function bu(e, t, n, r) {
  let o = new Set();
  for (let i = t; i <= n; i++) o.add(r(i, e.at(i)));
  return o;
}
var Wo = class {
  kvMap = new Map();
  _vMap = void 0;
  has(t) {
    return this.kvMap.has(t);
  }
  delete(t) {
    if (!this.has(t)) return !1;
    let n = this.kvMap.get(t);
    return (
      this._vMap !== void 0 && this._vMap.has(n)
        ? (this.kvMap.set(t, this._vMap.get(n)), this._vMap.delete(n))
        : this.kvMap.delete(t),
      !0
    );
  }
  get(t) {
    return this.kvMap.get(t);
  }
  set(t, n) {
    if (this.kvMap.has(t)) {
      let r = this.kvMap.get(t);
      this._vMap === void 0 && (this._vMap = new Map());
      let o = this._vMap;
      for (; o.has(r);) r = o.get(r);
      o.set(r, n);
    } else this.kvMap.set(t, n);
  }
  forEach(t) {
    for (let [n, r] of this.kvMap)
      if ((t(r, n), this._vMap !== void 0)) {
        let o = this._vMap;
        for (; o.has(r);) ((r = o.get(r)), t(r, n));
      }
  }
};
function aI(e, t, n, r, o, i, s, a) {
  Rt$1(`NgControlFlow`);
  let c = E$1(),
    l = F$2();
  return (dn$2(c, l, e, t, n, r, o, oe$1(l.consts, i), 256, s, a), za);
}
function za(e, t, n, r, o, i, s, a) {
  Rt$1(`NgControlFlow`);
  let c = E$1(),
    l = F$2();
  return (dn$2(c, l, e, t, n, r, o, oe$1(l.consts, i), 512, s, a), za);
}
function cI(e, t) {
  Rt$1(`NgControlFlow`);
  let n = E$1(),
    r = _t(),
    o = n[r] !== te$1 ? n[r] : -1,
    i = o !== -1 ? qo(n, L + o) : void 0,
    s = 0;
  if (ye$1(n, r, e)) {
    let a = y$1(null);
    try {
      if ((i !== void 0 && zd(i, s), e !== -1)) {
        let c = L + e,
          l = qo(n, c),
          u = Da(n[m$2], c),
          d = Zd(l, u, n);
        or$2(l, rr$2(n, u, t, { dehydratedView: d }), s, cn$2(u, d));
      }
    } finally {
      y$1(a);
    }
  } else if (i !== void 0) {
    let a = Gd(i, s);
    a !== void 0 && (a[j$1] = t);
  }
}
var va = class {
  lContainer;
  $implicit;
  $index;
  constructor(t, n, r) {
    ((this.lContainer = t), (this.$implicit = n), (this.$index = r));
  }
  get $count() {
    return this.lContainer.length - P$2;
  }
};
function lI(e) {
  return e;
}
function uI(e, t) {
  return t;
}
var Ia = class {
  hasEmptyBlock;
  trackByFn;
  liveCollection;
  constructor(t, n, r) {
    ((this.hasEmptyBlock = t), (this.trackByFn = n), (this.liveCollection = r));
  }
};
function dI(e, t, n, r, o, i, s, a, c, l, u, d, p) {
  Rt$1(`NgControlFlow`);
  let f = E$1(),
    h = F$2(),
    g = c !== void 0,
    R = E$1(),
    ue = new Ia(g, a ? s.bind(R[X$1][j$1]) : s);
  ((R[L + e] = ue),
    dn$2(f, h, e + 1, t, n, r, o, oe$1(h.consts, i), 256),
    g && dn$2(f, h, e + 2, c, l, u, d, oe$1(h.consts, p), 512));
}
var Ea = class extends ma {
  lContainer;
  hostLView;
  templateTNode;
  operationsCounter = void 0;
  needsIndexUpdate = !1;
  constructor(t, n, r) {
    (super(), (this.lContainer = t), (this.hostLView = n), (this.templateTNode = r));
  }
  get length() {
    return this.lContainer.length - P$2;
  }
  at(t) {
    return this.getLView(t)[j$1].$implicit;
  }
  attach(t, n) {
    let r = n[It];
    ((this.needsIndexUpdate ||= t !== this.length),
      or$2(this.lContainer, n, t, cn$2(this.templateTNode, r)),
      pI(this.lContainer, t));
  }
  detach(t) {
    return ((this.needsIndexUpdate ||= t !== this.length - 1), hI(this.lContainer, t), gI(this.lContainer, t));
  }
  create(t, n) {
    let r = Fo(this.lContainer, this.templateTNode.tView.ssrId);
    return rr$2(this.hostLView, this.templateTNode, new va(this.lContainer, n, t), { dehydratedView: r });
  }
  destroy(t) {
    Xo(t[m$2], t);
  }
  updateValue(t, n) {
    this.getLView(t)[j$1].$implicit = n;
  }
  reset() {
    this.needsIndexUpdate = !1;
  }
  updateIndexes() {
    if (this.needsIndexUpdate) for (let t = 0; t < this.length; t++) this.getLView(t)[j$1].$index = t;
  }
  getLView(t) {
    return mI(this.lContainer, t);
  }
};
function fI(e) {
  let t = y$1(null),
    n = Ae$1();
  try {
    let r = E$1(),
      o = r[m$2],
      i = r[n],
      s = n + 1,
      a = qo(r, s);
    if (i.liveCollection === void 0) i.liveCollection = new Ea(a, r, Da(o, s));
    else i.liveCollection.reset();
    let c = i.liveCollection;
    if ((sI(c, e, i.trackByFn, t), c.updateIndexes(), i.hasEmptyBlock)) {
      let l = _t(),
        u = c.length === 0;
      if (ye$1(r, l, u)) {
        let d = n + 2,
          p = qo(r, d);
        if (u) {
          let f = Da(o, d),
            h = Zd(p, f, r);
          or$2(p, rr$2(r, f, void 0, { dehydratedView: h }), 0, cn$2(f, h));
        } else (o.firstUpdatePass && qy(p), zd(p, 0));
      }
    }
  } finally {
    y$1(t);
  }
}
function qo(e, t) {
  return e[t];
}
function pI(e, t) {
  if (e.length <= P$2) return;
  let r = e[P$2 + t],
    o = r ? r[xe$2] : void 0;
  if (r && o && o.detachedLeaveAnimationFns && o.detachedLeaveAnimationFns.length > 0) {
    let i = r[_e$1];
    (Wm(i, o), an$2.delete(r[Se$1]), (o.detachedLeaveAnimationFns = void 0));
  }
}
function hI(e, t) {
  if (e.length <= P$2) return;
  let r = e[P$2 + t],
    o = r ? r[xe$2] : void 0;
  o && o.leave && o.leave.size > 0 && (o.detachedLeaveAnimationFns = []);
}
function gI(e, t) {
  return Qn$1(e, t);
}
function mI(e, t) {
  return Gd(e, t);
}
function Da(e, t) {
  return ao$1(e, t);
}
function xf(e, t, n) {
  let r = E$1();
  if (ye$1(r, _t(), t)) {
    F$2();
    my(vo$1(), r, e, t, r[k$1], n);
  }
  return xf;
}
function Ta(e, t, n, r, o) {
  Ha(t, e, n, o ? `class` : `style`, r);
}
function Go$1(e, t, n, r) {
  let o = E$1(),
    i = o[m$2],
    s = e + L,
    a = i.firstCreatePass ? af(s, o, 2, t, Rd, ps(), n, r) : i.data[s];
  if (He$1(a)) {
    let c = o[Me$2].tracingService;
    if (c && c.componentCreate) {
      let l = i.data[a.directiveStart + a.componentOffset];
      return c.componentCreate(Jd(l), () => (_u(e, t, o, a, r), Go$1));
    }
  }
  return (_u(e, t, o, a, r), Go$1);
}
function _u(e, t, n, r, o) {
  if ((kd(r, n, e, t, Rf), Pn$2(r))) {
    let i = n[m$2];
    (Va(i, n, r), ad(i, r, n));
  }
  o != null && ni$2(n, r);
}
function Qa() {
  let e = F$2(),
    n = Ld(Q());
  return (
    e.firstCreatePass && cf(e, n),
    gs(n) && ms(),
    fs(),
    n.classesWithoutHost != null && Cg(n) && Ta(e, n, E$1(), n.classesWithoutHost, !0),
    n.stylesWithoutHost != null && bg(n) && Ta(e, n, E$1(), n.stylesWithoutHost, !1),
    Qa
  );
}
function Af(e, t, n, r) {
  return (Go$1(e, t, n, r), Qa(), Af);
}
function Za(e, t, n, r) {
  let o = E$1(),
    i = o[m$2],
    s = e + L,
    a = i.firstCreatePass ? cv(s, i, 2, t, n, r) : i.data[s];
  return (kd(a, o, e, t, Rf), r != null && ni$2(o, a), Za);
}
function Ya() {
  return (gs(Ld(Q())) && ms(), fs(), Ya);
}
function Of(e, t, n, r) {
  return (Za(e, t, n, r), Ya(), Of);
}
var Rf = (e, t, n, r, o) => (Eo$1(!0), gd(t[k$1], r, bs()));
function yI() {
  return E$1();
}
function kf(e, t, n) {
  let r = E$1();
  if (ye$1(r, _t(), t)) {
    F$2();
    Od(vo$1(), r, e, t, r[k$1], n);
  }
  return kf;
}
var Hn$2 = void 0;
function vI(e) {
  let t = Math.floor(Math.abs(e)),
    n = e.toString().replace(/^[^.]*\.?/, ``).length;
  return t === 1 && n === 0 ? 1 : 5;
}
var II = [
  `en`,
  [
    [`a`, `p`],
    [`AM`, `PM`],
  ],
  [[`AM`, `PM`]],
  [
    [`S`, `M`, `T`, `W`, `T`, `F`, `S`],
    [`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`],
    [`Sunday`, `Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`],
    [`Su`, `Mo`, `Tu`, `We`, `Th`, `Fr`, `Sa`],
  ],
  Hn$2,
  [
    [`J`, `F`, `M`, `A`, `M`, `J`, `J`, `A`, `S`, `O`, `N`, `D`],
    [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`],
    [
      `January`,
      `February`,
      `March`,
      `April`,
      `May`,
      `June`,
      `July`,
      `August`,
      `September`,
      `October`,
      `November`,
      `December`,
    ],
  ],
  Hn$2,
  [
    [`B`, `A`],
    [`BC`, `AD`],
    [`Before Christ`, `Anno Domini`],
  ],
  0,
  [6, 0],
  [`M/d/yy`, `MMM d, y`, `MMMM d, y`, `EEEE, MMMM d, y`],
  [`h:mm a`, `h:mm:ss a`, `h:mm:ss a z`, `h:mm:ss a zzzz`],
  [`{1}, {0}`, Hn$2, Hn$2, Hn$2],
  [`.`, `,`, `;`, `%`, `+`, `-`, `E`, `×`, `‰`, `∞`, `NaN`, `:`],
  [`#,##0.###`, `#,##0%`, `¤#,##0.00`, `#E0`],
  `USD`,
  `$`,
  `US Dollar`,
  {},
  `ltr`,
  vI,
];
var Fs = Object.create(null);
function EI(e) {
  let t = TI(e),
    n = Mu(t);
  if (n) return n;
  let r = t.split(`-`)[0];
  if (((n = Mu(r)), n)) return n;
  if (r === `en`) return II;
  throw new M$1(701, !1);
}
function Mu(e) {
  if (!(e in Fs)) {
    let t = ze$1.ng && ze$1.ng.common && ze$1.ng.common.locales && ze$1.ng.common.locales[e];
    return (t !== void 0 && (Fs[e] = t), t);
  }
  return Fs[e];
}
var DI = {
  LocaleId: 0,
  DayPeriodsFormat: 1,
  DayPeriodsStandalone: 2,
  DaysFormat: 3,
  DaysStandalone: 4,
  MonthsFormat: 5,
  MonthsStandalone: 6,
  Eras: 7,
  FirstDayOfWeek: 8,
  WeekendRange: 9,
  DateFormat: 10,
  TimeFormat: 11,
  DateTimeFormat: 12,
  NumberSymbols: 13,
  NumberFormats: 14,
  CurrencyCode: 15,
  CurrencySymbol: 16,
  CurrencyName: 17,
  Currencies: 18,
  Directionality: 19,
  PluralCase: 20,
  ExtraData: 21,
};
function TI(e) {
  return e.toLowerCase().replace(/_/g, `-`);
}
var sr$2 = `en-US`;
function Lf(e) {
  typeof e == `string` && e.toLowerCase().replace(/_/g, `-`);
}
function Pf(e, t, n) {
  let r = E$1(),
    o = F$2(),
    i = Q();
  return (CI(o, r, r[k$1], i, e, t, n), Pf);
}
function Ff(e, t, n) {
  let r = E$1(),
    o = F$2(),
    i = Q();
  return ((i.type & 3 || n) && tf(i, o, r, n, r[k$1], e, t, So$1(i, r, t)), Ff);
}
function CI(e, t, n, r, o, i, s) {
  let a = !0,
    c = null;
  if (((r.type & 3 || s) && ((c ??= So$1(r, t, i)), tf(r, e, t, s, n, o, i, c) && (a = !1)), a)) {
    let l = r.outputs?.[o],
      u = r.hostDirectiveOutputs?.[o];
    if (u && u.length)
      for (let d = 0; d < u.length; d += 2) {
        let p = u[d],
          f = u[d + 1];
        ((c ??= So$1(r, t, i)), hu(r, t, p, f, o, c));
      }
    if (l && l.length) for (let d of l) ((c ??= So$1(r, t, i)), hu(r, t, d, o, o, c));
  }
}
function bI(e = 1) {
  return Ol(e);
}
function _I(e, t) {
  let n = null,
    r = xm(e);
  for (let o = 0; o < t.length; o++) {
    let i = t[o];
    if (i === `*`) {
      n = o;
      continue;
    }
    if (r === null ? Ed(e, i, !0) : Rm(r, i)) return o;
  }
  return n;
}
function MI(e) {
  let t = E$1()[X$1][G$2];
  if (!t.projection) {
    let r = (t.projection = nl(e ? e.length : 1, null)),
      o = r.slice(),
      i = t.child;
    for (; i !== null;) {
      if (i.type !== 128) {
        let s = e ? _I(i, e) : 0;
        s !== null && (o[s] ? (o[s].projectionNext = i) : (r[s] = i), (o[s] = i));
      }
      i = i.next;
    }
  }
}
function NI(e, t = 0, n, r, o, i) {
  let s = E$1(),
    a = F$2(),
    c = r ? e + 1 : null;
  c !== null && dn$2(s, a, c, r, o, i, null, n);
  let l = gn$2(a, L + e, 16, null, n || null);
  (l.projection === null && (l.projection = t), Is());
  let d = !s[It] || hs();
  s[X$1][G$2].projection[l.projection] === null && c !== null ? SI(s, a, c) : d && !Qo(l) && iy(a, s, l);
}
function SI(e, t, n) {
  let r = L + n,
    o = t.data[r],
    i = e[r],
    s = Fo(i, o.tView.ssrId);
  or$2(i, rr$2(e, o, void 0, { dehydratedView: s }), 0, cn$2(o, s));
}
function jf(e, t, n, r) {
  return (Ov(e, t, n, r), jf);
}
function Vf(e, t, n) {
  return (Av(e, t, n), Vf);
}
function xI(e) {
  let t = E$1(),
    n = F$2(),
    r = Ts();
  go$1(r + 1);
  let o = Wa(n, r);
  if (e.dirty && fl(t) === ((o.metadata.flags & 2) === 2)) {
    if (o.matches === null) e.reset([]);
    else {
      let i = Lv(t, r);
      (e.reset(i, Vg), e.notifyOnChanges());
    }
    return !0;
  }
  return !1;
}
function AI() {
  return xv(E$1(), Ts());
}
function OI(e) {
  return co$1(Tl(), L + e);
}
function Co$1(e, t) {
  return (e << 17) | (t << 2);
}
function At(e) {
  return (e >> 17) & 32767;
}
function RI(e) {
  return (e & 2) == 2;
}
function kI(e, t) {
  return (e & 131071) | (t << 17);
}
function wa(e) {
  return e | 2;
}
function fn$2(e) {
  return (e & 131068) >> 2;
}
function js(e, t) {
  return (e & -131069) | (t << 2);
}
function LI(e) {
  return (e & 1) === 1;
}
function Ca(e) {
  return e | 1;
}
function PI(e, t, n, r, o, i) {
  let s = i ? t.classBindings : t.styleBindings,
    a = At(s),
    c = fn$2(s);
  e[r] = n;
  let l = !1,
    u;
  if (Array.isArray(n)) {
    let d = n;
    ((u = d[1]), (u === null || Qt$2(d, u) > 0) && (l = !0));
  } else u = n;
  if (o)
    if (c !== 0) {
      let p = At(e[a + 1]);
      ((e[r + 1] = Co$1(p, a)), p !== 0 && (e[p + 1] = js(e[p + 1], r)), (e[a + 1] = kI(e[a + 1], r)));
    } else ((e[r + 1] = Co$1(a, 0)), a !== 0 && (e[a + 1] = js(e[a + 1], r)), (a = r));
  else ((e[r + 1] = Co$1(c, 0)), a === 0 ? (a = r) : (e[c + 1] = js(e[c + 1], r)), (c = r));
  (l && (e[r + 1] = wa(e[r + 1])),
    Nu(e, u, r, !0),
    Nu(e, u, r, !1),
    FI(t, u, e, r, i),
    (s = Co$1(a, c)),
    i ? (t.classBindings = s) : (t.styleBindings = s));
}
function FI(e, t, n, r, o) {
  let i = o ? e.residualClasses : e.residualStyles;
  i != null && typeof t == `string` && Qt$2(i, t) >= 0 && (n[r + 1] = Ca(n[r + 1]));
}
function Nu(e, t, n, r) {
  let o = e[n + 1],
    i = t === null,
    s = r ? At(o) : fn$2(o),
    a = !1;
  for (; s !== 0 && (a === !1 || i);) {
    let c = e[s],
      l = e[s + 1];
    (jI(c, t) && ((a = !0), (e[s + 1] = r ? Ca(l) : wa(l))), (s = r ? At(l) : fn$2(l)));
  }
  a && (e[n + 1] = r ? wa(o) : Ca(o));
}
function jI(e, t) {
  return e === null || t == null || (Array.isArray(e) ? e[1] : e) === t
    ? !0
    : Array.isArray(e) && typeof t == `string`
      ? Qt$2(e, t) >= 0
      : !1;
}
var B$1 = { textEnd: 0, key: 0, keyEnd: 0, value: 0, valueEnd: 0 };
function Hf(e) {
  return e.substring(B$1.key, B$1.keyEnd);
}
function VI(e) {
  return e.substring(B$1.value, B$1.valueEnd);
}
function HI(e) {
  return (Uf(e), Bf(e, pn$2(e, 0, B$1.textEnd)));
}
function Bf(e, t) {
  let n = B$1.textEnd;
  return n === t ? -1 : ((t = B$1.keyEnd = $I(e, (B$1.key = t), n)), pn$2(e, t, n));
}
function BI(e) {
  return (Uf(e), $f(e, pn$2(e, 0, B$1.textEnd)));
}
function $f(e, t) {
  let n = B$1.textEnd,
    r = (B$1.key = pn$2(e, t, n));
  return n === r
    ? -1
    : ((r = B$1.keyEnd = UI(e, r, n)),
      (r = Su(e, r, n, 58)),
      (r = B$1.value = pn$2(e, r, n)),
      (r = B$1.valueEnd = WI(e, r, n)),
      Su(e, r, n, 59));
}
function Uf(e) {
  ((B$1.key = 0), (B$1.keyEnd = 0), (B$1.value = 0), (B$1.valueEnd = 0), (B$1.textEnd = e.length));
}
function pn$2(e, t, n) {
  for (; t < n && e.charCodeAt(t) <= 32;) t++;
  return t;
}
function $I(e, t, n) {
  for (; t < n && e.charCodeAt(t) > 32;) t++;
  return t;
}
function UI(e, t, n) {
  let r;
  for (
    ;
    t < n && ((r = e.charCodeAt(t)) === 45 || r === 95 || ((r & -33) >= 65 && (r & -33) <= 90) || (r >= 48 && r <= 57));
  )
    t++;
  return t;
}
function Su(e, t, n, r) {
  return ((t = pn$2(e, t, n)), t < n && t++, t);
}
function WI(e, t, n) {
  let r = -1,
    o = -1,
    i = -1,
    s = t,
    a = s;
  for (; s < n;) {
    let c = e.charCodeAt(s++);
    if (c === 59) return a;
    (c === 34 || c === 39
      ? (a = s = xu(e, c, s, n))
      : t === s - 4 && i === 85 && o === 82 && r === 76 && c === 40
        ? (a = s = xu(e, 41, s, n))
        : c > 32 && (a = s),
      (i = o),
      (o = r),
      (r = c & -33));
  }
  return a;
}
function xu(e, t, n, r) {
  let o = -1,
    i = n;
  for (; i < r;) {
    let s = e.charCodeAt(i++);
    if (s == t && o !== 92) return i;
    s == 92 && o === 92 ? (o = 0) : (o = s);
  }
  throw new Error();
}
function Wf(e, t, n) {
  return (Gf(e, t, n, !1), Wf);
}
function qf(e, t) {
  return (Gf(e, t, null, !0), qf);
}
function qI(e) {
  zf(Yf, GI, e, !1);
}
function GI(e, t) {
  for (let n = BI(t); n >= 0; n = $f(t, n)) Yf(e, Hf(t), VI(t));
}
function zI(e) {
  zf(eE, QI, e, !0);
}
function QI(e, t) {
  for (let n = HI(t); n >= 0; n = Bf(t, n)) Rn$2(e, Hf(t), !0);
}
function Gf(e, t, n, r) {
  let o = E$1(),
    i = F$2(),
    s = po$1(2);
  if ((i.firstUpdatePass && Zf(i, e, s, r), t !== te$1 && ye$1(o, s, t))) {
    let a = i.data[Ae$1()];
    Kf(i, a, o, o[k$1], e, (o[s + 1] = nE(t, n)), r, s);
  }
}
function zf(e, t, n, r) {
  let o = F$2(),
    i = po$1(2);
  o.firstUpdatePass && Zf(o, null, i, r);
  let s = E$1();
  if (n !== te$1 && ye$1(s, i, n)) {
    let a = o.data[Ae$1()];
    if (Jf(a, r) && !Qf(o, i)) {
      let c = r ? a.classesWithoutHost : a.stylesWithoutHost;
      (c !== null && (n = Yr$2(c, n || ``)), Ta(o, a, s, n, r));
    } else tE(o, a, s, s[k$1], s[i + 1], (s[i + 1] = XI(e, t, n)), r, i);
  }
}
function Qf(e, t) {
  return t >= e.expandoStartIndex;
}
function Zf(e, t, n, r) {
  let o = e.data;
  if (o[n + 1] === null) {
    let i = o[Ae$1()],
      s = Qf(e, n);
    (Jf(i, r) && t === null && !s && (t = !1), (t = ZI(o, i, t, r)), PI(o, i, t, n, s, r));
  }
}
function ZI(e, t, n, r) {
  let o = Nl(e),
    i = r ? t.residualClasses : t.residualStyles;
  if (o === null)
    (r ? t.classBindings : t.styleBindings) === 0 &&
      ((n = Vs(null, e, t, n, r)), (n = Jn$2(n, t.attrs, r)), (i = null));
  else {
    let s = t.directiveStylingLast;
    if (s === -1 || e[s] !== o)
      if (((n = Vs(o, e, t, n, r)), i === null)) {
        let c = YI(e, t, r);
        c !== void 0 && Array.isArray(c) && ((c = Vs(null, e, t, c[1], r)), (c = Jn$2(c, t.attrs, r)), KI(e, t, r, c));
      } else i = JI(e, t, r);
  }
  return (i !== void 0 && (r ? (t.residualClasses = i) : (t.residualStyles = i)), n);
}
function YI(e, t, n) {
  let r = n ? t.classBindings : t.styleBindings;
  if (fn$2(r) !== 0) return e[At(r)];
}
function KI(e, t, n, r) {
  let o = n ? t.classBindings : t.styleBindings;
  e[At(o)] = r;
}
function JI(e, t, n) {
  let r,
    o = t.directiveEnd;
  for (let i = 1 + t.directiveStylingLast; i < o; i++) {
    let s = e[i].hostAttrs;
    r = Jn$2(r, s, n);
  }
  return Jn$2(r, t.attrs, n);
}
function Vs(e, t, n, r, o) {
  let i = null,
    s = n.directiveEnd,
    a = n.directiveStylingLast;
  for (a === -1 ? (a = n.directiveStart) : a++; a < s && ((i = t[a]), (r = Jn$2(r, i.hostAttrs, o)), i !== e);) a++;
  return (e !== null && (n.directiveStylingLast = a), r);
}
function Jn$2(e, t, n) {
  let r = n ? 1 : 2,
    o = -1;
  if (t !== null)
    for (let i = 0; i < t.length; i++) {
      let s = t[i];
      typeof s == `number`
        ? (o = s)
        : o === r && (Array.isArray(e) || (e = e === void 0 ? [] : [``, e]), Rn$2(e, s, n ? !0 : t[++i]));
    }
  return e === void 0 ? null : e;
}
function XI(e, t, n) {
  if (n == null || n === ``) return J$1;
  let r = [],
    o = qn$2(n);
  if (Array.isArray(o)) for (let i = 0; i < o.length; i++) e(r, o[i], !0);
  else if (o instanceof Set) for (let i of o) e(r, i, !0);
  else if (typeof o == `object`) for (let i in o) Object.hasOwn(o, i) && e(r, i, o[i]);
  else typeof o == `string` && t(r, o);
  return r;
}
function Yf(e, t, n) {
  Rn$2(e, t, qn$2(n));
}
function eE(e, t, n) {
  let r = String(t);
  r !== `` && !r.includes(` `) && Rn$2(e, r, n);
}
function tE(e, t, n, r, o, i, s, a) {
  o === te$1 && (o = J$1);
  let c = 0,
    l = 0,
    u = 0 < o.length ? o[0] : null,
    d = 0 < i.length ? i[0] : null;
  for (; u !== null || d !== null;) {
    let p = c < o.length ? o[c + 1] : void 0,
      f = l < i.length ? i[l + 1] : void 0,
      h = null,
      g;
    (u === d
      ? ((c += 2), (l += 2), p !== f && ((h = d), (g = f)))
      : d === null || (u !== null && u < d)
        ? ((c += 2), (h = u))
        : ((l += 2), (h = d), (g = f)),
      h !== null && Kf(e, t, n, r, h, g, s, a),
      (u = c < o.length ? o[c] : null),
      (d = l < i.length ? i[l] : null));
  }
}
function Kf(e, t, n, r, o, i, s, a) {
  if (!(t.type & 3)) return;
  let c = e.data,
    l = c[a + 1];
  if (!zo(LI(l) ? Au(c, t, n, o, fn$2(l), s) : void 0)) {
    zo(i) || (RI(l) && (i = Au(c, null, n, o, a, s)));
    ay(r, s, ss(Ae$1(), n), o, i);
  }
}
function Au(e, t, n, r, o, i) {
  let s = t === null,
    a;
  for (; o > 0;) {
    let c = e[o],
      l = Array.isArray(c),
      u = l ? c[1] : c,
      d = u === null,
      p = n[o + 1];
    p === te$1 && (p = d ? J$1 : void 0);
    let f = d ? ro$1(p, r) : u === r ? p : void 0;
    if ((l && !zo(f) && (f = ro$1(c, r)), zo(f) && ((a = f), s))) return a;
    let h = e[o + 1];
    o = s ? At(h) : fn$2(h);
  }
  if (t !== null) {
    let c = i ? t.residualClasses : t.residualStyles;
    c != null && (a = ro$1(c, r));
  }
  return a;
}
function zo(e) {
  return e !== void 0;
}
function nE(e, t) {
  return (
    e == null || e === `` || (typeof t == `string` ? (e = qn$2(e) + t) : typeof e == `object` && (e = Mn$2(qn$2(e)))),
    e
  );
}
function Jf(e, t) {
  return (e.flags & (t ? 8 : 16)) !== 0;
}
function rE(e, t = ``) {
  let n = E$1(),
    r = F$2(),
    o = e + L,
    i = r.firstCreatePass ? gn$2(r, o, 1, t, null) : r.data[o],
    s = oE(r, n, i, t);
  ((n[o] = s), Io() && ka(r, n, s, i), en$2(i, !1));
}
var oE = (e, t, n, r) => (Eo$1(!0), Im(t[k$1], r));
function iE(e, t, n, r = ``) {
  return ye$1(e, _t(), n) ? t + An$2(n) + r : te$1;
}
function sE(e, t, n, r, o, i = ``) {
  let a = ef(e, wl(), n, o);
  return (po$1(2), a ? t + An$2(n) + r + An$2(o) + i : te$1);
}
function Xf(e) {
  return (Ka(``, e), Xf);
}
function Ka(e, t, n) {
  let r = E$1(),
    o = iE(r, e, t, n);
  return (o !== te$1 && tp(r, Ae$1(), o), Ka);
}
function ep(e, t, n, r, o) {
  let i = E$1(),
    s = sE(i, e, t, n, r, o);
  return (s !== te$1 && tp(i, Ae$1(), s), ep);
}
function tp(e, t, n) {
  let r = ss(t, e);
  Em(e[k$1], r, n);
}
function Ou(e, t, n) {
  let r = F$2();
  r.firstCreatePass && np(t, r.data, r.blueprint, he$2(e), n);
}
function np(e, t, n, r, o) {
  if (((e = V$2(e)), Array.isArray(e))) for (let i = 0; i < e.length; i++) np(e[i], t, n, r, o);
  else {
    let i = F$2(),
      s = E$1(),
      a = Q(),
      c = gt$2(e) ? e : V$2(e.provide),
      l = Xi$1(e),
      u = a.providerIndexes & 1048575,
      d = a.directiveStart,
      p = a.providerIndexes >> 20;
    if (gt$2(e) || !e.multi) {
      let f = new St$1(l, o, ir$2, null),
        h = Bs(c, t, o ? u : u + p, d);
      h === -1
        ? (Ws(ko(a, s), i, c),
          Hs(i, e, t.length),
          t.push(c),
          a.directiveStart++,
          a.directiveEnd++,
          o && (a.providerIndexes += 1048576),
          n.push(f),
          s.push(f))
        : ((n[h] = f), (s[h] = f));
    } else {
      let f = Bs(c, t, u + p, d),
        h = Bs(c, t, u, u + p),
        g = f >= 0 && n[f],
        R = h >= 0 && n[h];
      if ((o && !R) || (!o && !g)) {
        Ws(ko(a, s), i, c);
        let D = lE(o ? cE : aE, n.length, o, r, l, e);
        (!o && R && (n[h].providerFactory = D),
          Hs(i, e, t.length, 0),
          t.push(c),
          a.directiveStart++,
          a.directiveEnd++,
          o && (a.providerIndexes += 1048576),
          n.push(D),
          s.push(D));
      } else {
        let D = rp(n[o ? h : f], l, !o && r);
        Hs(i, e, f > -1 ? f : h, D);
      }
      !o && r && R && n[h].componentProviders++;
    }
  }
}
function Hs(e, t, n, r) {
  let o = gt$2(t),
    i = cl(t);
  if (o || i) {
    let c = (i ? V$2(t.useClass) : t).prototype.ngOnDestroy;
    if (c) {
      let l = e.destroyHooks || (e.destroyHooks = []);
      if (!o && t.multi) {
        let u = l.indexOf(n);
        u === -1 ? l.push(n, [r, c]) : l[u + 1].push(r, c);
      } else l.push(n, c);
    }
  }
}
function rp(e, t, n) {
  return (n && e.componentProviders++, e.multi.push(t) - 1);
}
function Bs(e, t, n, r) {
  for (let o = n; o < r; o++) if (t[o] === e) return o;
  return -1;
}
function aE(e, t, n, r, o) {
  return ba(this.multi, []);
}
function cE(e, t, n, r, o) {
  let i = this.multi,
    s;
  if (this.providerFactory) {
    let a = this.providerFactory.componentProviders,
      c = Wn$1(r, r[m$2], this.providerFactory.index, o);
    ((s = c.slice(0, a)), ba(i, s));
    for (let l = a; l < c.length; l++) s.push(c[l]);
  } else ((s = []), ba(i, s));
  return s;
}
function ba(e, t) {
  for (let n = 0; n < e.length; n++) {
    let r = e[n];
    t.push(r());
  }
  return t;
}
function lE(e, t, n, r, o, i) {
  let s = new St$1(e, n, ir$2, null);
  return ((s.multi = []), (s.index = t), (s.componentProviders = 0), rp(s, o, r && !n), s);
}
function uE(e, t) {
  return (n) => {
    ((n.providersResolver = (r, o) => Ou(r, o ? o(e) : e, !1)),
      t && (n.viewProvidersResolver = (r, o) => Ou(r, o ? o(t) : t, !0)));
  };
}
function op(e, t) {
  let n = e[t];
  return n === te$1 ? void 0 : n;
}
function dE(e, t, n, r, o, i) {
  let s = t + n;
  return ye$1(e, s, o) ? Xd(e, s + 1, i ? r.call(i, o) : r(o)) : op(e, s + 1);
}
function fE(e, t, n, r, o, i, s) {
  let a = t + n;
  return ef(e, a, o, i) ? Xd(e, a + 2, s ? r.call(s, o, i) : r(o, i)) : op(e, a + 2);
}
function pE(e, t) {
  let n = F$2(),
    r,
    o = e + L;
  n.firstCreatePass
    ? ((r = hE(t, n.pipeRegistry)), (n.data[o] = r), r.onDestroy && (n.destroyHooks ??= []).push(o, r.onDestroy))
    : (r = n.data[o]);
  let i = r.factory || (r.factory = qe$1(r.type, !0)),
    a = K$1(ir$2);
  try {
    let c = Ro$1(!1),
      l = i();
    return (Ro$1(c), as(n, E$1(), o, l), l);
  } finally {
    K$1(a);
  }
}
function hE(e, t) {
  if (t)
    for (let n = t.length - 1; n >= 0; n--) {
      let r = t[n];
      if (e === r.name) return r;
    }
}
function gE(e, t, n) {
  let r = e + L,
    o = E$1(),
    i = co$1(o, r);
  return ip(o, r) ? dE(o, Ds(), t, i.transform, n, i) : i.transform(n);
}
function mE(e, t, n, r) {
  let o = e + L,
    i = E$1(),
    s = co$1(i, o);
  return ip(i, o) ? fE(i, Ds(), t, s.transform, n, r, s) : s.transform(n, r);
}
function ip(e, t) {
  return e[m$2].data[t].pure;
}
var sp = (() => {
  class e {
    applicationErrorHandler = w(Je$2);
    appRef = w(oi$2);
    taskService = w(Mt);
    ngZone = w(Ce$1);
    zonelessEnabled = w(Vn$1);
    tracing = w(Ot, { optional: !0 });
    zoneIsDefined = typeof Zone < `u` && !!Zone.root.run;
    schedulerTickApplyArgs = [{ data: { __scheduler_tick__: !0 } }];
    subscriptions = new q();
    angularZoneId = this.zoneIsDefined ? this.ngZone._inner?.get(bn$2) : null;
    scheduleInRootZone = !this.zonelessEnabled && this.zoneIsDefined && (w(xs, { optional: !0 }) ?? !1);
    cancelScheduledCallback = null;
    useMicrotaskScheduler = !1;
    runningTick = !1;
    pendingRenderTaskId = null;
    constructor() {
      (this.subscriptions.add(
        this.appRef.afterTick.subscribe(() => {
          let n = this.taskService.add();
          if (!this.runningTick && (this.cleanup(), !this.zonelessEnabled || this.appRef.includeAllTestViews)) {
            this.taskService.remove(n);
            return;
          }
          (this.switchToMicrotaskScheduler(), this.taskService.remove(n));
        }),
      ),
        this.subscriptions.add(
          this.ngZone.onUnstable.subscribe(() => {
            this.runningTick || this.cleanup();
          }),
        ));
    }
    switchToMicrotaskScheduler() {
      this.ngZone.runOutsideAngular(() => {
        let n = this.taskService.add();
        ((this.useMicrotaskScheduler = !0),
          queueMicrotask(() => {
            ((this.useMicrotaskScheduler = !1), this.taskService.remove(n));
          }));
      });
    }
    notify(n) {
      if (!this.zonelessEnabled && n === 5) return;
      switch (n) {
        case 0:
        case 2:
          this.appRef.dirtyFlags |= 2;
          break;
        case 3:
        case 4:
        case 5:
        case 1:
          this.appRef.dirtyFlags |= 4;
          break;
        case 6:
          this.appRef.dirtyFlags |= 2;
          break;
        case 12:
          this.appRef.dirtyFlags |= 16;
          break;
        case 13:
          this.appRef.dirtyFlags |= 2;
          break;
        case 11:
          break;
        default:
          this.appRef.dirtyFlags |= 8;
      }
      if (
        ((this.appRef.tracingSnapshot = this.tracing?.snapshot(this.appRef.tracingSnapshot) ?? null),
        !this.shouldScheduleTick())
      )
        return;
      let r = this.useMicrotaskScheduler ? jl : Ms;
      ((this.pendingRenderTaskId = this.taskService.add()),
        this.scheduleInRootZone
          ? (this.cancelScheduledCallback = Zone.root.run(() => r(() => this.tick())))
          : (this.cancelScheduledCallback = this.ngZone.runOutsideAngular(() => r(() => this.tick()))));
    }
    shouldScheduleTick() {
      return !(
        this.appRef.destroyed ||
        this.pendingRenderTaskId !== null ||
        this.runningTick ||
        this.appRef._runningTick ||
        (!this.zonelessEnabled && this.zoneIsDefined && Zone.current.get(bn$2 + this.angularZoneId))
      );
    }
    tick() {
      if (this.runningTick || this.appRef.destroyed) return;
      if (this.appRef.dirtyFlags === 0) {
        this.cleanup();
        return;
      }
      !this.zonelessEnabled && this.appRef.dirtyFlags & 7 && (this.appRef.dirtyFlags |= 1);
      let n = this.taskService.add();
      try {
        this.ngZone.run(
          () => {
            ((this.runningTick = !0), this.appRef._tick());
          },
          void 0,
          this.schedulerTickApplyArgs,
        );
      } catch (r) {
        this.applicationErrorHandler(r);
      } finally {
        (this.taskService.remove(n), this.cleanup());
      }
    }
    ngOnDestroy() {
      (this.subscriptions.unsubscribe(), this.cleanup());
    }
    cleanup() {
      if (
        ((this.runningTick = !1),
        this.cancelScheduledCallback?.(),
        (this.cancelScheduledCallback = null),
        this.pendingRenderTaskId !== null)
      ) {
        let n = this.pendingRenderTaskId;
        ((this.pendingRenderTaskId = null), this.taskService.remove(n));
      }
    }
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = er$2({ token: e, factory: e.ɵfac });
  }
  return e;
})();
function ap() {
  return [
    { provide: be$1, useExisting: sp },
    { provide: Ce$1, useClass: _n$2 },
    { provide: Vn$1, useValue: !0 },
  ];
}
var yE = (() => {
  class e {
    compileModuleSync(n) {
      return new Uo$1(n);
    }
    compileModuleAsync(n) {
      return Promise.resolve(this.compileModuleSync(n));
    }
    clearCache() {}
    clearCacheFor(n) {}
    getModuleId(n) {}
    static ɵfac = function (r) {
      return new (r || e)();
    };
    static ɵprov = er$2({ token: e, factory: e.ɵfac });
  }
  return e;
})();
function vE() {
  return (typeof $localize < `u` && $localize.locale) || sr$2;
}
var Ja = new A$1(``, { factory: () => w(Ja, { optional: !0, skipSelf: !0 }) || vE() });
function IE(e, t) {
  return mr(e, t?.equal);
}
function EE(e) {
  return uc(e);
}
(class e extends Error {
  _brand;
  constructor(t) {
    super(t);
  }
  static IDLE = new e(`IDLE`);
  static LOADING = new e(`LOADING`);
});
var dp = Symbol(`InputSignalNode#UNSET`);
var DE = m$3(l({}, yn$2), {
  transformFn: void 0,
  applyValueToInputSignal(e, t) {
    Pt(e, t);
  },
});
function fp(e, t) {
  let n = Object.create(DE);
  ((n.value = e), (n.transformFn = t?.transform));
  function r() {
    if ((rt$2(n), n.value === dp)) throw new M$1(-950, null);
    return n.value;
  }
  return ((r[W] = n), r);
}
var lp = class {
  attributeName;
  constructor(t) {
    this.attributeName = t;
  }
  __NG_ELEMENT_ID__ = () => Qu(this.attributeName);
  toString() {
    return `HostAttributeToken ${this.attributeName}`;
  }
};
function UL(e) {
  return TE(e) ? e.default : e;
}
function TE(e) {
  return e && typeof e == `object` && `default` in e;
}
function up(e, t) {
  return fp(e, t);
}
function wE(e) {
  return fp(dp, e);
}
var WL = ((up.required = wE), up);
var GL = (() => {
  class e {
    static __NG_ELEMENT_ID__ = bE;
  }
  return e;
})();
function bE(e) {
  return _E(Q(), E$1(), (e & 16) === 16);
}
function _E(e, t, n) {
  if (He$1(e) && !n) {
    let r = le$2(e.index, t);
    return new et$2(r, r);
  } else if (e.type & 175) {
    let r = t[X$1];
    return new et$2(r, t);
  }
  return null;
}
var ec = new A$1(``);
var ME = new A$1(``);
function ar$2(e) {
  return !e.moduleRef;
}
function NE(e) {
  let t = ar$2(e) ? e.r3Injector : e.moduleRef.injector,
    n = t.get(Ce$1);
  return n.run(() => {
    ar$2(e) ? e.r3Injector.resolveInjectorInitializers() : e.moduleRef.resolveInjectorInitializers();
    let r = t.get(Je$2),
      o;
    if (
      (n.runOutsideAngular(() => {
        o = n.onError.subscribe({ next: r });
      }),
      ar$2(e))
    ) {
      let i = () => t.destroy(),
        s = e.platformInjector.get(ec);
      (s.add(i),
        t.onDestroy(() => {
          (o.unsubscribe(), s.delete(i));
        }));
    } else {
      let i = () => e.moduleRef.destroy(),
        s = e.platformInjector.get(ec);
      (s.add(i),
        e.moduleRef.onDestroy(() => {
          (Un$2(e.allPlatformModules, e.moduleRef), o.unsubscribe(), s.delete(i));
        }));
    }
    return xE(r, n, () => {
      let i = t.get(Mt),
        s = i.add(),
        a = t.get(Ga);
      return (
        a.runInitializers(),
        a.donePromise
          .then(() => {
            if ((Lf(t.get(Ja, sr$2) || sr$2), !t.get(ME, !0)))
              return ar$2(e) ? t.get(oi$2) : (e.allPlatformModules.push(e.moduleRef), e.moduleRef);
            if (ar$2(e)) {
              let u = t.get(oi$2);
              return (e.rootComponent !== void 0 && u.bootstrap(e.rootComponent), u);
            } else return (SE?.(e.moduleRef, e.allPlatformModules), e.moduleRef);
          })
          .finally(() => {
            i.remove(s);
          })
      );
    });
  });
}
var SE;
function xE(e, t, n) {
  try {
    let r = n();
    return qa(r)
      ? r.catch((o) => {
          throw (t.runOutsideAngular(() => e(o)), o);
        })
      : r;
  } catch (r) {
    throw (t.runOutsideAngular(() => e(r)), r);
  }
}
var ii$2 = null;
function AE(e = [], t) {
  return Te$1.create({
    name: t,
    providers: [
      { provide: Ji$1, useValue: `platform` },
      { provide: ec, useValue: new Set([() => (ii$2 = null)]) },
      ...e,
    ],
  });
}
function OE(e = []) {
  if (ii$2) return ii$2;
  let t = AE(e);
  return ((ii$2 = t), Nf(), RE(t), t);
}
function RE(e) {
  let t = e.get(Wl, null);
  io$1(e, () => {
    t?.forEach((n) => n());
  });
}
function zL(e) {
  let { rootComponent: t, appProviders: n, platformProviders: r, platformRef: o } = e;
  O$1(N$1.BootstrapApplicationStart);
  try {
    let i = o?.injector ?? OE(r);
    return NE({
      r3Injector: new Kn$1({
        providers: [ap(), Hl, ...(n || [])],
        parent: i,
        debugName: ``,
        runEnvironmentInitializers: !1,
      }).injector,
      platformInjector: i,
      rootComponent: t,
    });
  } catch (i) {
    return Promise.reject(i);
  } finally {
    O$1(N$1.BootstrapApplicationEnd);
  }
}
function QL(e) {
  return typeof e == `boolean` ? e : e != null && e !== `false`;
}
function ZL(e, t = NaN) {
  return !isNaN(parseFloat(e)) && !isNaN(Number(e)) ? Number(e) : t;
}
var Xa = Symbol(`NOT_SET`);
var pp = new Set();
var kE = m$3(l({}, yn$2), {
  kind: `afterRenderEffectPhase`,
  consumerIsAlwaysLive: !0,
  consumerAllowSignalWrites: !0,
  value: Xa,
  cleanup: null,
  consumerMarkedDirty() {
    if (this.sequence.impl.executing) {
      if (this.sequence.lastPhase === null || this.sequence.lastPhase < this.phase) return;
      this.sequence.erroredOrDestroyed = !0;
    }
    this.sequence.scheduler.notify(7);
  },
  phaseFn(e) {
    if (((this.sequence.lastPhase = this.phase), !this.dirty)) return this.signal;
    if (((this.dirty = !1), this.value !== Xa && !kt$1(this))) return this.signal;
    try {
      for (let o of this.cleanup ?? pp) o();
    } finally {
      this.cleanup?.clear();
    }
    let t = [];
    (e !== void 0 && t.push(e), t.push(this.registerCleanupFn));
    let n = Ue$2(this),
      r;
    try {
      r = this.userFn.apply(null, t);
    } finally {
      ot$2(this, n);
    }
    return ((this.value === Xa || !this.equal(this.value, r)) && ((this.value = r), this.version++), this.signal);
  },
});
var tc = class extends Gn$2 {
  scheduler;
  lastPhase = null;
  nodes = [void 0, void 0, void 0, void 0];
  onDestroyFns = null;
  constructor(t, n, r, o, i, s = null) {
    (super(t, [void 0, void 0, void 0, void 0], r, !1, i.get(we$2), s), (this.scheduler = o));
    for (let a of xa) {
      let c = n[a];
      if (c === void 0) continue;
      let l = Object.create(kE);
      ((l.sequence = this),
        (l.phase = a),
        (l.userFn = c),
        (l.dirty = !0),
        (l.signal = () => (rt$2(l), l.value)),
        (l.signal[W] = l),
        (l.registerCleanupFn = (u) => (l.cleanup ??= new Set()).add(u)),
        (this.nodes[a] = l),
        (this.hooks[a] = (u) => l.phaseFn(u)));
    }
  }
  afterRun() {
    (super.afterRun(), (this.lastPhase = null));
  }
  destroy() {
    if (this.onDestroyFns !== null) for (let t of this.onDestroyFns) t();
    super.destroy();
    for (let t of this.nodes)
      if (t)
        try {
          for (let n of t.cleanup ?? pp) n();
        } finally {
          We(t);
        }
  }
};
function YL(e, t) {
  let n = t?.injector ?? w(Te$1),
    r = n.get(be$1),
    o = n.get(Ko),
    i = n.get(Ot, null, { optional: !0 });
  o.impl ??= n.get(Aa);
  let s = e;
  typeof s == `function` && (s = { mixedReadWrite: e });
  let a = n.get(tn$2, null, { optional: !0 }),
    c = new tc(o.impl, [s.earlyRead, s.write, s.mixedReadWrite, s.read], a?.view, r, n, i?.snapshot(null));
  return (o.impl.register(c), c);
}
function KL(e, t) {
  let n = Ge(e),
    r = t.elementInjector || Yt$2();
  return new ln$2(n).create(r, t.projectableNodes, t.hostElement, t.environmentInjector, t.directives, t.bindings);
}
function JL() {
  return !1;
}
var Vt$1 = null;
function U() {
  return Vt$1;
}
function Je$1(n) {
  Vt$1 ??= n;
}
var ce$1 = class {};
var ie = (() => {
  class n {
    historyGo(e) {
      throw new Error(``);
    }
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵprov = se$1({ token: n, factory: () => w(zt$1), providedIn: `platform` });
  }
  return n;
})();
var zt$1 = (() => {
  class n extends ie {
    _location;
    _history;
    _doc = w(jn$2);
    constructor() {
      (super(), (this._location = window.location), (this._history = window.history));
    }
    getBaseHrefFromDOM() {
      return U().getBaseHref(this._doc);
    }
    onPopState(e) {
      let r = U().getGlobalEventTarget(this._doc, `window`);
      return (r.addEventListener(`popstate`, e, !1), () => r.removeEventListener(`popstate`, e));
    }
    onHashChange(e) {
      let r = U().getGlobalEventTarget(this._doc, `window`);
      return (r.addEventListener(`hashchange`, e, !1), () => r.removeEventListener(`hashchange`, e));
    }
    get href() {
      return this._location.href;
    }
    get protocol() {
      return this._location.protocol;
    }
    get hostname() {
      return this._location.hostname;
    }
    get port() {
      return this._location.port;
    }
    get pathname() {
      return this._location.pathname;
    }
    get search() {
      return this._location.search;
    }
    get hash() {
      return this._location.hash;
    }
    set pathname(e) {
      this._location.pathname = e;
    }
    pushState(e, r, i) {
      this._history.pushState(e, r, i);
    }
    replaceState(e, r, i) {
      this._history.replaceState(e, r, i);
    }
    forward() {
      this._history.forward();
    }
    back() {
      this._history.back();
    }
    historyGo(e = 0) {
      this._history.go(e);
    }
    getState() {
      return this._history.state;
    }
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵprov = se$1({ token: n, factory: () => new n(), providedIn: `platform` });
  }
  return n;
})();
function Wt$1(n, t) {
  return n
    ? t
      ? n.endsWith(`/`)
        ? t.startsWith(`/`)
          ? n + t.slice(1)
          : n + t
        : t.startsWith(`/`)
          ? n + t
          : `${n}/${t}`
      : n
    : t;
}
function Ht$1(n) {
  let t = n.search(/#|\?|$/);
  return n[t - 1] === `/` ? n.slice(0, t - 1) + n.slice(t) : n;
}
function G$1(n) {
  return n && n[0] !== `?` ? `?${n}` : n;
}
var Me$1 = (() => {
  class n {
    historyGo(e) {
      throw new Error(``);
    }
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵprov = se$1({ token: n, factory: () => w(jn$1), providedIn: `root` });
  }
  return n;
})();
var Un$1 = new A$1(``);
var jn$1 = (() => {
  class n extends Me$1 {
    _platformLocation;
    _baseHref;
    _removeListenerFns = [];
    constructor(e, r) {
      (super(),
        (this._platformLocation = e),
        (this._baseHref = r ?? this._platformLocation.getBaseHrefFromDOM() ?? w(jn$2).location?.origin ?? ``));
    }
    ngOnDestroy() {
      for (; this._removeListenerFns.length;) this._removeListenerFns.pop()();
    }
    onPopState(e) {
      this._removeListenerFns.push(this._platformLocation.onPopState(e), this._platformLocation.onHashChange(e));
    }
    getBaseHref() {
      return this._baseHref;
    }
    prepareExternalUrl(e) {
      return Wt$1(this._baseHref, e);
    }
    path(e = !1) {
      let r = this._platformLocation.pathname + G$1(this._platformLocation.search),
        i = this._platformLocation.hash;
      return i && e ? `${r}${i}` : r;
    }
    pushState(e, r, i, o) {
      let s = this.prepareExternalUrl(i + G$1(o));
      this._platformLocation.pushState(e, r, s);
    }
    replaceState(e, r, i, o) {
      let s = this.prepareExternalUrl(i + G$1(o));
      this._platformLocation.replaceState(e, r, s);
    }
    forward() {
      this._platformLocation.forward();
    }
    back() {
      this._platformLocation.back();
    }
    getState() {
      return this._platformLocation.getState();
    }
    historyGo(e = 0) {
      this._platformLocation.historyGo?.(e);
    }
    static ɵfac = function (r) {
      return new (r || n)(De$2(ie), De$2(Un$1, 8));
    };
    static ɵprov = se$1({ token: n, factory: n.ɵfac, providedIn: `root` });
  }
  return n;
})();
var Xt$1 = (() => {
  class n {
    _subject = new Z$2();
    _basePath;
    _locationStrategy;
    _urlChangeListeners = [];
    _urlChangeSubscription = null;
    constructor(e) {
      this._locationStrategy = e;
      let r = this._locationStrategy.getBaseHref();
      ((this._basePath = zn$1(Ht$1(Gt$1(r)))),
        this._locationStrategy.onPopState((i) => {
          this._subject.next({ url: this.path(!0), pop: !0, state: i.state, type: i.type });
        }));
    }
    ngOnDestroy() {
      (this._urlChangeSubscription?.unsubscribe(), (this._urlChangeListeners = []));
    }
    path(e = !1) {
      return this.normalize(this._locationStrategy.path(e));
    }
    getState() {
      return this._locationStrategy.getState();
    }
    isCurrentPathEqualTo(e, r = ``) {
      return this.path() == this.normalize(e + G$1(r));
    }
    normalize(e) {
      return n.stripTrailingSlash(Vn(this._basePath, Gt$1(e)));
    }
    prepareExternalUrl(e) {
      return (e && e[0] !== `/` && (e = `/` + e), this._locationStrategy.prepareExternalUrl(e));
    }
    go(e, r = ``, i = null) {
      (this._locationStrategy.pushState(i, ``, e, r),
        this._notifyUrlChangeListeners(this.prepareExternalUrl(e + G$1(r)), i));
    }
    replaceState(e, r = ``, i = null) {
      (this._locationStrategy.replaceState(i, ``, e, r),
        this._notifyUrlChangeListeners(this.prepareExternalUrl(e + G$1(r)), i));
    }
    forward() {
      this._locationStrategy.forward();
    }
    back() {
      this._locationStrategy.back();
    }
    historyGo(e = 0) {
      this._locationStrategy.historyGo?.(e);
    }
    onUrlChange(e) {
      return (
        this._urlChangeListeners.push(e),
        (this._urlChangeSubscription ??= this.subscribe((r) => {
          this._notifyUrlChangeListeners(r.url, r.state);
        })),
        () => {
          let r = this._urlChangeListeners.indexOf(e);
          (this._urlChangeListeners.splice(r, 1),
            this._urlChangeListeners.length === 0 &&
              (this._urlChangeSubscription?.unsubscribe(), (this._urlChangeSubscription = null)));
        }
      );
    }
    _notifyUrlChangeListeners(e = ``, r) {
      this._urlChangeListeners.forEach((i) => i(e, r));
    }
    subscribe(e, r, i) {
      return this._subject.subscribe({ next: e, error: r ?? void 0, complete: i ?? void 0 });
    }
    static normalizeQueryParams = G$1;
    static joinWithSlash = Wt$1;
    static stripTrailingSlash = Ht$1;
    static ɵfac = function (r) {
      return new (r || n)(De$2(Me$1));
    };
    static ɵprov = se$1({ token: n, factory: () => $n$1(), providedIn: `root` });
  }
  return n;
})();
function $n$1() {
  return new Xt$1(De$2(Me$1));
}
function Vn(n, t) {
  if (!n || !t.startsWith(n)) return t;
  let e = t.substring(n.length);
  return e === `` || [`/`, `;`, `?`, `#`].includes(e[0]) ? e : t;
}
function Gt$1(n) {
  return n.replace(/\/index\.html$/, ``);
}
function zn$1(n) {
  if (new RegExp(`^(https?:)?//`).test(n)) {
    let [, e] = n.split(/\/\/[^\/]+/);
    return e;
  }
  return n;
}
var Be = (function (n) {
  return (
    (n[(n.Decimal = 0)] = `Decimal`),
    (n[(n.Percent = 1)] = `Percent`),
    (n[(n.Currency = 2)] = `Currency`),
    (n[(n.Scientific = 3)] = `Scientific`),
    n
  );
})(Be || {});
var _ = (function (n) {
  return ((n[(n.Format = 0)] = `Format`), (n[(n.Standalone = 1)] = `Standalone`), n);
})(_ || {});
var m$1 = (function (n) {
  return (
    (n[(n.Narrow = 0)] = `Narrow`),
    (n[(n.Abbreviated = 1)] = `Abbreviated`),
    (n[(n.Wide = 2)] = `Wide`),
    (n[(n.Short = 3)] = `Short`),
    n
  );
})(m$1 || {});
var F$1 = (function (n) {
  return (
    (n[(n.Short = 0)] = `Short`),
    (n[(n.Medium = 1)] = `Medium`),
    (n[(n.Long = 2)] = `Long`),
    (n[(n.Full = 3)] = `Full`),
    n
  );
})(F$1 || {});
var A = {
  Decimal: 0,
  Group: 1,
  List: 2,
  PercentSign: 3,
  PlusSign: 4,
  MinusSign: 5,
  Exponential: 6,
  SuperscriptingExponent: 7,
  PerMille: 8,
  Infinity: 9,
  NaN: 10,
  TimeSeparator: 11,
  CurrencyDecimal: 12,
  CurrencyGroup: 13,
};
function Jt$1(n) {
  return EI(n)[DI.LocaleId];
}
function qt$1(n, t, e) {
  let r = EI(n);
  return P$1(P$1([r[DI.DayPeriodsFormat], r[DI.DayPeriodsStandalone]], t), e);
}
function Qt$1(n, t, e) {
  let r = EI(n);
  return P$1(P$1([r[DI.DaysFormat], r[DI.DaysStandalone]], t), e);
}
function en$1(n, t, e) {
  let r = EI(n);
  return P$1(P$1([r[DI.MonthsFormat], r[DI.MonthsStandalone]], t), e);
}
function tn$1(n, t) {
  let r = EI(n)[DI.Eras];
  return P$1(r, t);
}
function de$1(n, t) {
  return P$1(EI(n)[DI.DateFormat], t);
}
function le$1(n, t) {
  return P$1(EI(n)[DI.TimeFormat], t);
}
function fe$1(n, t) {
  let r = EI(n)[DI.DateTimeFormat];
  return P$1(r, t);
}
function I(n, t) {
  let e = EI(n),
    r = e[DI.NumberSymbols][t];
  if (typeof r > `u`) {
    if (t === A.CurrencyDecimal) return e[DI.NumberSymbols][A.Decimal];
    if (t === A.CurrencyGroup) return e[DI.NumberSymbols][A.Group];
  }
  return r;
}
function rt$1(n, t) {
  return EI(n)[DI.NumberFormats][t];
}
function nn$1(n) {
  if (!n[DI.ExtraData]) throw new M$1(2303, !1);
}
function rn$1(n) {
  let t = EI(n);
  return (nn$1(t), (t[DI.ExtraData][2] || []).map((r) => (typeof r == `string` ? qe(r) : [qe(r[0]), qe(r[1])])));
}
function on$1(n, t, e) {
  let r = EI(n);
  nn$1(r);
  return P$1(P$1([r[DI.ExtraData][0], r[DI.ExtraData][1]], t) || [], e) || [];
}
function P$1(n, t) {
  for (let e = t; e > -1; e--) if (typeof n[e] < `u`) return n[e];
  throw new M$1(2304, !1);
}
function qe(n) {
  let [t, e] = n.split(`:`);
  return { hours: +t, minutes: +e };
}
var Hn$1 = /^(\d{4,})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
var Ie$1 = Object.create(null);
var Gn$1 =
  /((?:[^BEGHLMOSWYZabcdhmswyz']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|Y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|c{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
var Wn = 256;
function sn$1(n, t, e, r) {
  let i = nr$1(n);
  (Xn$1(t), (t = j(e, t) || t));
  let s = [],
    a;
  for (; t;)
    if (((a = Gn$1.exec(t)), a)) {
      s = s.concat(a.slice(1));
      let c = s.pop();
      if (!c) break;
      t = c;
    } else {
      s.push(t);
      break;
    }
  let u = i.getTimezoneOffset();
  r && ((u = un$1(r, u)), (i = tr$1(i, r)));
  let d = ``;
  return (
    s.forEach((c) => {
      let l = Qn(c);
      d += l ? l(i, e, u) : c === `''` ? `'` : c.replace(/(^'|'$)/g, ``).replace(/''/g, `'`);
    }),
    d
  );
}
function Xn$1(n) {
  if (n.length > Wn) throw new M$1(2300, !1);
}
function xe$1(n, t, e) {
  let r = new Date(0);
  return (r.setFullYear(n, t, e), r.setHours(0, 0, 0), r);
}
function j(n, t) {
  let e = Jt$1(n);
  if (((Ie$1[e] ??= Object.create(null)), Ie$1[e][t])) return Ie$1[e][t];
  let r = ``;
  switch (t) {
    case `shortDate`:
      r = de$1(n, F$1.Short);
      break;
    case `mediumDate`:
      r = de$1(n, F$1.Medium);
      break;
    case `longDate`:
      r = de$1(n, F$1.Long);
      break;
    case `fullDate`:
      r = de$1(n, F$1.Full);
      break;
    case `shortTime`:
      r = le$1(n, F$1.Short);
      break;
    case `mediumTime`:
      r = le$1(n, F$1.Medium);
      break;
    case `longTime`:
      r = le$1(n, F$1.Long);
      break;
    case `fullTime`:
      r = le$1(n, F$1.Full);
      break;
    case `short`:
      let i = j(n, `shortTime`),
        o = j(n, `shortDate`);
      r = Pe$1(fe$1(n, F$1.Short), [i, o]);
      break;
    case `medium`:
      let s = j(n, `mediumTime`),
        a = j(n, `mediumDate`);
      r = Pe$1(fe$1(n, F$1.Medium), [s, a]);
      break;
    case `long`:
      let u = j(n, `longTime`),
        d = j(n, `longDate`);
      r = Pe$1(fe$1(n, F$1.Long), [u, d]);
      break;
    case `full`:
      let c = j(n, `fullTime`),
        l = j(n, `fullDate`);
      r = Pe$1(fe$1(n, F$1.Full), [c, l]);
      break;
  }
  return (r && (Ie$1[e][t] = r), r);
}
function Pe$1(n, t) {
  return (
    t &&
      (n = n.replace(/\{([^}]+)}/g, function (e, r) {
        return Object.hasOwn(t, r) ? t[r] : e;
      })),
    n
  );
}
function N(n, t, e = `-`, r, i) {
  let o = ``;
  (n < 0 || (i && n <= 0)) && (i ? (n = -n + 1) : ((n = -n), (o = e)));
  let s = String(n);
  for (; s.length < t;) s = `0` + s;
  return (r && (s = s.slice(s.length - t)), o + s);
}
function Yn$1(n, t) {
  return N(n, 3).substring(0, t);
}
function S(n, t, e = 0, r = !1, i = !1) {
  return function (o, s) {
    let a = Zn$1(n, o);
    if (((e > 0 || a > -e) && (a += e), n === 3)) a === 0 && e === -12 && (a = 12);
    else if (n === 6) return Yn$1(a, t);
    let u = I(s, A.MinusSign);
    return N(a, t, u, r, i);
  };
}
function Zn$1(n, t) {
  switch (n) {
    case 0:
      return t.getFullYear();
    case 1:
      return t.getMonth();
    case 2:
      return t.getDate();
    case 3:
      return t.getHours();
    case 4:
      return t.getMinutes();
    case 5:
      return t.getSeconds();
    case 6:
      return t.getMilliseconds();
    case 7:
      return t.getDay();
    default:
      throw new M$1(2301, !1);
  }
}
function y(n, t, e = _.Format, r = !1) {
  return function (i, o) {
    return Kn(i, o, n, t, e, r);
  };
}
function Kn(n, t, e, r, i, o) {
  switch (e) {
    case 2:
      return en$1(t, i, r)[n.getMonth()];
    case 1:
      return Qt$1(t, i, r)[n.getDay()];
    case 0:
      let s = n.getHours(),
        a = n.getMinutes();
      if (o) {
        let d = rn$1(t),
          c = on$1(t, i, r),
          l = d.findIndex((g) => {
            if (Array.isArray(g)) {
              let [h, w] = g,
                L = s >= h.hours && a >= h.minutes,
                v = s < w.hours || (s === w.hours && a < w.minutes);
              if (h.hours < w.hours) {
                if (L && v) return !0;
              } else if (L || v) return !0;
            } else if (g.hours === s && g.minutes === a) return !0;
            return !1;
          });
        if (l !== -1) return c[l];
      }
      return qt$1(t, i, r)[s < 12 ? 0 : 1];
    case 3:
      return tn$1(t, r)[n.getFullYear() <= 0 ? 0 : 1];
    default:
      throw new M$1(2302, !1);
  }
}
function Oe$1(n) {
  return function (t, e, r) {
    let i = -1 * r,
      o = I(e, A.MinusSign),
      s = i > 0 ? Math.floor(i / 60) : Math.ceil(i / 60);
    switch (n) {
      case 0:
        return (i >= 0 ? `+` : ``) + N(s, 2, o) + N(Math.abs(i % 60), 2, o);
      case 1:
        return `GMT` + (i >= 0 ? `+` : ``) + N(s, 1, o);
      case 2:
        return `GMT` + (i >= 0 ? `+` : ``) + N(s, 2, o) + `:` + N(Math.abs(i % 60), 2, o);
      case 3:
        return r === 0 ? `Z` : (i >= 0 ? `+` : ``) + N(s, 2, o) + `:` + N(Math.abs(i % 60), 2, o);
      default:
        throw new M$1(2310, !1);
    }
  };
}
var Jn$1 = 0;
var Le$1 = 4;
function qn$1(n) {
  let t = xe$1(n, Jn$1, 1).getDay();
  return xe$1(n, 0, 1 + (t <= Le$1 ? Le$1 : Le$1 + 7) - t);
}
function an$1(n) {
  let t = n.getDay(),
    e = t === 0 ? -3 : Le$1 - t;
  return xe$1(n.getFullYear(), n.getMonth(), n.getDate() + e);
}
function Qe$1(n, t = !1) {
  return function (e, r) {
    let i;
    if (t) {
      let o = new Date(e.getFullYear(), e.getMonth(), 1).getDay() - 1,
        s = e.getDate();
      i = 1 + Math.floor((s + o) / 7);
    } else {
      let o = an$1(e),
        s = qn$1(o.getFullYear()),
        a = o.getTime() - s.getTime();
      i = 1 + Math.round(a / 6048e5);
    }
    return N(i, n, I(r, A.MinusSign));
  };
}
function Ne$1(n, t = !1) {
  return function (e, r) {
    return N(an$1(e).getFullYear(), n, I(r, A.MinusSign), t);
  };
}
var et$1 = Object.create(null);
function Qn(n) {
  if (et$1[n]) return et$1[n];
  let t;
  switch (n) {
    case `G`:
    case `GG`:
    case `GGG`:
      t = y(3, m$1.Abbreviated);
      break;
    case `GGGG`:
      t = y(3, m$1.Wide);
      break;
    case `GGGGG`:
      t = y(3, m$1.Narrow);
      break;
    case `y`:
      t = S(0, 1, 0, !1, !0);
      break;
    case `yy`:
      t = S(0, 2, 0, !0, !0);
      break;
    case `yyy`:
      t = S(0, 3, 0, !1, !0);
      break;
    case `yyyy`:
      t = S(0, 4, 0, !1, !0);
      break;
    case `Y`:
      t = Ne$1(1);
      break;
    case `YY`:
      t = Ne$1(2, !0);
      break;
    case `YYY`:
      t = Ne$1(3);
      break;
    case `YYYY`:
      t = Ne$1(4);
      break;
    case `M`:
    case `L`:
      t = S(1, 1, 1);
      break;
    case `MM`:
    case `LL`:
      t = S(1, 2, 1);
      break;
    case `MMM`:
      t = y(2, m$1.Abbreviated);
      break;
    case `MMMM`:
      t = y(2, m$1.Wide);
      break;
    case `MMMMM`:
      t = y(2, m$1.Narrow);
      break;
    case `LLL`:
      t = y(2, m$1.Abbreviated, _.Standalone);
      break;
    case `LLLL`:
      t = y(2, m$1.Wide, _.Standalone);
      break;
    case `LLLLL`:
      t = y(2, m$1.Narrow, _.Standalone);
      break;
    case `w`:
      t = Qe$1(1);
      break;
    case `ww`:
      t = Qe$1(2);
      break;
    case `W`:
      t = Qe$1(1, !0);
      break;
    case `d`:
      t = S(2, 1);
      break;
    case `dd`:
      t = S(2, 2);
      break;
    case `c`:
    case `cc`:
      t = S(7, 1);
      break;
    case `ccc`:
      t = y(1, m$1.Abbreviated, _.Standalone);
      break;
    case `cccc`:
      t = y(1, m$1.Wide, _.Standalone);
      break;
    case `ccccc`:
      t = y(1, m$1.Narrow, _.Standalone);
      break;
    case `cccccc`:
      t = y(1, m$1.Short, _.Standalone);
      break;
    case `E`:
    case `EE`:
    case `EEE`:
      t = y(1, m$1.Abbreviated);
      break;
    case `EEEE`:
      t = y(1, m$1.Wide);
      break;
    case `EEEEE`:
      t = y(1, m$1.Narrow);
      break;
    case `EEEEEE`:
      t = y(1, m$1.Short);
      break;
    case `a`:
    case `aa`:
    case `aaa`:
      t = y(0, m$1.Abbreviated);
      break;
    case `aaaa`:
      t = y(0, m$1.Wide);
      break;
    case `aaaaa`:
      t = y(0, m$1.Narrow);
      break;
    case `b`:
    case `bb`:
    case `bbb`:
      t = y(0, m$1.Abbreviated, _.Standalone, !0);
      break;
    case `bbbb`:
      t = y(0, m$1.Wide, _.Standalone, !0);
      break;
    case `bbbbb`:
      t = y(0, m$1.Narrow, _.Standalone, !0);
      break;
    case `B`:
    case `BB`:
    case `BBB`:
      t = y(0, m$1.Abbreviated, _.Format, !0);
      break;
    case `BBBB`:
      t = y(0, m$1.Wide, _.Format, !0);
      break;
    case `BBBBB`:
      t = y(0, m$1.Narrow, _.Format, !0);
      break;
    case `h`:
      t = S(3, 1, -12);
      break;
    case `hh`:
      t = S(3, 2, -12);
      break;
    case `H`:
      t = S(3, 1);
      break;
    case `HH`:
      t = S(3, 2);
      break;
    case `m`:
      t = S(4, 1);
      break;
    case `mm`:
      t = S(4, 2);
      break;
    case `s`:
      t = S(5, 1);
      break;
    case `ss`:
      t = S(5, 2);
      break;
    case `S`:
      t = S(6, 1);
      break;
    case `SS`:
      t = S(6, 2);
      break;
    case `SSS`:
      t = S(6, 3);
      break;
    case `Z`:
    case `ZZ`:
    case `ZZZ`:
      t = Oe$1(0);
      break;
    case `ZZZZZ`:
      t = Oe$1(3);
      break;
    case `O`:
    case `OO`:
    case `OOO`:
    case `z`:
    case `zz`:
    case `zzz`:
      t = Oe$1(1);
      break;
    case `OOOO`:
    case `ZZZZ`:
    case `zzzz`:
      t = Oe$1(2);
      break;
    default:
      return null;
  }
  return ((et$1[n] = t), t);
}
function un$1(n, t) {
  n = n.replace(/:/g, ``);
  let e = Date.parse(`Jan 01, 1970 00:00:00 ` + n) / 6e4;
  return isNaN(e) ? t : e;
}
function er$1(n, t) {
  return ((n = new Date(n.getTime())), n.setMinutes(n.getMinutes() + t), n);
}
function tr$1(n, t, e) {
  let i = n.getTimezoneOffset();
  return er$1(n, -1 * (un$1(t, i) - i));
}
function nr$1(n) {
  if (Yt$1(n)) return n;
  if (typeof n == `number` && !isNaN(n)) return new Date(n);
  if (typeof n == `string`) {
    if (((n = n.trim()), /^(\d{4}(-\d{1,2}(-\d{1,2})?)?)$/.test(n))) {
      let [i, o = 1, s = 1] = n.split(`-`).map((a) => +a);
      return xe$1(i, o - 1, s);
    }
    let e = parseFloat(n);
    if (!isNaN(n - e)) return new Date(e);
    let r;
    if ((r = n.match(Hn$1))) return rr$1(r);
  }
  let t = new Date(n);
  if (!Yt$1(t)) throw new M$1(2311, !1);
  return t;
}
function rr$1(n) {
  let t = new Date(0),
    e = 0,
    r = 0,
    i = n[8] ? t.setUTCFullYear : t.setFullYear,
    o = n[8] ? t.setUTCHours : t.setHours;
  (n[9] && ((e = Number(n[9] + n[10])), (r = Number(n[9] + n[11]))),
    i.call(t, Number(n[1]), Number(n[2]) - 1, Number(n[3])));
  let s = Number(n[4] || 0) - e,
    a = Number(n[5] || 0) - r,
    u = Number(n[6] || 0),
    d = Math.floor(parseFloat(`0.` + (n[7] || 0)) * 1e3);
  return (o.call(t, s, a, u, d), t);
}
function Yt$1(n) {
  return n instanceof Date && !isNaN(n.valueOf());
}
var ir$1 = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
var Zt$1 = 22;
var ke$1 = `.`;
var he$1 = `0`;
var or$1 = `;`;
var sr$1 = `,`;
var tt$1 = `#`;
var ar$1 = `%`;
function cn$1(n, t, e, r, i, o, s = !1) {
  let a = ``,
    u = !1;
  if (!isFinite(n)) a = I(e, Number.isNaN(n) ? A.NaN : A.Infinity);
  else {
    let d = cr$1(n);
    s && (d = ur$1(d));
    let c = t.minInt,
      l = t.minFrac,
      g = t.maxFrac;
    if (o) {
      let R = o.match(ir$1);
      if (R === null) throw new M$1(2306, !1);
      let W = R[1],
        k = R[3],
        O = R[5];
      (W != null && (c = nt$1(W)),
        k != null && (l = nt$1(k)),
        O != null ? (g = nt$1(O)) : k != null && l > g && (g = l));
      let B = 100;
      if (c > B || l > B || g > B) throw new M$1(2306, !1);
    }
    dr$1(d, l, g);
    let h = d.digits,
      w = d.integerLen,
      L = d.exponent,
      v = [];
    for (u = h.every((R) => !R); w < c; w++) h.unshift(0);
    for (; w < 0; w++) h.unshift(0);
    w > 0 ? (v = h.splice(w, h.length)) : ((v = h), (h = [0]));
    let x = [];
    for (h.length >= t.lgSize && x.unshift(h.splice(-t.lgSize, h.length).join(``)); h.length > t.gSize;)
      x.unshift(h.splice(-t.gSize, h.length).join(``));
    (h.length && x.unshift(h.join(``)),
      (a = x.join(I(e, r))),
      v.length && (a += I(e, i) + v.join(``)),
      L && (a += I(e, A.Exponential) + `+` + L));
  }
  return (n < 0 && !u ? (a = t.negPre + a + t.negSuf) : (a = t.posPre + a + t.posSuf), a);
}
function dn$1(n, t, e) {
  return cn$1(n, fn$1(rt$1(t, Be.Percent), I(t, A.MinusSign)), t, A.Group, A.Decimal, e, !0).replace(
    new RegExp(ar$1, `g`),
    I(t, A.PercentSign),
  );
}
function ln$1(n, t, e) {
  return cn$1(n, fn$1(rt$1(t, Be.Decimal), I(t, A.MinusSign)), t, A.Group, A.Decimal, e);
}
function fn$1(n, t = `-`) {
  let e = { minInt: 1, minFrac: 0, maxFrac: 0, posPre: ``, posSuf: ``, negPre: ``, negSuf: ``, gSize: 0, lgSize: 0 },
    r = n.split(or$1),
    i = r[0],
    o = r[1],
    s =
      i.indexOf(ke$1) !== -1
        ? i.split(ke$1)
        : [i.substring(0, i.lastIndexOf(he$1) + 1), i.substring(i.lastIndexOf(he$1) + 1)],
    a = s[0],
    u = s[1] || ``;
  e.posPre = a.substring(0, a.indexOf(tt$1));
  for (let c = 0; c < u.length; c++) {
    let l = u.charAt(c);
    l === he$1 ? (e.minFrac = e.maxFrac = c + 1) : l === tt$1 ? (e.maxFrac = c + 1) : (e.posSuf += l);
  }
  let d = a.split(sr$1);
  if (((e.gSize = d[1] ? d[1].length : 0), (e.lgSize = d[2] || d[1] ? (d[2] || d[1]).length : 0), o)) {
    let c = i.length - e.posPre.length - e.posSuf.length,
      l = o.indexOf(tt$1);
    ((e.negPre = o.substring(0, l).replace(/'/g, ``)), (e.negSuf = o.slice(l + c).replace(/'/g, ``)));
  } else ((e.negPre = t + e.posPre), (e.negSuf = e.posSuf));
  return e;
}
function ur$1(n) {
  if (n.digits[0] === 0) return n;
  let t = n.digits.length - n.integerLen;
  return (
    n.exponent ? (n.exponent += 2) : (t === 0 ? n.digits.push(0, 0) : t === 1 && n.digits.push(0), (n.integerLen += 2)),
    n
  );
}
function cr$1(n) {
  let t = Math.abs(n) + ``,
    e = 0,
    r,
    i,
    o,
    s,
    a;
  for (
    (i = t.indexOf(ke$1)) > -1 && (t = t.replace(ke$1, ``)),
      (o = t.search(/e/i)) > 0
        ? (i < 0 && (i = o), (i += +t.slice(o + 1)), (t = t.substring(0, o)))
        : i < 0 && (i = t.length),
      o = 0;
    t.charAt(o) === he$1;
    o++
  );
  if (o === (a = t.length)) ((r = [0]), (i = 1));
  else {
    for (a--; t.charAt(a) === he$1;) a--;
    for (i -= o, r = [], s = 0; o <= a; o++, s++) r[s] = Number(t.charAt(o));
  }
  return (i > Zt$1 && ((r = r.splice(0, Zt$1 - 1)), (e = i - 1), (i = 1)), { digits: r, exponent: e, integerLen: i });
}
function dr$1(n, t, e) {
  if (t > e) throw new M$1(2307, !1);
  let r = n.digits,
    i = r.length - n.integerLen,
    o = Math.min(Math.max(t, i), e),
    s = o + n.integerLen,
    a = r[s];
  if (s > 0) {
    r.splice(Math.max(n.integerLen, s));
    for (let l = s; l < r.length; l++) r[l] = 0;
  } else {
    ((i = Math.max(0, i)), (n.integerLen = 1), (r.length = Math.max(1, (s = o + 1))), (r[0] = 0));
    for (let l = 1; l < s; l++) r[l] = 0;
  }
  if (a >= 5)
    if (s - 1 < 0) {
      for (let l = 0; l > s; l--) (r.unshift(0), n.integerLen++);
      (r.unshift(1), n.integerLen++);
    } else r[s - 1]++;
  for (; i < Math.max(0, o); i++) r.push(0);
  let u = o !== 0,
    d = t + n.integerLen,
    c = r.reduceRight(function (l, g, h, w) {
      return (
        (g = g + l),
        (w[h] = g < 10 ? g : g - 10),
        u && (w[h] === 0 && h >= d ? w.pop() : (u = !1)),
        g >= 10 ? 1 : 0
      );
    }, 0);
  c && (r.unshift(c), n.integerLen++);
}
function nt$1(n) {
  let t = parseInt(n);
  if (isNaN(t)) throw new M$1(2305, !1);
  return t;
}
function it$1(n, t) {
  return new M$1(2100, !1);
}
var lr$1 = `mediumDate`;
var hn$1 = new A$1(``);
var pn$1 = new A$1(``);
var fr = (() => {
  class n {
    locale;
    defaultTimezone;
    defaultOptions;
    constructor(e, r, i) {
      ((this.locale = e), (this.defaultTimezone = r), (this.defaultOptions = i));
    }
    transform(e, r, i, o) {
      if (e == null || e === `` || e !== e) return null;
      try {
        let s = r ?? this.defaultOptions?.dateFormat ?? lr$1,
          a = i ?? this.defaultOptions?.timezone ?? this.defaultTimezone ?? void 0;
        return sn$1(e, s, o || this.locale, a);
      } catch (s) {
        throw it$1(n, s.message);
      }
    }
    static ɵfac = function (r) {
      return new (r || n)(ir$2(Ja, 16), ir$2(hn$1, 24), ir$2(pn$1, 24));
    };
    static ɵpipe = Uv({ name: `date`, type: n, pure: !0 });
  }
  return n;
})();
var hr = (() => {
  class n {
    _locale;
    constructor(e) {
      this._locale = e;
    }
    transform(e, r, i) {
      if (!gn$1(e)) return null;
      i ||= this._locale;
      try {
        return ln$1(mn$1(e), i, r);
      } catch (o) {
        throw it$1(n, o.message);
      }
    }
    static ɵfac = function (r) {
      return new (r || n)(ir$2(Ja, 16));
    };
    static ɵpipe = Uv({ name: `number`, type: n, pure: !0 });
  }
  return n;
})();
var pr = (() => {
  class n {
    _locale;
    constructor(e) {
      this._locale = e;
    }
    transform(e, r, i) {
      if (!gn$1(e)) return null;
      i ||= this._locale;
      try {
        return dn$1(mn$1(e), i, r);
      } catch (o) {
        throw it$1(n, o.message);
      }
    }
    static ɵfac = function (r) {
      return new (r || n)(ir$2(Ja, 16));
    };
    static ɵpipe = Uv({ name: `percent`, type: n, pure: !0 });
  }
  return n;
})();
function gn$1(n) {
  return !(n == null || n === `` || n !== n);
}
function mn$1(n) {
  if (typeof n == `string` && !isNaN(Number(n) - parseFloat(n))) return Number(n);
  if (typeof n != `number`) throw new M$1(2309, !1);
  return n;
}
var Dn$1 = (() => {
  class n {
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵmod = Vv({ type: n });
    static ɵinj = Qc({});
  }
  return n;
})();
function pe$1(n, t) {
  t = encodeURIComponent(t);
  for (let e of n.split(`;`)) {
    let r = e.indexOf(`=`),
      [i, o] = r == -1 ? [e, ``] : [e.slice(0, r), e.slice(r + 1)];
    if (i.trim() !== t) continue;
    let s = o;
    try {
      s = decodeURIComponent(o);
    } catch {}
    return (s.length > 1 && s[0] === `"` && s[s.length - 1] === `"` && (s = s.slice(1, -1)), s);
  }
  return null;
}
var ot$1 = `browser`;
function Go(n) {
  return n === ot$1;
}
var ge$1 = class {
  _doc;
  constructor(t) {
    this._doc = t;
  }
  manager;
};
var Ue$1 = (() => {
  class n extends ge$1 {
    constructor(e) {
      super(e);
    }
    supports(e) {
      return !0;
    }
    addEventListener(e, r, i, o) {
      return (e.addEventListener(r, i, o), () => this.removeEventListener(e, r, i, o));
    }
    removeEventListener(e, r, i, o) {
      return e.removeEventListener(r, i, o);
    }
    static ɵfac = function (r) {
      return new (r || n)(De$2(jn$2));
    };
    static ɵprov = se$1({ token: n, factory: n.ɵfac });
  }
  return n;
})();
var Ve = new A$1(``);
var ct$1 = (() => {
  class n {
    _zone;
    _plugins;
    _eventNameToPlugin = new Map();
    constructor(e, r) {
      ((this._zone = r),
        e.forEach((s) => {
          s.manager = this;
        }));
      let i = e.filter((s) => !(s instanceof Ue$1));
      this._plugins = i.slice().reverse();
      let o = e.find((s) => s instanceof Ue$1);
      o && this._plugins.push(o);
    }
    addEventListener(e, r, i, o) {
      return this._findPluginFor(r).addEventListener(e, r, i, o);
    }
    getZone() {
      return this._zone;
    }
    _findPluginFor(e) {
      let r = this._eventNameToPlugin.get(e);
      if (r) return r;
      if (((r = this._plugins.find((o) => o.supports(e))), !r)) throw new M$1(-5101, !1);
      return (this._eventNameToPlugin.set(e, r), r);
    }
    static ɵfac = function (r) {
      return new (r || n)(De$2(Ve), De$2(Ce$1));
    };
    static ɵprov = se$1({ token: n, factory: n.ɵfac });
  }
  return n;
})();
var st$1 = `ng-app-id`;
function yn$1(n) {
  for (let t of n) t.remove();
}
function En$1(n, t) {
  let e = t.createElement(`style`);
  return ((e.textContent = n), e);
}
function yr(n, t, e, r) {
  let i = n.head?.querySelectorAll(`style[${st$1}="${t}"],link[${st$1}="${t}"]`);
  if (!i || i.length === 0) return !1;
  for (let o of i)
    (o.removeAttribute(st$1),
      o instanceof HTMLLinkElement
        ? r.set(o.href.slice(o.href.lastIndexOf(`/`) + 1), { usage: 0, elements: [o] })
        : o.textContent && e.set(o.textContent, { usage: 0, elements: [o] }));
  return !0;
}
function ut$1(n, t) {
  let e = t.createElement(`link`);
  return (e.setAttribute(`rel`, `stylesheet`), e.setAttribute(`href`, n), e);
}
var dt$1 = (() => {
  class n {
    doc;
    appId;
    nonce;
    inline = new Map();
    external = new Map();
    hosts = new Set();
    constructor(e, r, i, o = {}) {
      ((this.doc = e),
        (this.appId = r),
        (this.nonce = i),
        yr(e, r, this.inline, this.external) && this.hosts.add(e.head));
    }
    addStyles(e, r) {
      for (let i of e) this.addUsage(i, this.inline, En$1);
      r?.forEach((i) => this.addUsage(i, this.external, ut$1));
    }
    removeStyles(e, r) {
      for (let i of e) this.removeUsage(i, this.inline);
      r?.forEach((i) => this.removeUsage(i, this.external));
    }
    addUsage(e, r, i) {
      let o = r.get(e);
      o ? o.usage++ : r.set(e, { usage: 1, elements: [...this.hosts].map((s) => this.addElement(s, i(e, this.doc))) });
    }
    removeUsage(e, r) {
      let i = r.get(e);
      i && (i.usage--, i.usage <= 0 && (yn$1(i.elements), r.delete(e)));
    }
    ngOnDestroy() {
      for (let [, { elements: e }] of [...this.inline, ...this.external]) yn$1(e);
      this.hosts.clear();
    }
    addHost(e) {
      if (!this.hosts.has(e)) {
        this.hosts.add(e);
        for (let [r, { elements: i }] of this.inline) i.push(this.addElement(e, En$1(r, this.doc)));
        for (let [r, { elements: i }] of this.external) i.push(this.addElement(e, ut$1(r, this.doc)));
      }
    }
    removeHost(e) {
      this.hosts.delete(e);
      for (let r of [...this.inline.values(), ...this.external.values()]) {
        let i = [];
        for (let o of r.elements) o.parentNode === e ? o.remove() : i.push(o);
        r.elements = i;
      }
    }
    addElement(e, r) {
      return (this.nonce && r.setAttribute(`nonce`, this.nonce), e.appendChild(r));
    }
    static ɵfac = function (r) {
      return new (r || n)(De$2(jn$2), De$2(Ul), De$2(Jh, 8), De$2(Yh));
    };
    static ɵprov = se$1({ token: n, factory: n.ɵfac });
  }
  return n;
})();
var at$1 = {
  svg: `http://www.w3.org/2000/svg`,
  xhtml: `http://www.w3.org/1999/xhtml`,
  xlink: `http://www.w3.org/1999/xlink`,
  xml: `http://www.w3.org/XML/1998/namespace`,
  xmlns: `http://www.w3.org/2000/xmlns/`,
  math: `http://www.w3.org/1998/Math/MathML`,
};
var lt$1 = /%COMP%/g;
var Cn$1 = `%COMP%`;
var Er = `_nghost-${Cn$1}`;
var wr = `_ngcontent-${Cn$1}`;
var vr = !0;
var Cr = new A$1(``, { factory: () => vr });
var Sr = new A$1(``);
function br(n) {
  return wr.replace(lt$1, n);
}
function Ar(n) {
  return Er.replace(lt$1, n);
}
function Sn$1(n, t) {
  return t.map((e) => e.replace(lt$1, n));
}
var ft$1 = (() => {
  class n {
    eventManager;
    sharedStylesHost;
    appId;
    removeStylesOnCompDestroy;
    doc;
    ngZone;
    nonce;
    tracingService;
    rendererByCompId = new Map();
    defaultRenderer;
    cssVarNamespace;
    constructor(e, r, i, o, s, a, u = null, d = null, c = null) {
      ((this.eventManager = e),
        (this.sharedStylesHost = r),
        (this.appId = i),
        (this.removeStylesOnCompDestroy = o),
        (this.doc = s),
        (this.ngZone = a),
        (this.nonce = u),
        (this.tracingService = d),
        (this.cssVarNamespace = c ?? ``),
        (this.defaultRenderer = new me(e, s, a, this.tracingService, this.cssVarNamespace)));
    }
    createRenderer(e, r) {
      if (!e || !r) return this.defaultRenderer;
      let i = this.getOrCreateRenderer(e, r);
      return (i instanceof $e ? i.applyToHost(e) : i instanceof De$1 && i.applyStyles(), i);
    }
    getOrCreateRenderer(e, r) {
      let i = this.rendererByCompId,
        o = i.get(r.id);
      if (!o) {
        let s = this.doc,
          a = this.ngZone,
          u = this.eventManager,
          d = this.sharedStylesHost,
          c = this.removeStylesOnCompDestroy,
          l = this.tracingService;
        switch (r.encapsulation) {
          case xt$1.Emulated:
            o = new $e(u, d, r, this.appId, c, s, a, l, this.cssVarNamespace);
            break;
          case xt$1.ShadowDom:
            return new je$1(u, e, r, s, a, this.nonce, l, this.cssVarNamespace, d);
          case xt$1.ExperimentalIsolatedShadowDom:
            return new je$1(u, e, r, s, a, this.nonce, l, this.cssVarNamespace);
          default:
            o = new De$1(u, d, r, c, s, a, l, this.cssVarNamespace);
            break;
        }
        i.set(r.id, o);
      }
      return o;
    }
    ngOnDestroy() {
      this.rendererByCompId.clear();
    }
    componentReplaced(e) {
      this.rendererByCompId.delete(e);
    }
    static ɵfac = function (r) {
      return new (r || n)(
        De$2(ct$1),
        De$2(rf),
        De$2(Ul),
        De$2(Cr),
        De$2(jn$2),
        De$2(Ce$1),
        De$2(Jh),
        De$2(Ot, 8),
        De$2(Sr, 8),
      );
    };
    static ɵprov = se$1({ token: n, factory: n.ɵfac });
  }
  return n;
})();
var me = class {
  eventManager;
  doc;
  ngZone;
  tracingService;
  cssVarNamespace;
  data = Object.create(null);
  throwOnSyntheticProps = !0;
  constructor(t, e, r, i, o = ``) {
    ((this.eventManager = t), (this.doc = e), (this.ngZone = r), (this.tracingService = i), (this.cssVarNamespace = o));
  }
  destroy() {}
  destroyNode = null;
  createElement(t, e) {
    return e ? this.doc.createElementNS(at$1[e] || e, t) : this.doc.createElement(t);
  }
  createComment(t) {
    return this.doc.createComment(t);
  }
  createText(t) {
    return this.doc.createTextNode(t);
  }
  appendChild(t, e) {
    (wn$1(t) ? t.content : t).appendChild(e);
  }
  insertBefore(t, e, r) {
    if (t) {
      let i = wn$1(t) ? t.content : t;
      if (r != null && r.parentNode !== i) throw new M$1(-5106, !1);
      i.insertBefore(e, r);
    }
  }
  removeChild(t, e) {
    e.remove();
  }
  selectRootElement(t, e) {
    let r = typeof t == `string` ? this.doc.querySelector(t) : t;
    if (!r) throw new M$1(-5104, !1);
    return (e || (r.textContent = ``), r);
  }
  parentNode(t) {
    return t.parentNode;
  }
  nextSibling(t) {
    return t.nextSibling;
  }
  setAttribute(t, e, r, i) {
    if (i) {
      e = i + `:` + e;
      let o = at$1[i];
      o ? t.setAttributeNS(o, e, r) : t.setAttribute(e, r);
    } else t.setAttribute(e, r);
  }
  removeAttribute(t, e, r) {
    if (r) {
      let i = at$1[r];
      i ? t.removeAttributeNS(i, e) : t.removeAttribute(`${r}:${e}`);
    } else t.removeAttribute(e);
  }
  addClass(t, e) {
    t.classList.add(e);
  }
  removeClass(t, e) {
    t.classList.remove(e);
  }
  setStyle(t, e, r, i) {
    let o = e.startsWith(`--`);
    (o && (e = e.replace(`%NS%`, this.cssVarNamespace)),
      o || i & (Po$1.DashCase | Po$1.Important)
        ? t.style.setProperty(e, r, i & Po$1.Important ? `important` : ``)
        : (t.style[e] = r));
  }
  removeStyle(t, e, r) {
    let i = e.startsWith(`--`);
    (i && (e = e.replace(`%NS%`, this.cssVarNamespace)),
      i || r & Po$1.DashCase ? t.style.removeProperty(e) : (t.style[e] = ``));
  }
  setProperty(t, e, r) {
    t != null && (t[e] = r);
  }
  setValue(t, e) {
    t.nodeValue = e;
  }
  listen(t, e, r, i) {
    if (typeof t == `string` && ((t = U().getGlobalEventTarget(this.doc, t)), !t)) throw new M$1(-5102, !1);
    let o = this.decoratePreventDefault(r);
    return (
      this.tracingService?.wrapEventListener && (o = this.tracingService.wrapEventListener(t, e, o)),
      this.eventManager.addEventListener(t, e, o, i)
    );
  }
  decoratePreventDefault(t) {
    return (e) => {
      if (e === `__ngUnwrap__`) return t;
      t(e) === !1 && e.preventDefault();
    };
  }
};
function wn$1(n) {
  return n.tagName === `TEMPLATE` && n.content !== void 0;
}
var je$1 = class extends me {
  hostEl;
  sharedStylesHost;
  shadowRoot;
  constructor(t, e, r, i, o, s, a, u, d) {
    (super(t, i, o, a, u),
      (this.hostEl = e),
      (this.sharedStylesHost = d),
      (this.shadowRoot = e.attachShadow({ mode: `open` })),
      this.sharedStylesHost && this.sharedStylesHost.addHost(this.shadowRoot));
    let c = r.styles;
    c = Sn$1(r.id, c).map((g) => g.replace(/%NS%/g, u));
    for (let g of c) {
      let h = document.createElement(`style`);
      (s && h.setAttribute(`nonce`, s), (h.textContent = g), this.shadowRoot.appendChild(h));
    }
    let l = r.getExternalStyles?.();
    if (l)
      for (let g of l) {
        let h = ut$1(g, i);
        (s && h.setAttribute(`nonce`, s), this.shadowRoot.appendChild(h));
      }
  }
  nodeOrShadowRoot(t) {
    return t === this.hostEl ? this.shadowRoot : t;
  }
  appendChild(t, e) {
    return super.appendChild(this.nodeOrShadowRoot(t), e);
  }
  insertBefore(t, e, r) {
    return super.insertBefore(this.nodeOrShadowRoot(t), e, r);
  }
  removeChild(t, e) {
    return super.removeChild(null, e);
  }
  parentNode(t) {
    return this.nodeOrShadowRoot(super.parentNode(this.nodeOrShadowRoot(t)));
  }
  destroy() {
    this.sharedStylesHost && this.sharedStylesHost.removeHost(this.shadowRoot);
  }
};
var De$1 = class extends me {
  sharedStylesHost;
  removeStylesOnCompDestroy;
  styles;
  styleUrls;
  constructor(t, e, r, i, o, s, a, u, d) {
    (super(t, o, s, a, u), (this.sharedStylesHost = e), (this.removeStylesOnCompDestroy = i));
    let c = r.styles,
      l = d ? Sn$1(d, c) : c;
    ((this.styles = l.map((g) => g.replace(/%NS%/g, u))), (this.styleUrls = r.getExternalStyles?.(d)));
  }
  applyStyles() {
    this.sharedStylesHost.addStyles(this.styles, this.styleUrls);
  }
  destroy() {
    this.removeStylesOnCompDestroy &&
      an$2.size === 0 &&
      this.sharedStylesHost.removeStyles(this.styles, this.styleUrls);
  }
};
var $e = class extends De$1 {
  contentAttr;
  hostAttr;
  constructor(t, e, r, i, o, s, a, u, d) {
    let c = i + `-` + r.id;
    (super(t, e, r, o, s, a, u, d, c), (this.contentAttr = br(c)), (this.hostAttr = Ar(c)));
  }
  applyToHost(t) {
    (this.applyStyles(), this.setAttribute(t, this.hostAttr, ``));
  }
  createElement(t, e) {
    let r = super.createElement(t, e);
    return (super.setAttribute(r, this.contentAttr, ``), r);
  }
};
var ze = class n extends ce$1 {
  supportsDOMEvents = !0;
  static makeCurrent() {
    Je$1(new n());
  }
  onAndCancel(t, e, r, i) {
    return (
      t.addEventListener(e, r, i),
      () => {
        t.removeEventListener(e, r, i);
      }
    );
  }
  dispatchEvent(t, e) {
    t.dispatchEvent(e);
  }
  remove(t) {
    t.remove();
  }
  createElement(t, e) {
    return ((e = e || this.getDefaultDocument()), e.createElement(t));
  }
  createHtmlDocument() {
    return document.implementation.createHTMLDocument(`fakeTitle`);
  }
  getDefaultDocument() {
    return document;
  }
  isElementNode(t) {
    return t.nodeType === Node.ELEMENT_NODE;
  }
  isShadowRoot(t) {
    return t instanceof DocumentFragment;
  }
  getGlobalEventTarget(t, e) {
    return e === `window` ? window : e === `document` ? t : e === `body` ? t.body : null;
  }
  getBaseHref(t) {
    let e = _r();
    return e == null ? null : Fr(e);
  }
  resetBaseElement() {
    ye = null;
  }
  getUserAgent() {
    return window.navigator.userAgent;
  }
  getCookie(t) {
    return pe$1(document.cookie, t);
  }
};
var ye = null;
function _r() {
  return ((ye = ye || document.head.querySelector(`base`)), ye ? ye.getAttribute(`href`) : null);
}
function Fr(n) {
  return new URL(n, document.baseURI).pathname;
}
var bn$1 = [`alt`, `control`, `meta`, `shift`];
var Rr = {
  '\b': `Backspace`,
  '	': `Tab`,
  '': `Delete`,
  '\x1B': `Escape`,
  Del: `Delete`,
  Esc: `Escape`,
  Left: `ArrowLeft`,
  Right: `ArrowRight`,
  Up: `ArrowUp`,
  Down: `ArrowDown`,
  Menu: `ContextMenu`,
  Scroll: `ScrollLock`,
  Win: `OS`,
};
var Mr = { alt: (n) => n.altKey, control: (n) => n.ctrlKey, meta: (n) => n.metaKey, shift: (n) => n.shiftKey };
var An$1 = (() => {
  class n extends ge$1 {
    constructor(e) {
      super(e);
    }
    supports(e) {
      return n.parseEventName(e) != null;
    }
    addEventListener(e, r, i, o) {
      let s = n.parseEventName(r),
        a = n.eventCallback(s.fullKey, i, this.manager.getZone());
      return this.manager.getZone().runOutsideAngular(() => U().onAndCancel(e, s.domEventName, a, o));
    }
    static parseEventName(e) {
      let r = e.toLowerCase().split(`.`),
        i = r.shift();
      if (r.length === 0 || !(i === `keydown` || i === `keyup`)) return null;
      let o = n._normalizeKey(r.pop()),
        s = ``,
        a = r.indexOf(`code`);
      if (
        (a > -1 && (r.splice(a, 1), (s = `code.`)),
        bn$1.forEach((d) => {
          let c = r.indexOf(d);
          c > -1 && (r.splice(c, 1), (s += d + `.`));
        }),
        (s += o),
        r.length != 0 || o.length === 0)
      )
        return null;
      let u = {};
      return ((u.domEventName = i), (u.fullKey = s), u);
    }
    static matchEventFullKeyCode(e, r) {
      let i = Rr[e.key] || e.key,
        o = ``;
      return (
        r.indexOf(`code.`) > -1 && ((i = e.code), (o = `code.`)),
        i == null || !i
          ? !1
          : ((i = i.toLowerCase()),
            i === ` ` ? (i = `space`) : i === `.` && (i = `dot`),
            bn$1.forEach((s) => {
              if (s !== i) {
                let a = Mr[s];
                a(e) && (o += s + `.`);
              }
            }),
            (o += i),
            o === r)
      );
    }
    static eventCallback(e, r, i) {
      return (o) => {
        n.matchEventFullKeyCode(o, e) && i.runGuarded(() => r(o));
      };
    }
    static _normalizeKey(e) {
      return e === `esc` ? `escape` : e;
    }
    static ɵfac = function (r) {
      return new (r || n)(De$2(jn$2));
    };
    static ɵprov = se$1({ token: n, factory: n.ɵfac });
  }
  return n;
})();
async function Ir(n, t, e) {
  return zL(l({ rootComponent: n }, Pr(t, e)));
}
function Pr(n, t) {
  return { platformRef: t?.platformRef, appProviders: [...kr, ...(n?.providers ?? [])], platformProviders: xr };
}
function Or() {
  ze.makeCurrent();
}
function Nr() {
  return new yt$2();
}
function Lr() {
  return (Wg(document), document);
}
var xr = [
  { provide: Yh, useValue: ot$1 },
  { provide: Wl, useValue: Or, multi: !0 },
  { provide: jn$2, useFactory: Lr },
];
var kr = [
  { provide: Ji$1, useValue: `root` },
  { provide: yt$2, useFactory: Nr },
  { provide: Ve, useClass: Ue$1, multi: !0 },
  { provide: Ve, useClass: An$1, multi: !0 },
  ft$1,
  { provide: rf, useClass: dt$1 },
  { provide: dt$1, useExisting: rf },
  ct$1,
  { provide: Yn$2, useExisting: ft$1 },
  [],
];
var V$1 = class n {
  headers;
  normalizedNames = new Map();
  lazyInit;
  lazyUpdate = null;
  constructor(t) {
    t
      ? typeof t == `string`
        ? (this.lazyInit = () => {
            ((this.headers = new Map()),
              t
                .split(
                  `
`,
                )
                .forEach((e) => {
                  let r = e.indexOf(`:`);
                  if (r > 0) {
                    let i = e.slice(0, r),
                      o = e.slice(r + 1).trim();
                    this.addHeaderEntry(i, o);
                  }
                }));
          })
        : typeof Headers < `u` && t instanceof Headers
          ? ((this.headers = new Map()),
            t.forEach((e, r) => {
              this.addHeaderEntry(r, e);
            }))
          : (this.lazyInit = () => {
              ((this.headers = new Map()),
                Object.entries(t).forEach(([e, r]) => {
                  this.setHeaderEntries(e, r);
                }));
            })
      : (this.headers = new Map());
  }
  has(t) {
    return (this.init(), this.headers.has(t.toLowerCase()));
  }
  get(t) {
    this.init();
    let e = this.headers.get(t.toLowerCase());
    return e && e.length > 0 ? e[0] : null;
  }
  keys() {
    return (this.init(), Array.from(this.normalizedNames.values()));
  }
  getAll(t) {
    return (this.init(), this.headers.get(t.toLowerCase()) || null);
  }
  append(t, e) {
    return this.clone({ name: t, value: e, op: `a` });
  }
  set(t, e) {
    return this.clone({ name: t, value: e, op: `s` });
  }
  delete(t, e) {
    return this.clone({ name: t, value: e, op: `d` });
  }
  maybeSetNormalizedName(t, e) {
    this.normalizedNames.has(e) || this.normalizedNames.set(e, t);
  }
  init() {
    this.lazyInit &&
      (this.lazyInit instanceof n ? this.copyFrom(this.lazyInit) : this.lazyInit(),
      (this.lazyInit = null),
      this.lazyUpdate && (this.lazyUpdate.forEach((t) => this.applyUpdate(t)), (this.lazyUpdate = null)));
  }
  copyFrom(t) {
    t.init();
    for (let [e, r] of t.headers.entries())
      (this.headers.set(e, r), this.normalizedNames.set(e, t.normalizedNames.get(e)));
  }
  clone(t) {
    let e = new n();
    return (
      (e.lazyInit = this.lazyInit && this.lazyInit instanceof n ? this.lazyInit : this),
      (e.lazyUpdate = (this.lazyUpdate || []).concat([t])),
      e
    );
  }
  applyUpdate(t) {
    let e = t.name.toLowerCase();
    switch (t.op) {
      case `a`:
      case `s`:
        let r = t.value;
        if ((typeof r == `string` && (r = [r]), r.length === 0)) return;
        this.maybeSetNormalizedName(t.name, e);
        let i = t.op === `a` ? (this.headers.get(e) || []).slice() : [];
        (i.push(...r), this.headers.set(e, i));
        break;
      case `d`:
        let o = t.value;
        if (o === void 0) (this.headers.delete(e), this.normalizedNames.delete(e));
        else {
          let s = Array.isArray(o) ? o : [o],
            a = this.headers.get(e);
          if (!a) return;
          ((a = a.filter((u) => s.indexOf(u) === -1)),
            a.length === 0 ? (this.headers.delete(e), this.normalizedNames.delete(e)) : this.headers.set(e, a));
        }
        break;
    }
  }
  addHeaderEntry(t, e) {
    let r = t.toLowerCase();
    (this.maybeSetNormalizedName(t, r), this.headers.has(r) ? this.headers.get(r).push(e) : this.headers.set(r, [e]));
  }
  setHeaderEntries(t, e) {
    let r = (Array.isArray(e) ? e : [e]).map((o) => o.toString()),
      i = t.toLowerCase();
    (this.headers.set(i, r), this.maybeSetNormalizedName(t, i));
  }
  forEach(t) {
    (this.init(),
      Array.from(this.normalizedNames.keys()).forEach((e) => t(this.normalizedNames.get(e), this.headers.get(e))));
  }
};
var gt$1 = class {
  map = new Map();
  set(t, e) {
    return (this.map.set(t, e), this);
  }
  get(t) {
    return (this.map.has(t) || this.map.set(t, t.defaultValue()), this.map.get(t));
  }
  delete(t) {
    return (this.map.delete(t), this);
  }
  has(t) {
    return this.map.has(t);
  }
  keys() {
    return this.map.keys();
  }
};
var mt$1 = class {
  encodeKey(t) {
    return Tn$1(t);
  }
  encodeValue(t) {
    return Tn$1(t);
  }
  decodeKey(t) {
    return decodeURIComponent(t);
  }
  decodeValue(t) {
    return decodeURIComponent(t);
  }
};
function Br(n, t) {
  let e = new Map();
  return (
    n.length > 0 &&
      n
        .replace(/^\?/, ``)
        .split(`&`)
        .forEach((i) => {
          let o = i.indexOf(`=`),
            [s, a] = o == -1 ? [t.decodeKey(i), ``] : [t.decodeKey(i.slice(0, o)), t.decodeValue(i.slice(o + 1))],
            u = e.get(s) || [];
          (u.push(a), e.set(s, u));
        }),
    e
  );
}
var Ur = /%(\d[a-f0-9])/gi;
var jr = { 40: `@`, '3A': `:`, 24: `$`, '2C': `,`, '3B': `;`, '3D': `=`, '3F': `?`, '2F': `/` };
function Tn$1(n) {
  return encodeURIComponent(n).replace(Ur, (t, e) => jr[e] ?? t);
}
function He(n) {
  return `${n}`;
}
var $$1 = class n {
  map;
  encoder;
  updates = null;
  cloneFrom = null;
  constructor(t = {}) {
    if (((this.encoder = t.encoder || new mt$1()), t.fromString)) {
      if (t.fromObject) throw new M$1(2805, !1);
      this.map = Br(t.fromString, this.encoder);
    } else
      t.fromObject
        ? ((this.map = new Map()),
          Object.keys(t.fromObject).forEach((e) => {
            let r = t.fromObject[e],
              i = Array.isArray(r) ? r.map(He) : [He(r)];
            this.map.set(e, i);
          }))
        : (this.map = null);
  }
  has(t) {
    return (this.init(), this.map.has(t));
  }
  get(t) {
    this.init();
    let e = this.map.get(t);
    return e ? e[0] : null;
  }
  getAll(t) {
    return (this.init(), this.map.get(t) || null);
  }
  keys() {
    return (this.init(), Array.from(this.map.keys()));
  }
  append(t, e) {
    return this.clone({ param: t, value: e, op: `a` });
  }
  appendAll(t) {
    let e = [];
    return (
      Object.keys(t).forEach((r) => {
        let i = t[r];
        Array.isArray(i)
          ? i.forEach((o) => {
              e.push({ param: r, value: o, op: `a` });
            })
          : e.push({ param: r, value: i, op: `a` });
      }),
      this.clone(e)
    );
  }
  set(t, e) {
    return this.clone({ param: t, value: e, op: `s` });
  }
  delete(t, e) {
    return this.clone({ param: t, value: e, op: `d` });
  }
  toString() {
    return (
      this.init(),
      this.keys()
        .map((t) => {
          let e = this.encoder.encodeKey(t);
          return this.map
            .get(t)
            .map((r) => e + `=` + this.encoder.encodeValue(r))
            .join(`&`);
        })
        .filter((t) => t !== ``)
        .join(`&`)
    );
  }
  clone(t) {
    let e = new n({ encoder: this.encoder });
    return ((e.cloneFrom = this.cloneFrom || this), (e.updates = (this.updates || []).concat(t)), e);
  }
  init() {
    if ((this.map === null && (this.map = new Map()), this.cloneFrom !== null)) {
      this.cloneFrom.init();
      for (let [t, e] of this.cloneFrom.map.entries()) this.map.set(t, e);
      (this.updates.forEach((t) => {
        switch (t.op) {
          case `a`:
          case `s`:
            let e = t.op === `a` ? (this.map.get(t.param) || []).slice() : [];
            (e.push(He(t.value)), this.map.set(t.param, e));
            break;
          case `d`:
            if (t.value !== void 0) {
              let r = (this.map.get(t.param) || []).slice(),
                i = r.indexOf(He(t.value));
              (i !== -1 && r.splice(i, 1), r.length > 0 ? this.map.set(t.param, r) : this.map.delete(t.param));
            } else {
              this.map.delete(t.param);
              break;
            }
        }
      }),
        (this.cloneFrom = this.updates = null));
    }
  }
};
function $r(n) {
  switch (n) {
    case `DELETE`:
    case `GET`:
    case `HEAD`:
    case `OPTIONS`:
    case `JSONP`:
      return !1;
    default:
      return !0;
  }
}
function _n$1(n) {
  return typeof ArrayBuffer < `u` && n instanceof ArrayBuffer;
}
function Fn$1(n) {
  return typeof Blob < `u` && n instanceof Blob;
}
function Rn$1(n) {
  return typeof FormData < `u` && n instanceof FormData;
}
function Vr$1(n) {
  return typeof URLSearchParams < `u` && n instanceof URLSearchParams;
}
var ht$1 = `Content-Type`;
var Mn$1 = `Accept`;
var On$1 = `text/plain`;
var Nn$1 = `application/json`;
var zr = `${Nn$1}, ${On$1}, */*`;
var oe = class n {
  url;
  body = null;
  headers;
  context;
  reportProgress = !1;
  reportUploadProgress = !1;
  reportDownloadProgress = !1;
  withCredentials = !1;
  credentials;
  keepalive = !1;
  cache;
  priority;
  mode;
  redirect;
  referrer;
  integrity;
  referrerPolicy;
  responseType = `json`;
  method;
  params;
  urlWithParams;
  transferCache;
  timeout;
  constructor(t, e, r, i) {
    ((this.url = e), (this.method = t.toUpperCase()));
    let o;
    if (($r(this.method) || i ? ((this.body = r !== void 0 ? r : null), (o = i)) : (o = r), o)) {
      if (
        ((this.reportProgress = !!o.reportProgress),
        (this.reportUploadProgress = !!o.reportUploadProgress),
        (this.reportDownloadProgress = !!o.reportDownloadProgress),
        (this.withCredentials = !!o.withCredentials),
        (this.keepalive = !!o.keepalive),
        o.responseType && (this.responseType = o.responseType),
        o.headers && (this.headers = o.headers),
        o.context && (this.context = o.context),
        o.params && (this.params = o.params),
        o.priority && (this.priority = o.priority),
        o.cache && (this.cache = o.cache),
        o.credentials && (this.credentials = o.credentials),
        typeof o.timeout == `number`)
      ) {
        if (o.timeout < 1 || !Number.isInteger(o.timeout)) throw new M$1(2822, ``);
        this.timeout = o.timeout;
      }
      (o.mode && (this.mode = o.mode),
        o.redirect && (this.redirect = o.redirect),
        o.integrity && (this.integrity = o.integrity),
        o.referrer !== void 0 && (this.referrer = o.referrer),
        o.referrerPolicy && (this.referrerPolicy = o.referrerPolicy),
        (this.transferCache = o.transferCache));
    }
    if (((this.headers ??= new V$1()), (this.context ??= new gt$1()), !this.params))
      ((this.params = new $$1()), (this.urlWithParams = e));
    else {
      let s = this.params.toString();
      if (s.length === 0) this.urlWithParams = e;
      else {
        let a = e,
          u = ``,
          d = e.indexOf(`#`);
        d !== -1 && ((u = e.substring(d)), (a = e.substring(0, d)));
        let c = a.indexOf(`?`),
          l = c === -1 ? `?` : c < a.length - 1 ? `&` : ``;
        this.urlWithParams = a + l + s + u;
      }
    }
  }
  serializeBody() {
    return this.body === null
      ? null
      : typeof this.body == `string` || _n$1(this.body) || Fn$1(this.body) || Rn$1(this.body) || Vr$1(this.body)
        ? this.body
        : this.body instanceof $$1
          ? this.body.toString()
          : typeof this.body == `object` || typeof this.body == `boolean` || Array.isArray(this.body)
            ? JSON.stringify(this.body)
            : this.body.toString();
  }
  detectContentTypeHeader() {
    return this.body === null || Rn$1(this.body)
      ? null
      : Fn$1(this.body)
        ? this.body.type || null
        : _n$1(this.body)
          ? null
          : typeof this.body == `string`
            ? On$1
            : this.body instanceof $$1
              ? `application/x-www-form-urlencoded;charset=UTF-8`
              : typeof this.body == `object` || typeof this.body == `number` || typeof this.body == `boolean`
                ? Nn$1
                : null;
  }
  clone(t = {}) {
    let e = t.method || this.method,
      r = t.url || this.url,
      i = t.responseType || this.responseType,
      o = t.keepalive ?? this.keepalive,
      s = t.priority || this.priority,
      a = t.cache || this.cache,
      u = t.mode || this.mode,
      d = t.redirect || this.redirect,
      c = t.credentials || this.credentials,
      l = t.referrer ?? this.referrer,
      g = t.integrity || this.integrity,
      h = t.referrerPolicy || this.referrerPolicy,
      w = t.transferCache ?? this.transferCache,
      L = t.timeout ?? this.timeout,
      v = t.body !== void 0 ? t.body : this.body,
      x = t.withCredentials ?? this.withCredentials,
      R = t.reportProgress ?? this.reportProgress,
      W = t.reportUploadProgress ?? this.reportUploadProgress,
      k = t.reportDownloadProgress ?? this.reportDownloadProgress,
      O = t.headers || this.headers,
      B = t.params || this.params,
      se = t.context ?? this.context;
    return (
      t.setHeaders !== void 0 && (O = Object.keys(t.setHeaders).reduce((J, z) => J.set(z, t.setHeaders[z]), O)),
      t.setParams && (B = Object.keys(t.setParams).reduce((J, z) => J.set(z, t.setParams[z]), B)),
      new n(e, r, v, {
        params: B,
        headers: O,
        context: se,
        reportProgress: R,
        reportUploadProgress: W,
        reportDownloadProgress: k,
        responseType: i,
        withCredentials: x,
        transferCache: w,
        keepalive: o,
        cache: a,
        priority: s,
        timeout: L,
        mode: u,
        redirect: d,
        credentials: c,
        referrer: l,
        integrity: g,
        referrerPolicy: h,
      })
    );
  }
};
var K = (function (n) {
  return (
    (n[(n.Sent = 0)] = `Sent`),
    (n[(n.UploadProgress = 1)] = `UploadProgress`),
    (n[(n.ResponseHeader = 2)] = `ResponseHeader`),
    (n[(n.DownloadProgress = 3)] = `DownloadProgress`),
    (n[(n.Response = 4)] = `Response`),
    (n[(n.User = 5)] = `User`),
    n
  );
})(K || {});
var Ee$1 = class {
  headers;
  status;
  statusText;
  url;
  ok;
  type;
  redirected;
  responseType;
  constructor(t, e = 200, r = `OK`) {
    ((this.headers = t.headers || new V$1()),
      (this.status = t.status !== void 0 ? t.status : e),
      (this.statusText = t.statusText || r),
      (this.url = t.url || null),
      (this.redirected = t.redirected),
      (this.responseType = t.responseType),
      (this.ok = this.status >= 200 && this.status < 300));
  }
};
var Dt = class n extends Ee$1 {
  constructor(t = {}) {
    super(t);
  }
  type = K.ResponseHeader;
  clone(t = {}) {
    return new n({
      headers: t.headers || this.headers,
      status: t.status !== void 0 ? t.status : this.status,
      statusText: t.statusText || this.statusText,
      url: t.url || this.url || void 0,
    });
  }
};
var we$1 = class n extends Ee$1 {
  body;
  constructor(t = {}) {
    (super(t), (this.body = t.body !== void 0 ? t.body : null));
  }
  type = K.Response;
  clone(t = {}) {
    return new n({
      body: t.body !== void 0 ? t.body : this.body,
      headers: t.headers || this.headers,
      status: t.status !== void 0 ? t.status : this.status,
      statusText: t.statusText || this.statusText,
      url: t.url || this.url || void 0,
      redirected: t.redirected ?? this.redirected,
      responseType: t.responseType ?? this.responseType,
    });
  }
};
var Z$1 = class extends Ee$1 {
  name = `HttpErrorResponse`;
  message;
  error;
  ok = !1;
  constructor(t) {
    (super(t, 0, `Unknown Error`),
      this.status >= 200 && this.status < 300
        ? (this.message = `Http failure during parsing for ${t.url || `(unknown url)`}`)
        : (this.message = `Http failure response for ${t.url || `(unknown url)`}: ${t.status} ${t.statusText}`),
      (this.error = t.error || null));
  }
};
var Hr = 200;
var Gr$1 = /^\)\]\}',?\n/;
var Wr$1 = new A$1(``, { factory: () => null });
var Xr$1 = (() => {
  class n {
    fetchImpl = w(yt$1, { optional: !0 })?.fetch ?? ((...e) => globalThis.fetch(...e));
    ngZone = w(Ce$1);
    destroyRef = w(we$2);
    maxResponseSize = w(Wr$1);
    handle(e) {
      return new b((r) => {
        let i = new AbortController(),
          o = !1,
          s = {
            next: (u) => {
              (u.type === K.Response && (o = !0), r.next(u));
            },
            error: (u) => {
              ((o = !0), r.error(u));
            },
            complete: () => {
              ((o = !0), r.complete());
            },
          };
        this.doRequest(e, i.signal, s).then(Et, (u) => s.error(new Z$1({ error: u })));
        let a;
        return (
          e.timeout &&
            (a = this.ngZone.runOutsideAngular(() =>
              setTimeout(() => {
                i.signal.aborted || i.abort(new DOMException(`signal timed out`, `TimeoutError`));
              }, e.timeout),
            )),
          () => {
            (a !== void 0 && clearTimeout(a), !o && !i.signal.aborted && i.abort());
          }
        );
      });
    }
    async doRequest(e, r, i) {
      let o = this.createRequestInit(e),
        s;
      try {
        let v = this.ngZone.runOutsideAngular(() => this.fetchImpl(e.urlWithParams, l({ signal: r }, o)));
        (Yr$1(v), i.next({ type: K.Sent }), (s = await v));
      } catch (v) {
        i.error(
          new Z$1({
            error: v,
            status: v.status ?? 0,
            statusText: v.statusText,
            url: e.urlWithParams,
            headers: v.headers,
          }),
        );
        return;
      }
      let a = new V$1(s.headers),
        u = s.statusText,
        d = s.url || e.urlWithParams,
        c = s.status,
        l$4 = null,
        g = e.reportProgress || e.reportDownloadProgress;
      if ((g && i.next(new Dt({ headers: a, status: c, statusText: u, url: d })), s.body)) {
        let v = s.headers.get(ht$1) ?? ``,
          x = s.headers.get(`content-length`),
          R = x !== null ? Number(x) : NaN;
        this.maxResponseSize !== null &&
          Number.isFinite(R) &&
          R > this.maxResponseSize &&
          (await s.body.cancel(), In$1(this.maxResponseSize));
        let W = [],
          k = s.body.getReader(),
          O = 0,
          B,
          se,
          J = typeof Zone < `u` && Zone.current,
          z = !1;
        if (
          (await this.ngZone.runOutsideAngular(async () => {
            for (;;) {
              if (this.destroyRef.destroyed) {
                (await k.cancel(), (z = !0));
                break;
              }
              let { done: Ge, value: We } = await k.read();
              if (Ge) break;
              if (
                (W.push(We),
                (O += We.length),
                this.maxResponseSize !== null &&
                  O > this.maxResponseSize &&
                  (await k.cancel(), In$1(this.maxResponseSize)),
                g)
              ) {
                se = e.responseType === `text` ? (se ?? ``) + (B ??= Pn$1(v)).decode(We, { stream: !0 }) : void 0;
                let wt = () =>
                  i.next({
                    type: K.DownloadProgress,
                    total: Number.isFinite(R) ? R : void 0,
                    loaded: O,
                    partialText: se,
                  });
                J ? J.run(wt) : wt();
              }
            }
          }),
          z)
        ) {
          i.complete();
          return;
        }
        let Bn = this.concatChunks(W, O);
        try {
          l$4 = this.parseBody(e, Bn, v, c);
        } catch (Ge) {
          i.error(
            new Z$1({
              error: Ge,
              headers: new V$1(s.headers),
              status: s.status,
              statusText: s.statusText,
              url: s.url || e.urlWithParams,
            }),
          );
          return;
        }
      }
      c === 0 && (c = l$4 ? Hr : 0);
      let h = c >= 200 && c < 300,
        w = s.redirected,
        L = s.type;
      h
        ? (i.next(
            new we$1({ body: l$4, headers: a, status: c, statusText: u, url: d, redirected: w, responseType: L }),
          ),
          i.complete())
        : i.error(
            new Z$1({ error: l$4, headers: a, status: c, statusText: u, url: d, redirected: w, responseType: L }),
          );
    }
    parseBody(e, r, i, o) {
      switch (e.responseType) {
        case `json`:
          let s = new TextDecoder().decode(r).replace(Gr$1, ``);
          if (s === ``) return null;
          try {
            return JSON.parse(s);
          } catch (a) {
            if (o < 200 || o >= 300) return s;
            throw a;
          }
        case `text`:
          return Pn$1(i).decode(r);
        case `blob`:
          return new Blob([r], { type: i });
        case `arraybuffer`:
          return r.buffer;
      }
    }
    createRequestInit(e) {
      if (e.reportUploadProgress) throw new M$1(2824, !1);
      let r = {},
        i;
      if (
        ((i = e.credentials),
        e.withCredentials && (i = `include`),
        e.headers.forEach((o, s) => (r[o] = s.join(`,`))),
        e.headers.has(Mn$1) || (r[Mn$1] = zr),
        !e.headers.has(ht$1))
      ) {
        let o = e.detectContentTypeHeader();
        o !== null && (r[ht$1] = o);
      }
      return {
        body: e.serializeBody(),
        method: e.method,
        headers: r,
        credentials: i,
        keepalive: e.keepalive,
        cache: e.cache,
        priority: e.priority,
        mode: e.mode,
        redirect: e.redirect,
        referrer: e.referrer,
        integrity: e.integrity,
        referrerPolicy: e.referrerPolicy,
      };
    }
    concatChunks(e, r) {
      let i = new Uint8Array(r),
        o = 0;
      for (let s of e) (i.set(s, o), (o += s.length));
      return i;
    }
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵprov = er$2({ token: n, factory: n.ɵfac });
  }
  return n;
})();
var yt$1 = class {};
function Et() {}
function Yr$1(n) {
  n.then(Et, Et);
}
function In$1(n) {
  throw new M$1(-2825, !1);
}
var Zr$1 = /charset=\s*["']?([^;"'\s]+)["']?/i;
function Pn$1(n) {
  let t = n.match(Zr$1);
  if (t !== null)
    try {
      return new TextDecoder(t[1]);
    } catch {}
  return new TextDecoder();
}
var Kr$1 = new A$1(``, { factory: () => !0 });
var Jr = `XSRF-TOKEN`;
var qr = new A$1(``, { factory: () => Jr });
var Qr$1 = `X-XSRF-TOKEN`;
var ei$1 = new A$1(``, { factory: () => Qr$1 });
var ti$1 = (() => {
  class n {
    cookieName = w(qr);
    doc = w(jn$2);
    lastCookieString = ``;
    lastToken = null;
    parseCount = 0;
    getToken() {
      let e = this.doc.cookie || ``;
      return (
        e !== this.lastCookieString &&
          (this.parseCount++, (this.lastToken = pe$1(e, this.cookieName)), (this.lastCookieString = e)),
        this.lastToken
      );
    }
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵprov = er$2({ token: n, factory: n.ɵfac });
  }
  return n;
})();
var ni$1 = (() => {
  class n {
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵprov = se$1({
      token: n,
      factory: function (r) {
        let i = null;
        return (r ? (i = new (r || n)()) : (i = De$2(ti$1)), i);
      },
      providedIn: `root`,
    });
  }
  return n;
})();
function ri$1(n, t) {
  if (!w(Kr$1) || n.method === `GET` || n.method === `HEAD`) return t(n);
  try {
    let i = w(ie).href,
      { origin: o } = new URL(i),
      { origin: s } = new URL(n.url, o);
    if (o !== s) return t(n);
  } catch {
    return t(n);
  }
  let e = w(ni$1).getToken(),
    r = w(ei$1);
  return (e != null && !n.headers.has(r) && (n = n.clone({ headers: n.headers.set(r, e) })), t(n));
}
function ii$1(n, t) {
  return t(n);
}
function oi$1(n, t, e) {
  return (r, i) => io$1(e, () => t(r, (o) => n(o, i)));
}
var si$1 = new A$1(``, { factory: () => [ri$1] });
var Ln$1 = new A$1(``);
var ai$1 = new A$1(``, { factory: () => !0 });
var ui$1 = (() => {
  class n {
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵprov = se$1({
      token: n,
      factory: function (r) {
        let i = null;
        return (r ? (i = new (r || n)()) : (i = De$2(Xr$1)), i);
      },
      providedIn: `root`,
    });
  }
  return n;
})();
var ci$1 = (() => {
  class n {
    backend;
    injector;
    chain = null;
    pendingTasks = w(Ql);
    contributeToStability = w(ai$1);
    constructor(e, r) {
      ((this.backend = e), (this.injector = r));
    }
    handle(e) {
      if (this.chain === null) {
        let i = this.injector.get(xn$1, null, { skipSelf: !0 }),
          o = i !== null && this.backend === i,
          s = this.injector.get(Ln$1, [], o ? { self: !0 } : void 0),
          a = Array.from(new Set([...this.injector.get(si$1), ...s]));
        this.chain = a.reduceRight((u, d) => oi$1(u, d, this.injector), ii$1);
      }
      let r = this.chain;
      if (this.contributeToStability) {
        let i = this.pendingTasks.add();
        return EE(() => r(e, (o) => this.backend.handle(o))).pipe(ah(i));
      } else return EE(() => r(e, (i) => this.backend.handle(i)));
    }
    static ɵfac = function (r) {
      return new (r || n)(De$2(ui$1), De$2(ie$1));
    };
    static ɵprov = se$1({ token: n, factory: n.ɵfac, providedIn: `root` });
  }
  return n;
})();
var xn$1 = (() => {
  class n {
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵprov = se$1({
      token: n,
      factory: function (r) {
        let i = null;
        return (r ? (i = new (r || n)()) : (i = De$2(ci$1)), i);
      },
      providedIn: `root`,
    });
  }
  return n;
})();
function pt$1(n, t) {
  return l({ body: t }, n);
}
var di$1 = (() => {
  class n {
    handler;
    constructor(e) {
      this.handler = e;
    }
    request(e, r, i = {}) {
      let o;
      if (e instanceof oe) o = e;
      else {
        let u;
        i.headers instanceof V$1 ? (u = i.headers) : (u = new V$1(i.headers));
        let d;
        (i.params && (i.params instanceof $$1 ? (d = i.params) : (d = new $$1({ fromObject: i.params }))),
          (o = new oe(e, r, i.body !== void 0 ? i.body : null, {
            headers: u,
            context: i.context,
            params: d,
            reportProgress: i.reportProgress,
            reportUploadProgress: i.reportUploadProgress,
            reportDownloadProgress: i.reportDownloadProgress,
            responseType: i.responseType || `json`,
            withCredentials: i.withCredentials,
            transferCache: i.transferCache,
            keepalive: i.keepalive,
            priority: i.priority,
            cache: i.cache,
            mode: i.mode,
            redirect: i.redirect,
            credentials: i.credentials,
            referrer: i.referrer,
            referrerPolicy: i.referrerPolicy,
            integrity: i.integrity,
            timeout: i.timeout,
          })));
      }
      let s = kp(o).pipe(nh((u) => this.handler.handle(u)));
      if (e instanceof oe || i.observe === `events`) return s;
      let a = s.pipe(qt$2((u) => u instanceof we$1));
      switch (i.observe || `body`) {
        case `body`:
          switch (o.responseType) {
            case `arraybuffer`:
              return a.pipe(
                ke$2((u) => {
                  if (u.body !== null && !(u.body instanceof ArrayBuffer)) throw new M$1(2806, !1);
                  return u.body;
                }),
              );
            case `blob`:
              return a.pipe(
                ke$2((u) => {
                  if (u.body !== null && !(u.body instanceof Blob)) throw new M$1(2807, !1);
                  return u.body;
                }),
              );
            case `text`:
              return a.pipe(
                ke$2((u) => {
                  if (u.body !== null && typeof u.body != `string`) throw new M$1(2808, !1);
                  return u.body;
                }),
              );
            default:
              return a.pipe(ke$2((u) => u.body));
          }
        case `response`:
          return a;
        default:
          throw new M$1(2809, !1);
      }
    }
    delete(e, r = {}) {
      return this.request(`DELETE`, e, r);
    }
    get(e, r = {}) {
      return this.request(`GET`, e, r);
    }
    head(e, r = {}) {
      return this.request(`HEAD`, e, r);
    }
    jsonp(e, r) {
      return this.request(`JSONP`, e, {
        params: new $$1().append(r, `JSONP_CALLBACK`),
        observe: `body`,
        responseType: `json`,
      });
    }
    options(e, r = {}) {
      return this.request(`OPTIONS`, e, r);
    }
    patch(e, r, i = {}) {
      return this.request(`PATCH`, e, pt$1(i, r));
    }
    post(e, r, i = {}) {
      return this.request(`POST`, e, pt$1(i, r));
    }
    put(e, r, i = {}) {
      return this.request(`PUT`, e, pt$1(i, r));
    }
    static ɵfac = function (r) {
      return new (r || n)(De$2(xn$1));
    };
    static ɵprov = se$1({ token: n, factory: n.ɵfac, providedIn: `root` });
  }
  return n;
})();
var fa = (() => {
  class n {
    _doc;
    constructor(e) {
      this._doc = e;
    }
    getTitle() {
      return this._doc.title;
    }
    setTitle(e) {
      this._doc.title = e || ``;
    }
    static ɵfac = function (r) {
      return new (r || n)(De$2(jn$2));
    };
    static ɵprov = se$1({ token: n, factory: n.ɵfac, providedIn: `root` });
  }
  return n;
})();
var li$1 = (() => {
  class n {
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵprov = se$1({
      token: n,
      factory: function (r) {
        let i = null;
        return (r ? (i = new (r || n)()) : (i = De$2(fi$1)), i);
      },
      providedIn: `root`,
    });
  }
  return n;
})();
var fi$1 = (() => {
  class n extends li$1 {
    _doc = w(jn$2);
    sanitize(e, r) {
      if (r == null) return null;
      switch (e) {
        case os.NONE:
          return r;
        case os.HTML:
          return Yg(r, `HTML`) ? qn$2(r) : ym(this._doc, String(r)).toString();
        case os.STYLE:
          return Yg(r, `Style`) ? qn$2(r) : r;
        case os.SCRIPT:
          if (Yg(r, `Script`)) return qn$2(r);
          throw new M$1(5200, !1);
        case os.URL:
          return Yg(r, `URL`) ? qn$2(r) : ld(String(r));
        case os.RESOURCE_URL:
          if (Yg(r, `ResourceURL`)) return qn$2(r);
          throw new M$1(-5201, !1);
        default:
          throw new M$1(5202, !1);
      }
    }
    bypassSecurityTrustHtml(e) {
      return Kg(e);
    }
    bypassSecurityTrustStyle(e) {
      return Jg(e);
    }
    bypassSecurityTrustScript(e) {
      return Xg(e);
    }
    bypassSecurityTrustUrl(e) {
      return em(e);
    }
    bypassSecurityTrustResourceUrl(e) {
      return tm(e);
    }
    static ɵfac = function (r) {
      return new (r || n)();
    };
    static ɵprov = er$2({ token: n, factory: n.ɵfac });
  }
  return n;
})();
var kn$1 = class n {
  VisibilityChanged;
  constructor() {
    this.VisibilityChanged = new Z$2();
  }
  static ɵfac = function (e) {
    return new (e || n)();
  };
  static ɵprov = se$1({ token: n, factory: n.ɵfac, providedIn: `root` });
};
var f = `primary`;
var Pe = Symbol(`RouteTitle`);
var zt = class {
  params;
  constructor(r) {
    this.params = r || {};
  }
  has(r) {
    return Object.hasOwn(this.params, r);
  }
  get(r) {
    if (this.has(r)) {
      let e = this.params[r];
      return Array.isArray(e) ? e[0] : e;
    }
    return null;
  }
  getAll(r) {
    if (this.has(r)) {
      let e = this.params[r];
      return Array.isArray(e) ? e : [e];
    }
    return [];
  }
  get keys() {
    return Object.keys(this.params);
  }
};
function J(t) {
  return new zt(t);
}
function xt(t, r, e) {
  for (let n = 0; n < t.length; n++) {
    let i = t[n],
      o = r[n];
    if (i[0] === `:`) e[i.substring(1)] = o;
    else if (i !== o.path) return !1;
  }
  return !0;
}
function Xr(t, r, e) {
  let n = e.path.split(`/`),
    i = n.indexOf(`**`);
  if (i === -1) {
    if (n.length > t.length || (e.pathMatch === `full` && (r.hasChildren() || n.length < t.length))) return null;
    let a = {},
      u = t.slice(0, n.length);
    return xt(n, u, a) ? { consumed: u, posParams: a } : null;
  }
  if (i !== n.lastIndexOf(`**`)) return null;
  let o = n.slice(0, i),
    s = n.slice(i + 1);
  if (o.length + s.length > t.length || (e.pathMatch === `full` && r.hasChildren() && e.path !== `**`)) return null;
  let c = {};
  return !xt(o, t.slice(0, o.length), c) || !xt(s, t.slice(t.length - s.length), c)
    ? null
    : { consumed: t, posParams: c };
}
function Xe(t) {
  return new Promise((r, e) => {
    t.pipe(ch()).subscribe({ next: (n) => r(n), error: (n) => e(n) });
  });
}
function Yn(t, r) {
  if (t.length !== r.length) return !1;
  for (let e = 0; e < t.length; ++e) if (!k(t[e], r[e])) return !1;
  return !0;
}
function k(t, r) {
  let e = t ? qt(t) : void 0,
    n = r ? qt(r) : void 0;
  if (!e || !n || e.length != n.length) return !1;
  let i;
  for (let o = 0; o < e.length; o++) if (((i = e[o]), !en(t[i], r[i]))) return !1;
  return !0;
}
function qt(t) {
  return [...Object.keys(t), ...Object.getOwnPropertySymbols(t)];
}
function en(t, r) {
  if (Array.isArray(t) && Array.isArray(r)) {
    if (t.length !== r.length) return !1;
    let e = [...t].sort(),
      n = [...r].sort();
    return e.every((i, o) => n[o] === i);
  } else return t === r;
}
function Zn(t) {
  return t.length > 0 ? t[t.length - 1] : null;
}
function te(t) {
  return Pp(t) ? t : qa(t) ? Ee$2(Promise.resolve(t)) : kp(t);
}
function tn(t) {
  return Pp(t) ? Xe(t) : Promise.resolve(t);
}
var Jn = { exact: on, subset: sn };
var rn = { exact: Xn, subset: ei, ignored: () => !0 };
var nn = { paths: `exact`, fragment: `ignored`, matrixParams: `ignored`, queryParams: `exact` };
var Ht = { paths: `subset`, fragment: `ignored`, matrixParams: `ignored`, queryParams: `subset` };
function Vr(t, r, e) {
  return (
    Jn[e.paths](t.root, r.root, e.matrixParams) &&
    rn[e.queryParams](t.queryParams, r.queryParams) &&
    !(e.fragment === `exact` && t.fragment !== r.fragment)
  );
}
function Xn(t, r) {
  return k(t, r);
}
function on(t, r, e) {
  if (!Z(t.segments, r.segments) || !Ye(t.segments, r.segments, e) || t.numberOfChildren !== r.numberOfChildren)
    return !1;
  for (let n in r.children) if (!t.children[n] || !on(t.children[n], r.children[n], e)) return !1;
  return !0;
}
function ei(t, r) {
  return Object.keys(r).length <= Object.keys(t).length && Object.keys(r).every((e) => en(t[e], r[e]));
}
function sn(t, r, e) {
  return an(t, r, r.segments, e);
}
function an(t, r, e, n) {
  if (t.segments.length > e.length) {
    let i = t.segments.slice(0, e.length);
    return !(!Z(i, e) || r.hasChildren() || !Ye(i, e, n));
  } else if (t.segments.length === e.length) {
    if (!Z(t.segments, e) || !Ye(t.segments, e, n)) return !1;
    for (let i in r.children) if (!t.children[i] || !sn(t.children[i], r.children[i], n)) return !1;
    return !0;
  } else {
    let i = e.slice(0, t.segments.length),
      o = e.slice(t.segments.length);
    return !Z(t.segments, i) || !Ye(t.segments, i, n) || !t.children[f] ? !1 : an(t.children[f], r, o, n);
  }
}
function Ye(t, r, e) {
  return r.every((n, i) => rn[e](t[i].parameters, n.parameters));
}
var P = class {
  root;
  queryParams;
  fragment;
  _queryParamMap;
  constructor(r = new m([], {}), e = {}, n = null) {
    ((this.root = r), (this.queryParams = e), (this.fragment = n));
  }
  get queryParamMap() {
    return ((this._queryParamMap ??= J(this.queryParams)), this._queryParamMap);
  }
  toString() {
    return ni.serialize(this);
  }
};
var m = class {
  segments;
  children;
  parent = null;
  constructor(r, e) {
    ((this.segments = r), (this.children = e), Object.values(e).forEach((n) => (n.parent = this)));
  }
  hasChildren() {
    return this.numberOfChildren > 0;
  }
  get numberOfChildren() {
    return Object.keys(this.children).length;
  }
  toString() {
    return Ze(this);
  }
};
var B = class {
  path;
  parameters;
  _parameterMap;
  constructor(r, e) {
    ((this.path = r), (this.parameters = e));
  }
  get parameterMap() {
    return ((this._parameterMap ??= J(this.parameters)), this._parameterMap);
  }
  toString() {
    return un(this);
  }
};
function ti(t, r) {
  return Z(t, r) && t.every((e, n) => k(e.parameters, r[n].parameters));
}
function Z(t, r) {
  return t.length !== r.length ? !1 : t.every((e, n) => e.path === r[n].path);
}
function ri(t, r) {
  let e = [];
  return (
    Object.entries(t.children).forEach(([n, i]) => {
      n === f && (e = e.concat(r(i, n)));
    }),
    Object.entries(t.children).forEach(([n, i]) => {
      n !== f && (e = e.concat(r(i, n)));
    }),
    e
  );
}
var Ue = (() => {
  class t {
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: () => new V() });
  }
  return t;
})();
var V = class {
  parse(r) {
    let e = new Vt(r);
    return new P(e.parseRootSegment(), e.parseQueryParams(), e.parseFragment());
  }
  serialize(r) {
    return `${`/${Se(r.root, !0)}`}${si(r.queryParams)}${typeof r.fragment == `string` ? `#${ii(r.fragment)}` : ``}`;
  }
};
var ni = new V();
function Ze(t) {
  return t.segments.map((r) => un(r)).join(`/`);
}
function Se(t, r) {
  if (!t.hasChildren()) return Ze(t);
  if (r) {
    let e = t.children[f] ? Se(t.children[f], !1) : ``,
      n = [];
    return (
      Object.entries(t.children).forEach(([i, o]) => {
        i !== f && n.push(`${i}:${Se(o, !1)}`);
      }),
      n.length > 0 ? `${e}(${n.join(`//`)})` : e
    );
  } else {
    let e = ri(t, (n, i) => (i === f ? [Se(t.children[f], !1)] : [`${i}:${Se(n, !1)}`]));
    return Object.keys(t.children).length === 1 && t.children[f] != null
      ? `${Ze(t)}/${e[0]}`
      : `${Ze(t)}/(${e.join(`//`)})`;
  }
}
function cn(t) {
  return encodeURIComponent(t).replace(/%40/g, `@`).replace(/%3A/gi, `:`).replace(/%24/g, `$`).replace(/%2C/gi, `,`);
}
function Qe(t) {
  return cn(t).replace(/%3B/gi, `;`);
}
function ii(t) {
  return encodeURI(t);
}
function Bt(t) {
  return cn(t).replace(/\(/g, `%28`).replace(/\)/g, `%29`).replace(/%26/gi, `&`);
}
function Je(t) {
  return decodeURIComponent(t);
}
function Gr(t) {
  return Je(t.replace(/\+/g, `%20`));
}
function un(t) {
  return `${Bt(t.path)}${oi(t.parameters)}`;
}
function oi(t) {
  return Object.entries(t)
    .map(([r, e]) => `;${Bt(r)}=${Bt(e)}`)
    .join(``);
}
function si(t) {
  let r = Object.entries(t)
    .map(([e, n]) => (Array.isArray(n) ? n.map((i) => `${Qe(e)}=${Qe(i)}`).join(`&`) : `${Qe(e)}=${Qe(n)}`))
    .filter((e) => e);
  return r.length ? `?${r.join(`&`)}` : ``;
}
var ai = /^[^\/()?;#]+/;
function kt(t) {
  let r = t.match(ai);
  return r ? r[0] : ``;
}
var ci = /^[^\/()?;=#]+/;
function ui(t) {
  let r = t.match(ci);
  return r ? r[0] : ``;
}
var li = /^[^=?&#]+/;
function di(t) {
  let r = t.match(li);
  return r ? r[0] : ``;
}
var hi = /^[^&#]+/;
function fi(t) {
  let r = t.match(hi);
  return r ? r[0] : ``;
}
var Vt = class {
  url;
  remaining;
  constructor(r) {
    ((this.url = r), (this.remaining = r));
  }
  parseRootSegment() {
    for (; this.consumeOptional(`/`););
    return this.remaining === `` || this.peekStartsWith(`?`) || this.peekStartsWith(`#`)
      ? new m([], {})
      : new m([], this.parseChildren());
  }
  parseQueryParams() {
    let r = {};
    if (this.consumeOptional(`?`))
      do this.parseQueryParam(r);
      while (this.consumeOptional(`&`));
    return r;
  }
  parseFragment() {
    return this.consumeOptional(`#`) ? decodeURIComponent(this.remaining) : null;
  }
  parseChildren(r = 0) {
    if (r > 50) throw new M$1(4010, !1);
    if (this.remaining === ``) return {};
    this.consumeOptional(`/`);
    let e = [];
    for (
      this.peekStartsWith(`(`) || e.push(this.parseSegment());
      this.peekStartsWith(`/`) && !this.peekStartsWith(`//`) && !this.peekStartsWith(`/(`);
    )
      (this.capture(`/`), e.push(this.parseSegment()));
    let n = {};
    this.peekStartsWith(`/(`) && (this.capture(`/`), (n = this.parseParens(!0, r)));
    let i = {};
    return (
      this.peekStartsWith(`(`) && (i = this.parseParens(!1, r)),
      (e.length > 0 || Object.keys(n).length > 0) && (i[f] = new m(e, n)),
      i
    );
  }
  parseSegment() {
    let r = kt(this.remaining);
    if (r === `` && this.peekStartsWith(`;`)) throw new M$1(4009, !1);
    return (this.capture(r), new B(Je(r), this.parseMatrixParams()));
  }
  parseMatrixParams() {
    let r = {};
    for (; this.consumeOptional(`;`);) this.parseParam(r);
    return r;
  }
  parseParam(r) {
    let e = ui(this.remaining);
    if (!e) return;
    this.capture(e);
    let n = ``;
    if (this.consumeOptional(`=`)) {
      let i = kt(this.remaining);
      i && ((n = i), this.capture(n));
    }
    r[Je(e)] = Je(n);
  }
  parseQueryParam(r) {
    let e = di(this.remaining);
    if (!e) return;
    this.capture(e);
    let n = ``;
    if (this.consumeOptional(`=`)) {
      let s = fi(this.remaining);
      s && ((n = s), this.capture(n));
    }
    let i = Gr(e),
      o = Gr(n);
    if (Object.hasOwn(r, i)) {
      let s = r[i];
      (Array.isArray(s) || ((s = [s]), (r[i] = s)), s.push(o));
    } else r[i] = o;
  }
  parseParens(r, e) {
    let n = Object.create(null);
    for (this.capture(`(`); !this.consumeOptional(`)`) && this.remaining.length > 0;) {
      let i = kt(this.remaining),
        o = this.remaining[i.length];
      if (o !== `/` && o !== `)` && o !== `;`) throw new M$1(4010, !1);
      let s;
      i.indexOf(`:`) > -1 ? ((s = i.slice(0, i.indexOf(`:`))), this.capture(s), this.capture(`:`)) : r && (s = f);
      let c = this.parseChildren(e + 1);
      ((n[s ?? f] = Object.keys(c).length === 1 && c[f] ? c[f] : new m([], c)), this.consumeOptional(`//`));
    }
    return n;
  }
  peekStartsWith(r) {
    return this.remaining.startsWith(r);
  }
  consumeOptional(r) {
    return this.peekStartsWith(r) ? ((this.remaining = this.remaining.substring(r.length)), !0) : !1;
  }
  capture(r) {
    if (!this.consumeOptional(r)) throw new M$1(4011, !1);
  }
};
function ln(t) {
  return t.segments.length > 0 ? new m([], { [f]: t }) : t;
}
function dn(t) {
  let r = Object.create(null);
  for (let [n, i] of Object.entries(t.children)) {
    let o = dn(i);
    if (n === f && o.segments.length === 0 && o.hasChildren()) for (let [s, c] of Object.entries(o.children)) r[s] = c;
    else (o.segments.length > 0 || o.hasChildren()) && (r[n] = o);
  }
  return pi(new m(t.segments, r));
}
function pi(t) {
  if (t.numberOfChildren === 1 && t.children[f]) {
    let r = t.children[f];
    return new m(t.segments.concat(r.segments), r.children);
  }
  return t;
}
function ue(t) {
  return t instanceof P;
}
function hn(t, r, e = null, n = null, i = new V()) {
  return pn(fn(t), r, e, n, i);
}
function fn(t) {
  let r;
  function e(o) {
    let s = {};
    for (let a of o.children) {
      let u = e(a);
      s[a.outlet] = u;
    }
    let c = new m(o.url, s);
    return (o === t && (r = c), c);
  }
  let i = ln(e(t.root));
  return r ?? i;
}
function pn(t, r, e, n, i) {
  let o = t;
  for (; o.parent;) o = o.parent;
  if (r.length === 0) return $t(o, o, o, e, n, i);
  let s = gi(r);
  if (s.toRoot()) return $t(o, o, new m([], {}), e, n, i);
  let c = vi(s, o, t),
    a = c.processChildren ? we(c.segmentGroup, c.index, s.commands) : vn(c.segmentGroup, c.index, s.commands);
  return $t(o, c.segmentGroup, a, e, n, i);
}
function et(t) {
  return typeof t == `object` && t != null && !t.outlets && !t.segmentPath;
}
function Ae(t) {
  return typeof t == `object` && t != null && t.outlets;
}
function Wr(t, r, e) {
  t ||= `ɵ`;
  let n = new P();
  return ((n.queryParams = { [t]: r }), e.parse(e.serialize(n)).queryParams[t]);
}
function $t(t, r, e, n, i, o) {
  let s = {};
  for (let [u, l] of Object.entries(n ?? {})) s[u] = Array.isArray(l) ? l.map((v) => Wr(u, v, o)) : Wr(u, l, o);
  let c;
  t === r ? (c = e) : (c = gn(t, r, e));
  return new P(ln(dn(c)), s, i);
}
function gn(t, r, e) {
  let n = Object.create(null);
  return (
    Object.entries(t.children).forEach(([i, o]) => {
      o === r ? (n[i] = e) : (n[i] = gn(o, r, e));
    }),
    new m(t.segments, n)
  );
}
var tt = class {
  isAbsolute;
  numberOfDoubleDots;
  commands;
  constructor(r, e, n) {
    if (((this.isAbsolute = r), (this.numberOfDoubleDots = e), (this.commands = n), r && n.length > 0 && et(n[0])))
      throw new M$1(4003, !1);
    let i = n.find(Ae);
    if (i && i !== Zn(n)) throw new M$1(4004, !1);
  }
  toRoot() {
    return this.isAbsolute && this.commands.length === 1 && this.commands[0] == `/`;
  }
};
function gi(t) {
  if (typeof t[0] == `string` && t.length === 1 && t[0] === `/`) return new tt(!0, 0, t);
  let r = 0,
    e = !1,
    n = t.reduce((i, o, s) => {
      if (typeof o == `object` && o != null) {
        if (o.outlets) {
          let c = {};
          return (
            Object.entries(o.outlets).forEach(([a, u]) => {
              c[a] = typeof u == `string` ? u.split(`/`) : u;
            }),
            [...i, { outlets: c }]
          );
        }
        if (o.segmentPath) return [...i, o.segmentPath];
      }
      return typeof o != `string`
        ? [...i, o]
        : s === 0
          ? (o.split(`/`).forEach((c, a) => {
              (a == 0 && c === `.`) || (a == 0 && c === `` ? (e = !0) : c === `..` ? r++ : c != `` && i.push(c));
            }),
            i)
          : [...i, o];
    }, []);
  return new tt(e, r, n);
}
var ae = class {
  segmentGroup;
  processChildren;
  index;
  constructor(r, e, n) {
    ((this.segmentGroup = r), (this.processChildren = e), (this.index = n));
  }
};
function vi(t, r, e) {
  if (t.isAbsolute) return new ae(r, !0, 0);
  if (!e) return new ae(r, !1, NaN);
  if (e.parent === null) return new ae(e, !0, 0);
  let n = et(t.commands[0]) ? 0 : 1;
  return mi(e, e.segments.length - 1 + n, t.numberOfDoubleDots);
}
function mi(t, r, e) {
  let n = t,
    i = r,
    o = e;
  for (; o > i;) {
    if (((o -= i), (n = n.parent), !n)) throw new M$1(4005, !1);
    i = n.segments.length;
  }
  return new ae(n, !1, i - o);
}
function yi(t) {
  return Ae(t[0]) ? t[0].outlets : { [f]: t };
}
function vn(t, r, e) {
  if (((t ??= new m([], {})), t.segments.length === 0 && t.hasChildren())) return we(t, r, e);
  let n = Ri(t, r, e),
    i = e.slice(n.commandIndex);
  if (n.match && n.pathIndex < t.segments.length) {
    let o = new m(t.segments.slice(0, n.pathIndex), {});
    return ((o.children[f] = new m(t.segments.slice(n.pathIndex), t.children)), we(o, 0, i));
  } else
    return n.match && i.length === 0
      ? new m(t.segments, {})
      : n.match && !t.hasChildren()
        ? Gt(t, r, e)
        : n.match
          ? we(t, 0, i)
          : Gt(t, r, e);
}
function we(t, r, e) {
  if (e.length === 0) return new m(t.segments, {});
  {
    let n = yi(e),
      i = Object.create(null);
    if (
      Object.keys(n).some((o) => o !== f) &&
      t.children[f] &&
      t.numberOfChildren === 1 &&
      t.children[f].segments.length === 0
    ) {
      let o = we(t.children[f], r, e);
      return new m(t.segments, o.children);
    }
    return (
      Object.entries(n).forEach(([o, s]) => {
        (typeof s == `string` && (s = [s]), s !== null && (i[o] = vn(t.children[o], r, s)));
      }),
      Object.entries(t.children).forEach(([o, s]) => {
        n[o] === void 0 && (i[o] = s);
      }),
      new m(t.segments, i)
    );
  }
}
function Ri(t, r, e) {
  let n = 0,
    i = r,
    o = { match: !1, pathIndex: 0, commandIndex: 0 };
  for (; i < t.segments.length;) {
    if (n >= e.length) return o;
    let s = t.segments[i],
      c = e[n];
    if (Ae(c)) break;
    let a = `${c}`,
      u = n < e.length - 1 ? e[n + 1] : null;
    if (i > 0 && a === void 0) break;
    if (a && u && typeof u == `object` && u.outlets === void 0) {
      if (!Kr(a, u, s)) return o;
      n += 2;
    } else {
      if (!Kr(a, {}, s)) return o;
      n++;
    }
    i++;
  }
  return { match: !0, pathIndex: i, commandIndex: n };
}
function Gt(t, r, e) {
  let n = t.segments.slice(0, r),
    i = 0;
  for (; i < e.length;) {
    let o = e[i];
    if (Ae(o)) return new m(n, Si(o.outlets));
    if (i === 0 && et(e[0])) {
      let a = t.segments[r];
      (n.push(new B(a.path, Qr(e[0]))), i++);
      continue;
    }
    let s = Ae(o) ? o.outlets[f] : `${o}`,
      c = i < e.length - 1 ? e[i + 1] : null;
    s && c && et(c) ? (n.push(new B(s, Qr(c))), (i += 2)) : (n.push(new B(s, {})), i++);
  }
  return new m(n, {});
}
function Si(t) {
  let r = {};
  return (
    Object.entries(t).forEach(([e, n]) => {
      (typeof n == `string` && (n = [n]), n !== null && (r[e] = Gt(new m([], {}), 0, n)));
    }),
    r
  );
}
function Qr(t) {
  let r = {};
  return (Object.entries(t).forEach(([e, n]) => (r[e] = `${n}`)), r);
}
function Kr(t, r, e) {
  return t == e.path && k(r, e.parameters);
}
var be = `imperative`;
var R = (function (t) {
  return (
    (t[(t.NavigationStart = 0)] = `NavigationStart`),
    (t[(t.NavigationEnd = 1)] = `NavigationEnd`),
    (t[(t.NavigationCancel = 2)] = `NavigationCancel`),
    (t[(t.NavigationError = 3)] = `NavigationError`),
    (t[(t.RoutesRecognized = 4)] = `RoutesRecognized`),
    (t[(t.ResolveStart = 5)] = `ResolveStart`),
    (t[(t.ResolveEnd = 6)] = `ResolveEnd`),
    (t[(t.GuardsCheckStart = 7)] = `GuardsCheckStart`),
    (t[(t.GuardsCheckEnd = 8)] = `GuardsCheckEnd`),
    (t[(t.RouteConfigLoadStart = 9)] = `RouteConfigLoadStart`),
    (t[(t.RouteConfigLoadEnd = 10)] = `RouteConfigLoadEnd`),
    (t[(t.ChildActivationStart = 11)] = `ChildActivationStart`),
    (t[(t.ChildActivationEnd = 12)] = `ChildActivationEnd`),
    (t[(t.ActivationStart = 13)] = `ActivationStart`),
    (t[(t.ActivationEnd = 14)] = `ActivationEnd`),
    (t[(t.Scroll = 15)] = `Scroll`),
    (t[(t.NavigationSkipped = 16)] = `NavigationSkipped`),
    t
  );
})(R || {});
var M = class {
  id;
  url;
  constructor(r, e) {
    ((this.id = r), (this.url = e));
  }
};
var X = class extends M {
  type = R.NavigationStart;
  navigationTrigger;
  restoredState;
  constructor(r, e, n = `imperative`, i = null) {
    (super(r, e), (this.navigationTrigger = n), (this.restoredState = i));
  }
  toString() {
    return `NavigationStart(id: ${this.id}, url: '${this.url}')`;
  }
};
var F = class extends M {
  urlAfterRedirects;
  type = R.NavigationEnd;
  constructor(r, e, n) {
    (super(r, e), (this.urlAfterRedirects = n));
  }
  toString() {
    return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
  }
};
var C = (function (t) {
  return (
    (t[(t.Redirect = 0)] = `Redirect`),
    (t[(t.SupersededByNewNavigation = 1)] = `SupersededByNewNavigation`),
    (t[(t.NoDataFromResolver = 2)] = `NoDataFromResolver`),
    (t[(t.GuardRejected = 3)] = `GuardRejected`),
    (t[(t.Aborted = 4)] = `Aborted`),
    t
  );
})(C || {});
var Ee = (function (t) {
  return (
    (t[(t.IgnoredSameUrlNavigation = 0)] = `IgnoredSameUrlNavigation`),
    (t[(t.IgnoredByUrlHandlingStrategy = 1)] = `IgnoredByUrlHandlingStrategy`),
    t
  );
})(Ee || {});
var O = class extends M {
  reason;
  code;
  type = R.NavigationCancel;
  constructor(r, e, n, i) {
    (super(r, e), (this.reason = n), (this.code = i));
  }
  toString() {
    return `NavigationCancel(id: ${this.id}, url: '${this.url}')`;
  }
};
function mn(t) {
  return t instanceof O && (t.code === C.Redirect || t.code === C.SupersededByNewNavigation);
}
var z = class extends M {
  reason;
  code;
  type = R.NavigationSkipped;
  constructor(r, e, n, i) {
    (super(r, e), (this.reason = n), (this.code = i));
  }
};
var ee = class extends M {
  error;
  target;
  type = R.NavigationError;
  constructor(r, e, n, i) {
    (super(r, e), (this.error = n), (this.target = i));
  }
  toString() {
    return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
  }
};
var Me = class extends M {
  urlAfterRedirects;
  state;
  type = R.RoutesRecognized;
  constructor(r, e, n, i) {
    (super(r, e), (this.urlAfterRedirects = n), (this.state = i));
  }
  toString() {
    return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
};
var rt = class extends M {
  urlAfterRedirects;
  state;
  type = R.GuardsCheckStart;
  constructor(r, e, n, i) {
    (super(r, e), (this.urlAfterRedirects = n), (this.state = i));
  }
  toString() {
    return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
};
var nt = class extends M {
  urlAfterRedirects;
  state;
  shouldActivate;
  type = R.GuardsCheckEnd;
  constructor(r, e, n, i, o) {
    (super(r, e), (this.urlAfterRedirects = n), (this.state = i), (this.shouldActivate = o));
  }
  toString() {
    return `GuardsCheckEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state}, shouldActivate: ${this.shouldActivate})`;
  }
};
var it = class extends M {
  urlAfterRedirects;
  state;
  type = R.ResolveStart;
  constructor(r, e, n, i) {
    (super(r, e), (this.urlAfterRedirects = n), (this.state = i));
  }
  toString() {
    return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
};
var ot = class extends M {
  urlAfterRedirects;
  state;
  type = R.ResolveEnd;
  constructor(r, e, n, i) {
    (super(r, e), (this.urlAfterRedirects = n), (this.state = i));
  }
  toString() {
    return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
};
var st = class {
  route;
  type = R.RouteConfigLoadStart;
  constructor(r) {
    this.route = r;
  }
  toString() {
    return `RouteConfigLoadStart(path: ${this.route.path})`;
  }
};
var at = class {
  route;
  type = R.RouteConfigLoadEnd;
  constructor(r) {
    this.route = r;
  }
  toString() {
    return `RouteConfigLoadEnd(path: ${this.route.path})`;
  }
};
var ct = class {
  snapshot;
  type = R.ChildActivationStart;
  constructor(r) {
    this.snapshot = r;
  }
  toString() {
    return `ChildActivationStart(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ``}')`;
  }
};
var ut = class {
  snapshot;
  type = R.ChildActivationEnd;
  constructor(r) {
    this.snapshot = r;
  }
  toString() {
    return `ChildActivationEnd(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ``}')`;
  }
};
var lt = class {
  snapshot;
  type = R.ActivationStart;
  constructor(r) {
    this.snapshot = r;
  }
  toString() {
    return `ActivationStart(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ``}')`;
  }
};
var dt = class {
  snapshot;
  type = R.ActivationEnd;
  constructor(r) {
    this.snapshot = r;
  }
  toString() {
    return `ActivationEnd(path: '${(this.snapshot.routeConfig && this.snapshot.routeConfig.path) || ``}')`;
  }
};
var le = class {};
var _e = class {};
var de = class {
  url;
  navigationBehaviorOptions;
  constructor(r, e) {
    ((this.url = r), (this.navigationBehaviorOptions = e));
  }
};
function Ci(t) {
  return !(t instanceof le) && !(t instanceof de) && !(t instanceof _e);
}
var ht = class {
  rootInjector;
  outlet = null;
  route = null;
  children;
  attachRef = null;
  get injector() {
    return this.route?.snapshot._environmentInjector ?? this.rootInjector;
  }
  constructor(r) {
    ((this.rootInjector = r), (this.children = new ge(this.rootInjector)));
  }
};
var ge = (() => {
  class t {
    rootInjector;
    contexts = new Map();
    constructor(e) {
      this.rootInjector = e;
    }
    onChildOutletCreated(e, n) {
      let i = this.getOrCreateContext(e);
      ((i.outlet = n), this.contexts.set(e, i));
    }
    onChildOutletDestroyed(e) {
      let n = this.getContext(e);
      n && ((n.outlet = null), (n.attachRef = null));
    }
    onOutletDeactivated() {
      let e = this.contexts;
      return ((this.contexts = new Map()), e);
    }
    onOutletReAttached(e) {
      this.contexts = e;
    }
    getOrCreateContext(e) {
      let n = this.getContext(e);
      return (n || ((n = new ht(this.rootInjector)), this.contexts.set(e, n)), n);
    }
    getContext(e) {
      return this.contexts.get(e) || null;
    }
    static ɵfac = function (n) {
      return new (n || t)(De$2(ie$1));
    };
    static ɵprov = se$1({ token: t, factory: t.ɵfac, providedIn: `root` });
  }
  return t;
})();
var ft = class {
  _root;
  constructor(r) {
    this._root = r;
  }
  get root() {
    return this._root.value;
  }
  parent(r) {
    let e = this.pathFromRoot(r);
    return e.length > 1 ? e[e.length - 2] : null;
  }
  children(r) {
    let e = Wt(r, this._root);
    return e ? e.children.map((n) => n.value) : [];
  }
  firstChild(r) {
    let e = Wt(r, this._root);
    return e && e.children.length > 0 ? e.children[0].value : null;
  }
  siblings(r) {
    let e = Qt(r, this._root);
    return e.length < 2 ? [] : e[e.length - 2].children.map((i) => i.value).filter((i) => i !== r);
  }
  pathFromRoot(r) {
    return Qt(r, this._root).map((e) => e.value);
  }
};
function Wt(t, r) {
  if (t === r.value) return r;
  for (let e of r.children) {
    let n = Wt(t, e);
    if (n) return n;
  }
  return null;
}
function Qt(t, r) {
  if (t === r.value) return [r];
  for (let e of r.children) {
    let n = Qt(t, e);
    if (n.length) return (n.unshift(r), n);
  }
  return [];
}
var E = class {
  value;
  children;
  constructor(r, e) {
    ((this.value = r), (this.children = e));
  }
  toString() {
    return `TreeNode(${this.value})`;
  }
};
function se(t) {
  let r = {};
  return (t && t.children.forEach((e) => (r[e.value.outlet] = e)), r);
}
var Ne = class extends ft {
  snapshot;
  constructor(r, e) {
    (super(r), (this.snapshot = e), ir(this, r));
  }
  toString() {
    return this.snapshot.toString();
  }
};
function yn(t, r) {
  let e = wi(t, r),
    n = new vn$1([new B(``, {})]),
    i = new vn$1({}),
    o = new vn$1({}),
    a = new G(n, i, new vn$1({}), new vn$1(``), o, f, t, e.root);
  return ((a.snapshot = e.root), new Ne(new E(a, []), e));
}
function wi(t, r) {
  return new De(``, new E(new he([], {}, {}, ``, {}, f, t, null, {}, r), []));
}
var G = class {
  urlSubject;
  paramsSubject;
  queryParamsSubject;
  fragmentSubject;
  dataSubject;
  outlet;
  component;
  snapshot;
  _futureSnapshot;
  _routerState;
  _paramMap;
  _queryParamMap;
  title;
  url;
  params;
  queryParams;
  fragment;
  data;
  resources;
  _localInjector;
  pending;
  paramsSignal;
  queryParamsSignal;
  paramMapSignal;
  queryParamMapSignal;
  fragmentSignal;
  dataSignal;
  constructor(r, e, n, i, o, s, c, a) {
    ((this.urlSubject = r),
      (this.paramsSubject = e),
      (this.queryParamsSubject = n),
      (this.fragmentSubject = i),
      (this.dataSubject = o),
      (this.outlet = s),
      (this.component = c),
      (this._futureSnapshot = a),
      (this.title = this.dataSubject?.pipe(ke$2((u) => u[Pe])) ?? kp(void 0)),
      (this.url = r),
      (this.params = e),
      (this.queryParams = n),
      (this.fragment = i),
      (this.data = o));
  }
  get routeConfig() {
    return this._futureSnapshot.routeConfig;
  }
  get root() {
    return this._routerState.root;
  }
  get parent() {
    return this._routerState.parent(this);
  }
  get firstChild() {
    return this._routerState.firstChild(this);
  }
  get children() {
    return this._routerState.children(this);
  }
  get pathFromRoot() {
    return this._routerState.pathFromRoot(this);
  }
  get paramMap() {
    return ((this._paramMap ??= this.params.pipe(ke$2((r) => J(r)))), this._paramMap);
  }
  get queryParamMap() {
    return ((this._queryParamMap ??= this.queryParams.pipe(ke$2((r) => J(r)))), this._queryParamMap);
  }
  toString() {
    return this.snapshot ? this.snapshot.toString() : `Future(${this._futureSnapshot})`;
  }
  _setPending(r) {
    ((this._futureSnapshot = r), this.pending?.set(!0));
  }
};
var bi = `always`;
function nr(t, r, e) {
  let n,
    { routeConfig: i } = t;
  return (
    r !== null && (e === `always` || i?.path === `` || (!r.component && !r.routeConfig?.loadComponent))
      ? (n = {
          params: l(l({}, r.params), t.params),
          data: l(l({}, r.data), t.data),
          resolve: l(l(l(l({}, t.data), r.data), i?.data), t._resolvedData),
        })
      : (n = { params: l({}, t.params), data: l({}, t.data), resolve: l(l({}, t.data), t._resolvedData ?? {}) }),
    i && Sn(i) && (n.resolve[Pe] = i.title),
    n
  );
}
var he = class {
  url;
  params;
  queryParams;
  fragment;
  data;
  outlet;
  component;
  routeConfig;
  _resolve;
  _resolvedData;
  _routerState;
  _paramMap;
  _queryParamMap;
  _environmentInjector;
  resources;
  get title() {
    return this.data?.[Pe];
  }
  constructor(r, e, n, i, o, s, c, a, u, l) {
    ((this.url = r),
      (this.params = e),
      (this.queryParams = n),
      (this.fragment = i),
      (this.data = o),
      (this.outlet = s),
      (this.component = c),
      (this.routeConfig = a),
      (this._resolve = u),
      (this._environmentInjector = l));
  }
  get root() {
    return this._routerState.root;
  }
  get parent() {
    return this._routerState.parent(this);
  }
  get firstChild() {
    return this._routerState.firstChild(this);
  }
  get children() {
    return this._routerState.children(this);
  }
  get pathFromRoot() {
    return this._routerState.pathFromRoot(this);
  }
  get paramMap() {
    return ((this._paramMap ??= J(this.params)), this._paramMap);
  }
  get queryParamMap() {
    return ((this._queryParamMap ??= J(this.queryParams)), this._queryParamMap);
  }
  toString() {
    return `Route(url:'${this.url.map((n) => n.toString()).join(`/`)}', path:'${this.routeConfig ? this.routeConfig.path : ``}')`;
  }
};
var De = class extends ft {
  url;
  constructor(r, e) {
    (super(e), (this.url = r), ir(this, e));
  }
  toString() {
    return Rn(this._root);
  }
};
function ir(t, r) {
  ((r.value._routerState = t), r.children.forEach((e) => ir(t, e)));
}
function Rn(t) {
  let r = t.children.length > 0 ? ` { ${t.children.map(Rn).join(`, `)} } ` : ``;
  return `${t.value}${r}`;
}
function Ft(t) {
  if (t.snapshot) {
    let r = t.snapshot,
      e = t._futureSnapshot;
    ((t.snapshot = e),
      k(r.queryParams, e.queryParams) || t.queryParamsSubject.next(e.queryParams),
      r.fragment !== e.fragment && t.fragmentSubject.next(e.fragment),
      k(r.params, e.params) || t.paramsSubject.next(e.params),
      Yn(r.url, e.url) || t.urlSubject.next(e.url),
      k(r.data, e.data) || t.dataSubject.next(e.data));
  } else ((t.snapshot = t._futureSnapshot), t.dataSubject.next(t._futureSnapshot.data));
}
function Kt(t, r) {
  let e = k(t.params, r.params) && ti(t.url, r.url),
    n = !t.parent != !r.parent;
  return e && !n && (!t.parent || Kt(t.parent, r.parent));
}
function Sn(t) {
  return typeof t.title == `string` || t.title === null;
}
var Cn = new A$1(``);
var Le = (() => {
  class t {
    activated = null;
    get activatedComponentRef() {
      return this.activated;
    }
    _activatedRoute = null;
    name = f;
    activateEvents = new Le$2();
    deactivateEvents = new Le$2();
    attachEvents = new Le$2();
    detachEvents = new Le$2();
    routerOutletData = WL();
    parentContexts = w(ge);
    location = w(ri$2);
    changeDetector = w(GL);
    inputBinder = w(mt, { optional: !0 });
    supportsBindingToComponentInputs = !0;
    ngOnChanges(e) {
      if (e.name) {
        let { firstChange: n, previousValue: i } = e.name;
        if (n) return;
        (this.isTrackedInParentContexts(i) && (this.deactivate(), this.parentContexts.onChildOutletDestroyed(i)),
          this.initializeOutletWithName());
      }
    }
    ngOnDestroy() {
      (this.isTrackedInParentContexts(this.name) && this.parentContexts.onChildOutletDestroyed(this.name),
        this.inputBinder?.unsubscribeFromRouteData(this));
    }
    isTrackedInParentContexts(e) {
      return this.parentContexts.getContext(e)?.outlet === this;
    }
    ngOnInit() {
      this.initializeOutletWithName();
    }
    initializeOutletWithName() {
      if ((this.parentContexts.onChildOutletCreated(this.name, this), this.activated)) return;
      let e = this.parentContexts.getContext(this.name);
      e?.route && (e.attachRef ? this.attach(e.attachRef, e.route) : this.activateWith(e.route, e.injector));
    }
    get isActivated() {
      return !!this.activated;
    }
    get component() {
      if (!this.activated) throw new M$1(4012, !1);
      return this.activated.instance;
    }
    get activatedRoute() {
      if (!this.activated) throw new M$1(4012, !1);
      return this._activatedRoute;
    }
    get activatedRouteData() {
      return this._activatedRoute ? this._activatedRoute.snapshot.data : {};
    }
    detach() {
      if (!this.activated) throw new M$1(4012, !1);
      this.location.detach();
      let e = this.activated;
      return ((this.activated = null), (this._activatedRoute = null), this.detachEvents.emit(e.instance), e);
    }
    attach(e, n) {
      ((this.activated = e),
        (this._activatedRoute = n),
        this.location.insert(e.hostView),
        this.inputBinder?.bindActivatedRouteToOutletComponent(this, this.location.injector),
        this.attachEvents.emit(e.instance));
    }
    deactivate() {
      if (this.activated) {
        let e = this.component;
        (this.activated.destroy(),
          (this.activated = null),
          (this._activatedRoute = null),
          this.deactivateEvents.emit(e));
      }
    }
    activateWith(e, n) {
      if (this.isActivated) throw new M$1(4013, !1);
      this._activatedRoute = e;
      let i = this.location,
        s = e.snapshot.component,
        c = this.parentContexts.getOrCreateContext(this.name).children,
        a = new Yt(e, c, i.injector, this.routerOutletData);
      ((this.activated = i.createComponent(s, { index: i.length, injector: a, environmentInjector: n })),
        this.changeDetector.markForCheck(),
        this.inputBinder?.bindActivatedRouteToOutletComponent(this, this.location.injector),
        this.activateEvents.emit(this.activated.instance));
    }
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵdir = $v({
      type: t,
      selectors: [[`router-outlet`]],
      inputs: { name: `name`, routerOutletData: [1, `routerOutletData`] },
      outputs: {
        activateEvents: `activate`,
        deactivateEvents: `deactivate`,
        attachEvents: `attach`,
        detachEvents: `detach`,
      },
      exportAs: [`outlet`],
      features: [yg],
    });
  }
  return t;
})();
var Yt = class {
  route;
  childContexts;
  parent;
  outletData;
  constructor(r, e, n, i) {
    ((this.route = r), (this.childContexts = e), (this.parent = n), (this.outletData = i));
  }
  get(r, e) {
    return r === G ? this.route : r === ge ? this.childContexts : r === Cn ? this.outletData : this.parent.get(r, e);
  }
};
var mt = new A$1(``);
var or = (() => {
  class t {
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵcmp = Fv({
      type: t,
      selectors: [[`ng-component`]],
      exportAs: [`emptyRouterOutlet`],
      decls: 1,
      vars: 0,
      template: function (n, i) {
        n & 1 && Af(0, `router-outlet`);
      },
      dependencies: [Le],
      encapsulation: 2,
      changeDetection: 1,
    });
  }
  return t;
})();
function sr(t) {
  let r = t.children && t.children.map(sr),
    e = r ? m$3(l({}, t), { children: r }) : l({}, t);
  return (
    !e.component && !e.loadComponent && (r || e.loadChildren) && e.outlet && e.outlet !== f && (e.component = or),
    e
  );
}
function Ii(t, r, e) {
  let n = new Set();
  return { newlyCreatedRoutes: n, state: new Ne(Te(t, r._root, e ? e._root : void 0, n), r) };
}
function Te(t, r, e, n) {
  if (e && t.shouldReuseRoute(r.value, e.value.snapshot)) {
    let i = e.value;
    i._setPending(r.value);
    return new E(i, Ai(t, r, e, n));
  } else {
    if (t.shouldAttach(r.value)) {
      let s = t.retrieve(r.value);
      if (s !== null) {
        let c = s.route;
        return (c.value._setPending(r.value), (c.children = r.children.map((a) => Te(t, a, void 0, n))), c);
      }
    }
    let i = Ei(r.value);
    (i._setPending(r.value), n.add(i));
    return new E(
      i,
      r.children.map((s) => Te(t, s, void 0, n)),
    );
  }
}
function Ai(t, r, e, n) {
  return r.children.map((i) => {
    for (let o of e.children) if (t.shouldReuseRoute(i.value, o.value.snapshot)) return Te(t, i, o, n);
    return Te(t, i, void 0, n);
  });
}
function Ei(t) {
  return new G(
    new vn$1(t.url),
    new vn$1(t.params),
    new vn$1(t.queryParams),
    new vn$1(t.fragment),
    new vn$1(t.data),
    t.outlet,
    t.component,
    t,
  );
}
var fe = class {
  redirectTo;
  navigationBehaviorOptions;
  constructor(r, e) {
    ((this.redirectTo = r), (this.navigationBehaviorOptions = e));
  }
};
var wn = `ngNavigationCancelingError`;
function pt(t, r) {
  let { redirectTo: e, navigationBehaviorOptions: n } = ue(r)
      ? { redirectTo: r, navigationBehaviorOptions: void 0 }
      : r,
    i = bn(!1, C.Redirect);
  return ((i.url = e), (i.navigationBehaviorOptions = n), i);
}
function bn(t, r) {
  let e = new Error(`NavigationCancelingError: ${t || ``}`);
  return ((e[wn] = !0), (e.cancellationCode = r), e);
}
function Mi(t) {
  return In(t) && ue(t.url);
}
function In(t) {
  return !!t && t[wn];
}
var Zt = class {
  routeReuseStrategy;
  futureState;
  currState;
  forwardEvent;
  inputBindingEnabled;
  constructor(r, e, n, i, o) {
    ((this.routeReuseStrategy = r),
      (this.futureState = e),
      (this.currState = n),
      (this.forwardEvent = i),
      (this.inputBindingEnabled = o));
  }
  activate(r) {
    let e = this.futureState._root,
      n = this.currState ? this.currState._root : null;
    (this.deactivateChildRoutes(e, n, r), Ft(this.futureState.root), this.activateChildRoutes(e, n, r));
  }
  deactivateChildRoutes(r, e, n) {
    let i = se(e);
    (r.children.forEach((o) => {
      let s = o.value.outlet;
      (this.deactivateRoutes(o, i[s], n), delete i[s]);
    }),
      Object.values(i).forEach((o) => {
        this.deactivateRouteAndItsChildren(o, n);
      }));
  }
  deactivateRoutes(r, e, n) {
    let i = r.value,
      o = e ? e.value : null;
    if (i === o)
      if (i.component) {
        let s = n.getContext(i.outlet);
        s && this.deactivateChildRoutes(r, e, s.children);
      } else this.deactivateChildRoutes(r, e, n);
    else o && this.deactivateRouteAndItsChildren(e, n);
  }
  deactivateRouteAndItsChildren(r, e) {
    r.value.component && this.routeReuseStrategy.shouldDetach(r.value.snapshot)
      ? this.detachAndStoreRouteSubtree(r, e)
      : this.deactivateRouteAndOutlet(r, e);
  }
  detachAndStoreRouteSubtree(r, e) {
    let n = e.getContext(r.value.outlet),
      i = n && r.value.component ? n.children : e,
      o = se(r);
    for (let s of Object.values(o)) this.deactivateRouteAndItsChildren(s, i);
    if (n && n.outlet) {
      let s = n.outlet.detach(),
        c = n.children.onOutletDeactivated();
      this.routeReuseStrategy.store(r.value.snapshot, { componentRef: s, route: r, contexts: c });
    }
  }
  deactivateRouteAndOutlet(r, e) {
    let n = e.getContext(r.value.outlet),
      i = n && r.value.component ? n.children : e,
      o = se(r);
    for (let s of Object.values(o)) this.deactivateRouteAndItsChildren(s, i);
    (n &&
      (n.outlet && (n.outlet.deactivate(), n.children.onOutletDeactivated()), (n.attachRef = null), (n.route = null)),
      r.value._localInjector?.destroy());
  }
  activateChildRoutes(r, e, n) {
    let i = se(e);
    (r.children.forEach((o) => {
      (this.activateRoutes(o, i[o.value.outlet], n), this.forwardEvent(new dt(o.value.snapshot)));
    }),
      r.children.length && this.forwardEvent(new ut(r.value.snapshot)));
  }
  activateRoutes(r, e, n) {
    let i = r.value,
      o = e ? e.value : null;
    if ((Ft(i), i === o))
      if (i.component) {
        let s = n.getOrCreateContext(i.outlet);
        this.activateChildRoutes(r, e, s.children);
      } else this.activateChildRoutes(r, e, n);
    else if (i.component) {
      let s = n.getOrCreateContext(i.outlet);
      if (this.routeReuseStrategy.shouldAttach(i.snapshot)) {
        let c = this.routeReuseStrategy.retrieve(i.snapshot);
        (this.routeReuseStrategy.store(i.snapshot, null),
          s.children.onOutletReAttached(c.contexts),
          (s.attachRef = c.componentRef),
          (s.route = c.route.value),
          s.outlet && s.outlet.attach(c.componentRef, c.route.value),
          Ft(c.route.value),
          this.activateChildRoutes(r, null, s.children));
      } else
        ((s.attachRef = null),
          (s.route = i),
          s.outlet && s.outlet.activateWith(i, s.injector),
          this.activateChildRoutes(r, null, s.children));
    } else this.activateChildRoutes(r, null, n);
  }
};
var gt = class {
  path;
  route;
  constructor(r) {
    ((this.path = r), (this.route = this.path[this.path.length - 1]));
  }
};
var ce = class {
  component;
  route;
  constructor(r, e) {
    ((this.component = r), (this.route = e));
  }
};
function _i(t, r, e) {
  let n = t._root;
  return Ce(n, r ? r._root : null, e, [n.value]);
}
function Ni(t) {
  let r = t.routeConfig ? t.routeConfig.canActivateChild : null;
  return !r || r.length === 0 ? null : { node: t, guards: r };
}
function ve(t, r) {
  let e = Symbol(),
    n = r.get(t, e);
  return n === e ? (typeof t == `function` && !vh(t) ? t : r.get(t)) : n;
}
function Ce(t, r, e, n, i = { canDeactivateChecks: [], canActivateChecks: [] }) {
  let o = se(r);
  return (
    t.children.forEach((s) => {
      (Di(s, o[s.value.outlet], e, n.concat([s.value]), i), delete o[s.value.outlet]);
    }),
    Object.entries(o).forEach(([s, c]) => Ie(c, e.getContext(s), e, i)),
    i
  );
}
function Di(t, r, e, n, i = { canDeactivateChecks: [], canActivateChecks: [] }) {
  let o = t.value,
    s = r ? r.value : null,
    c = e ? e.getContext(t.value.outlet) : null;
  if (s && o.routeConfig === s.routeConfig) {
    let a = Ti(s, o, o.routeConfig.runGuardsAndResolvers);
    (a ? i.canActivateChecks.push(new gt(n)) : ((o.data = s.data), (o._resolvedData = s._resolvedData)),
      o.component ? Ce(t, r, c ? c.children : null, n, i) : Ce(t, r, e, n, i),
      a && c && c.outlet && c.outlet.isActivated && i.canDeactivateChecks.push(new ce(c.outlet.component, s)));
  } else
    (s && Ie(r, c, e, i),
      i.canActivateChecks.push(new gt(n)),
      o.component ? Ce(t, null, c ? c.children : null, n, i) : Ce(t, null, e, n, i));
  return i;
}
function Ti(t, r, e) {
  if (typeof e == `function`) return io$1(r._environmentInjector, () => e(t, r));
  switch (e) {
    case `pathParamsChange`:
      return !Z(t.url, r.url);
    case `pathParamsOrQueryParamsChange`:
      return !Z(t.url, r.url) || !k(t.queryParams, r.queryParams);
    case `always`:
      return !0;
    case `paramsOrQueryParamsChange`:
      return !Kt(t, r) || !k(t.queryParams, r.queryParams);
    default:
      return !Kt(t, r);
  }
}
function Ie(t, r, e, n) {
  let i = se(t),
    o = t.value;
  (Object.entries(i).forEach(([s, c]) => {
    o.component
      ? r
        ? Ie(c, r.children.getContext(s), r.children, n)
        : Ie(c, null, null, n)
      : Ie(c, e ? e.getContext(s) : null, e, n);
  }),
    o.component
      ? r && r.outlet && r.outlet.isActivated
        ? n.canDeactivateChecks.push(new ce(r.outlet.component, o))
        : n.canDeactivateChecks.push(new ce(null, o))
      : n.canDeactivateChecks.push(new ce(null, o)));
}
function je(t) {
  return typeof t == `function`;
}
function Oi(t) {
  return typeof t == `boolean`;
}
function Pi(t) {
  return t && je(t.canLoad);
}
function Ui(t) {
  return t && je(t.canActivate);
}
function Li(t) {
  return t && je(t.canActivateChild);
}
function ji(t) {
  return t && je(t.canDeactivate);
}
function xi(t) {
  return t && je(t.canMatch);
}
function An(t) {
  return t instanceof Dn$2 || t?.name === `EmptyError`;
}
var Ke = Symbol(`INITIAL_VALUE`);
function pe() {
  return ph((t) =>
    Wp(t.map((r) => r.pipe(ft$2(1), fh(Ke)))).pipe(
      ke$2((r) => {
        for (let e of r)
          if (e !== !0) {
            if (e === Ke) return Ke;
            if (e === !1 || ki(e)) return e;
          }
        return !0;
      }),
      qt$2((r) => r !== Ke),
      ft$2(1),
    ),
  );
}
function ki(t) {
  return ue(t) || t instanceof fe;
}
function En(t) {
  return t.aborted
    ? kp(void 0).pipe(ft$2(1))
    : new b((r) => {
        let e = () => {
          (r.next(), r.complete());
        };
        return (t.addEventListener(`abort`, e), () => t.removeEventListener(`abort`, e));
      });
}
function Mn(t) {
  return hh(En(t));
}
function $i(t) {
  return fe$2((r) => {
    let {
      targetSnapshot: e,
      currentSnapshot: n,
      guards: { canActivateChecks: i, canDeactivateChecks: o },
    } = r;
    return o.length === 0 && i.length === 0
      ? kp(m$3(l({}, r), { guardsResult: !0 }))
      : Fi(o, e, n).pipe(
          fe$2((s) => (s && Oi(s) ? zi(e, i, t) : kp(s))),
          ke$2((s) => m$3(l({}, r), { guardsResult: s })),
        );
  });
}
function Fi(t, r, e) {
  return Ee$2(t).pipe(
    fe$2((n) => Gi(n.component, n.route, e, r)),
    ch((n) => n !== !0, !0),
  );
}
function zi(t, r, e) {
  return Ee$2(r).pipe(
    nh((n) => Wt$2(Hi(n.route.parent, e), qi(n.route, e), Vi(t, n.path), Bi(t, n.route))),
    ch((n) => n !== !0, !0),
  );
}
function qi(t, r) {
  return (t !== null && r && r(new lt(t)), kp(!0));
}
function Hi(t, r) {
  return (t !== null && r && r(new ct(t)), kp(!0));
}
function Bi(t, r) {
  let e = r.routeConfig ? r.routeConfig.canActivate : null;
  if (!e || e.length === 0) return kp(!0);
  return kp(
    e.map((i) =>
      Gp(() => {
        let o = r._environmentInjector,
          s = ve(i, o);
        return te(Ui(s) ? s.canActivate(r, t) : io$1(o, () => s(r, t))).pipe(ch());
      }),
    ),
  ).pipe(pe());
}
function Vi(t, r) {
  let e = r[r.length - 1];
  return kp(
    r
      .slice(0, r.length - 1)
      .reverse()
      .map((o) => Ni(o))
      .filter((o) => o !== null)
      .map((o) =>
        Gp(() => {
          return kp(
            o.guards.map((c) => {
              let a = o.node._environmentInjector,
                u = ve(c, a);
              return te(Li(u) ? u.canActivateChild(e, t) : io$1(a, () => u(e, t))).pipe(ch());
            }),
          ).pipe(pe());
        }),
      ),
  ).pipe(pe());
}
function Gi(t, r, e, n) {
  let i = r && r.routeConfig ? r.routeConfig.canDeactivate : null;
  if (!i || i.length === 0) return kp(!0);
  return kp(
    i.map((s) => {
      let c = r._environmentInjector,
        a = ve(s, c);
      return te(ji(a) ? a.canDeactivate(t, r, e, n) : io$1(c, () => a(t, r, e, n))).pipe(ch());
    }),
  ).pipe(pe());
}
function Wi(t, r, e, n, i) {
  let o = r.canLoad;
  if (o === void 0 || o.length === 0) return kp(!0);
  return kp(
    o.map((c) => {
      let a = ve(c, t),
        l = te(Pi(a) ? a.canLoad(r, e) : io$1(t, () => a(r, e)));
      return i ? l.pipe(Mn(i)) : l;
    }),
  ).pipe(pe(), _n(n));
}
function _n(t) {
  return wp(
    gh((r) => {
      if (typeof r != `boolean`) throw pt(t, r);
    }),
    ke$2((r) => r === !0),
  );
}
function Qi(t, r, e, n, i, o) {
  let s = r.canMatch;
  if (!s || s.length === 0) return kp(!0);
  return kp(
    s.map((a) => {
      let u = ve(a, t);
      return te(xi(u) ? u.canMatch(r, e, i) : io$1(t, () => u(r, e, i))).pipe(Mn(o));
    }),
  ).pipe(pe(), _n(n));
}
var $ = class t extends Error {
  segmentGroup;
  constructor(r) {
    (super(), (this.segmentGroup = r || null), Object.setPrototypeOf(this, t.prototype));
  }
};
var Oe = class t extends Error {
  urlTree;
  constructor(r) {
    (super(), (this.urlTree = r), Object.setPrototypeOf(this, t.prototype));
  }
};
function Ki(t) {
  throw new M$1(4e3, !1);
}
function Yi(t) {
  throw bn(!1, C.GuardRejected);
}
var Jt = class {
  urlSerializer;
  urlTree;
  constructor(r, e) {
    ((this.urlSerializer = r), (this.urlTree = e));
  }
  async lineralizeSegments(r, e) {
    let n = [],
      i = e.root;
    for (;;) {
      if (((n = n.concat(i.segments)), i.numberOfChildren === 0)) return n;
      if (i.numberOfChildren > 1 || !i.children[f]) throw Ki(`${r.redirectTo}`);
      i = i.children[f];
    }
  }
  async applyRedirectCommands(r, e, n, i, o) {
    let s = await Zi(e, i, o);
    if (s instanceof P) throw new Oe(s);
    let c = this.applyRedirectCreateUrlTree(s, this.urlSerializer.parse(s), r, n);
    if (s[0] === `/`) throw new Oe(c);
    return c;
  }
  applyRedirectCreateUrlTree(r, e, n, i) {
    return new P(
      this.createSegmentGroup(r, e.root, n, i),
      this.createQueryParams(e.queryParams, this.urlTree.queryParams),
      e.fragment,
    );
  }
  createQueryParams(r, e) {
    let n = {};
    return (
      Object.entries(r).forEach(([i, o]) => {
        if (typeof o == `string` && o[0] === `:`) {
          let c = o.substring(1);
          n[i] = e[c];
        } else n[i] = o;
      }),
      n
    );
  }
  createSegmentGroup(r, e, n, i) {
    let o = this.createSegments(r, e.segments, n, i),
      s = Object.create(null);
    return (
      Object.entries(e.children).forEach(([c, a]) => {
        s[c] = this.createSegmentGroup(r, a, n, i);
      }),
      new m(o, s)
    );
  }
  createSegments(r, e, n, i) {
    return e.map((o) => (o.path[0] === `:` ? this.findPosParam(r, o, i) : this.findOrReturn(o, n)));
  }
  findPosParam(r, e, n) {
    let i = n[e.path.substring(1)];
    if (!i) throw new M$1(4001, !1);
    return i;
  }
  findOrReturn(r, e) {
    let n = 0;
    for (let i of e) {
      if (i.path === r.path) return (e.splice(n), i);
      n++;
    }
    return r;
  }
};
function Zi(t, r, e) {
  if (typeof t == `string`) return Promise.resolve(t);
  let n = t;
  return Xe(te(io$1(e, () => n(r))));
}
function Ji(t, r) {
  return (t.providers && !t._injector && (t._injector = yf(t.providers, r, `Route: ${t.path}`)), t._injector ?? r);
}
function x(t) {
  return t.outlet || f;
}
function Xi(t, r) {
  let e = t.filter((n) => x(n) === r);
  return (e.push(...t.filter((n) => x(n) !== r)), e);
}
var Xt = { matched: !1, consumedSegments: [], remainingSegments: [], parameters: {}, positionalParamSegments: {} };
function Nn(t) {
  return {
    routeConfig: t.routeConfig,
    url: t.url,
    params: t.params,
    queryParams: t.queryParams,
    fragment: t.fragment,
    data: t.data,
    outlet: t.outlet,
    title: t.title,
    paramMap: t.paramMap,
    queryParamMap: t.queryParamMap,
  };
}
function eo(t, r, e, n, i, o, s) {
  let c = Dn(t, r, e);
  if (!c.matched) return kp(c);
  let a = Nn(o(c));
  return ((n = Ji(r, n)), Qi(n, r, e, i, a, s).pipe(ke$2((u) => (u === !0 ? c : l({}, Xt)))));
}
function Dn(t, r, e) {
  if (r.path === ``)
    return r.pathMatch === `full` && (t.hasChildren() || e.length > 0)
      ? l({}, Xt)
      : { matched: !0, consumedSegments: [], remainingSegments: e, parameters: {}, positionalParamSegments: {} };
  let i = (r.matcher || Xr)(e, t, r);
  if (!i) return l({}, Xt);
  let o = {};
  Object.entries(i.posParams ?? {}).forEach(([c, a]) => {
    o[c] = a.path;
  });
  let s = i.consumed.length > 0 ? l(l({}, o), i.consumed[i.consumed.length - 1].parameters) : o;
  return {
    matched: !0,
    consumedSegments: i.consumed,
    remainingSegments: e.slice(i.consumed.length),
    parameters: s,
    positionalParamSegments: i.posParams ?? {},
  };
}
function Yr(t, r, e, n, i) {
  return e.length > 0 && no(t, e, n, i)
    ? { segmentGroup: new m(r, ro(n, new m(e, t.children))), slicedSegments: [] }
    : e.length === 0 && io(t, e, n)
      ? { segmentGroup: new m(t.segments, to(t, e, n, t.children)), slicedSegments: e }
      : { segmentGroup: new m(t.segments, t.children), slicedSegments: e };
}
function to(t, r, e, n) {
  let i = {};
  for (let o of e)
    if (yt(t, r, o) && !n[x(o)]) {
      let s = new m([], {});
      i[x(o)] = s;
    }
  return l(l({}, n), i);
}
function ro(t, r) {
  let e = {};
  e[f] = r;
  for (let n of t)
    if (n.path === `` && x(n) !== f) {
      let i = new m([], {});
      e[x(n)] = i;
    }
  return e;
}
function no(t, r, e, n) {
  return e.some((i) => (!yt(t, r, i) || !(x(i) !== f) ? !1 : !(n !== void 0 && x(i) === n)));
}
function io(t, r, e) {
  return e.some((n) => yt(t, r, n));
}
function yt(t, r, e) {
  return (t.hasChildren() || r.length > 0) && e.pathMatch === `full` ? !1 : e.path === ``;
}
function oo(t, r, e) {
  return r.length === 0 && !t.children[e];
}
var er = class {};
async function so(t, r, e, n, i, o, s, c) {
  return new tr(t, r, e, n, i, s, o, c).recognize();
}
var ao = 31;
var tr = class {
  injector;
  configLoader;
  rootComponentType;
  config;
  urlTree;
  paramsInheritanceStrategy;
  urlSerializer;
  abortSignal;
  applyRedirects;
  absoluteRedirectCount = 0;
  allowRedirects = !0;
  constructor(r, e, n, i, o, s, c, a) {
    ((this.injector = r),
      (this.configLoader = e),
      (this.rootComponentType = n),
      (this.config = i),
      (this.urlTree = o),
      (this.paramsInheritanceStrategy = s),
      (this.urlSerializer = c),
      (this.abortSignal = a),
      (this.applyRedirects = new Jt(this.urlSerializer, this.urlTree)));
  }
  noMatchError(r) {
    return new M$1(4002, `'${r.segmentGroup}'`);
  }
  async recognize() {
    let r = Yr(this.urlTree.root, [], [], this.config).segmentGroup,
      { children: e, rootSnapshot: n } = await this.match(r),
      o = new De(``, new E(n, e)),
      s = hn(n, [], this.urlTree.queryParams, this.urlTree.fragment);
    return (
      (s.queryParams = this.urlTree.queryParams),
      (o.url = this.urlSerializer.serialize(s)),
      { state: o, tree: s }
    );
  }
  async match(r) {
    let e = new he(
      [],
      Object.freeze({}),
      Object.freeze(l({}, this.urlTree.queryParams)),
      this.urlTree.fragment,
      Object.freeze({}),
      f,
      this.rootComponentType,
      null,
      {},
      this.injector,
    );
    try {
      return { children: await this.processSegmentGroup(this.injector, this.config, r, f, e), rootSnapshot: e };
    } catch (n) {
      if (n instanceof Oe) return ((this.urlTree = n.urlTree), this.match(n.urlTree.root));
      throw n instanceof $ ? this.noMatchError(n) : n;
    }
  }
  async processSegmentGroup(r, e, n, i, o) {
    if (n.segments.length === 0 && n.hasChildren()) return this.processChildren(r, e, n, o);
    let s = await this.processSegment(r, e, n, n.segments, i, !0, o);
    return s instanceof E ? [s] : [];
  }
  async processChildren(r, e, n, i) {
    let o = [];
    for (let a of Object.keys(n.children)) a === `primary` ? o.unshift(a) : o.push(a);
    let s = [];
    for (let a of o) {
      let u = n.children[a],
        l = Xi(e, a),
        v = await this.processSegmentGroup(r, l, u, a, i);
      s.push(...v);
    }
    let c = Tn(s);
    return (co(c), c);
  }
  async processSegment(r, e, n, i, o, s, c) {
    for (let a of e)
      try {
        return await this.processSegmentAgainstRoute(a._injector ?? r, e, a, n, i, o, s, c);
      } catch (u) {
        if (u instanceof $ || An(u)) continue;
        throw u;
      }
    if (oo(n, i, o)) return new er();
    throw new $(n);
  }
  async processSegmentAgainstRoute(r, e, n, i, o, s, c, a) {
    if (x(n) !== s && (s === f || !yt(i, o, n))) throw new $(i);
    if (n.redirectTo === void 0) return this.matchSegmentAgainstRoute(r, i, n, o, s, a);
    if (this.allowRedirects && c) return this.expandSegmentAgainstRouteUsingRedirect(r, i, e, n, o, s, a);
    throw new $(i);
  }
  async expandSegmentAgainstRouteUsingRedirect(r, e, n, i, o, s, c) {
    let {
      matched: a,
      parameters: u,
      consumedSegments: l,
      positionalParamSegments: v,
      remainingSegments: p,
    } = Dn(e, i, o);
    if (!a) throw new $(e);
    typeof i.redirectTo == `string` &&
      i.redirectTo[0] === `/` &&
      (this.absoluteRedirectCount++, this.absoluteRedirectCount > ao && (this.allowRedirects = !1));
    let b = this.createSnapshot(r, i, o, u, c);
    if (this.abortSignal.aborted) throw new Error(this.abortSignal.reason);
    let U = await this.applyRedirects.applyRedirectCommands(l, i.redirectTo, v, Nn(b), r),
      W = await this.applyRedirects.lineralizeSegments(i, U);
    return this.processSegment(r, n, e, W.concat(p), s, !1, c);
  }
  createSnapshot(r, e, n, i, o) {
    let s = new he(
        n,
        i,
        Object.freeze(l({}, this.urlTree.queryParams)),
        this.urlTree.fragment,
        lo(e),
        x(e),
        e.component ?? e._loadedComponent ?? null,
        e,
        ho(e),
        r,
      ),
      c = nr(s, o, this.paramsInheritanceStrategy);
    return ((s.params = Object.freeze(c.params)), (s.data = Object.freeze(c.data)), s);
  }
  async matchSegmentAgainstRoute(r, e, n, i, o, s) {
    if (this.abortSignal.aborted) throw new Error(this.abortSignal.reason);
    let c = (Q) => this.createSnapshot(r, n, Q.consumedSegments, Q.parameters, s),
      a = await Xe(eo(e, n, i, r, this.urlSerializer, c, this.abortSignal));
    if ((n.path === `**` && (e.children = {}), !a?.matched)) throw new $(e);
    r = n._injector ?? r;
    let { routes: u } = await this.getChildConfig(r, n, i),
      l = n._loadedInjector ?? r,
      { parameters: v, consumedSegments: p, remainingSegments: b } = a,
      U = this.createSnapshot(r, n, p, v, s),
      { segmentGroup: W, slicedSegments: me } = Yr(e, p, b, u, o);
    if (me.length === 0 && W.hasChildren()) return new E(U, await this.processChildren(l, u, W, U));
    if (u.length === 0 && me.length === 0) return new E(U, []);
    let wt = x(n) === o,
      $e = await this.processSegment(l, u, W, me, wt ? f : o, !0, U);
    return new E(U, $e instanceof E ? [$e] : []);
  }
  async getChildConfig(r, e, n) {
    if (e.children) return { routes: e.children, injector: r };
    if (e.loadChildren) {
      if (e._loadedRoutes !== void 0) {
        let o = e._loadedNgModuleFactory;
        return (
          o && !e._loadedInjector && (e._loadedInjector = o.create(r).injector),
          { routes: e._loadedRoutes, injector: e._loadedInjector }
        );
      }
      if (this.abortSignal.aborted) throw new Error(this.abortSignal.reason);
      if (await Xe(Wi(r, e, n, this.urlSerializer, this.abortSignal))) {
        let o = await this.configLoader.loadChildren(r, e);
        return (
          (e._loadedRoutes = o.routes),
          (e._loadedInjector = o.injector),
          (e._loadedNgModuleFactory = o.factory),
          o
        );
      }
      throw Yi(e);
    }
    return { routes: [], injector: r };
  }
};
function co(t) {
  t.sort((r, e) =>
    r.value.outlet === f ? -1 : e.value.outlet === f ? 1 : r.value.outlet.localeCompare(e.value.outlet),
  );
}
function uo(t) {
  let r = t.value.routeConfig;
  return r && r.path === ``;
}
function Tn(t) {
  let r = [],
    e = new Set();
  for (let n of t) {
    if (!uo(n)) {
      r.push(n);
      continue;
    }
    let i = r.find((o) => n.value.routeConfig === o.value.routeConfig);
    i !== void 0 ? (i.children.push(...n.children), e.add(i)) : r.push(n);
  }
  for (let n of e) {
    let i = Tn(n.children);
    r.push(new E(n.value, i));
  }
  return r.filter((n) => !e.has(n));
}
function lo(t) {
  return t.data || {};
}
function ho(t) {
  return t.resolve || {};
}
function fo(t, r, e, n, i, o, s) {
  return fe$2(async (c) => {
    let { state: a, tree: u } = await so(t, r, e, n, c.extractedUrl, i, o, s);
    return m$3(l({}, c), { targetSnapshot: a, urlAfterRedirects: u });
  });
}
function po(t) {
  return fe$2((r) => {
    let {
      targetSnapshot: e,
      guards: { canActivateChecks: n },
    } = r;
    if (!n.length) return kp(r);
    let i = new Set(n.map((c) => c.route)),
      o = new Set();
    for (let c of i) if (!o.has(c)) for (let a of On(c)) o.add(a);
    let s = 0;
    return Ee$2(o).pipe(
      nh((c) => (i.has(c) ? go(c, e, t) : ((c.data = nr(c, c.parent, t).resolve), kp(void 0)))),
      gh(() => s++),
      lh(1),
      fe$2((c) => (s === o.size ? kp(r) : ut$2)),
    );
  });
}
function On(t) {
  return [t, ...t.children.map((e) => On(e)).flat()];
}
function go(t, r, e) {
  let n = t.routeConfig,
    i = t._resolve;
  return (
    n?.title !== void 0 && !Sn(n) && (i[Pe] = n.title),
    Gp(
      () => (
        (t.data = nr(t, t.parent, e).resolve),
        vo(i, t, r).pipe(ke$2((o) => ((t._resolvedData = o), (t.data = l(l({}, t.data), o)), null)))
      ),
    )
  );
}
function vo(t, r, e) {
  let n = qt(t);
  if (n.length === 0) return kp({});
  let i = {};
  return Ee$2(n).pipe(
    fe$2((o) =>
      mo(t[o], r, e).pipe(
        ch(),
        gh((s) => {
          if (s instanceof fe) throw pt(new V(), s);
          i[o] = s;
        }),
      ),
    ),
    lh(1),
    ke$2(() => i),
    Fc((o) => (An(o) ? ut$2 : Lp(o))),
  );
}
function mo(t, r, e) {
  let n = r._environmentInjector,
    i = ve(t, n);
  return te(i.resolve ? i.resolve(r, e) : io$1(n, () => i(r, e)));
}
var Pn = new A$1(``);
function rr(t) {
  return ph((r) => {
    let e = t(r);
    return e ? Ee$2(e).pipe(ke$2(() => r)) : kp(r);
  });
}
var ar = (() => {
  class t {
    buildTitle(e) {
      let n,
        i = e.root;
      for (; i !== void 0;) ((n = this.getResolvedTitleForRoute(i) ?? n), (i = i.children.find((o) => o.outlet === f)));
      return n;
    }
    getResolvedTitleForRoute(e) {
      return e.data[Pe];
    }
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: () => w(Un) });
  }
  return t;
})();
var Un = (() => {
  class t extends ar {
    title;
    constructor(e) {
      (super(), (this.title = e));
    }
    updateTitle(e) {
      let n = this.buildTitle(e);
      n !== void 0 && this.title.setTitle(n);
    }
    static ɵfac = function (n) {
      return new (n || t)(De$2(fa));
    };
    static ɵprov = se$1({ token: t, factory: t.ɵfac, providedIn: `root` });
  }
  return t;
})();
var xe = new A$1(``, { factory: () => ({}) });
var ke = new A$1(``);
var Ln = (() => {
  class t {
    componentLoaders = new WeakMap();
    childrenLoaders = new WeakMap();
    onLoadStartListener;
    onLoadEndListener;
    compiler = w(yE);
    async loadComponent(e, n) {
      if (this.componentLoaders.get(n)) return this.componentLoaders.get(n);
      if (n._loadedComponent) return Promise.resolve(n._loadedComponent);
      this.onLoadStartListener && this.onLoadStartListener(n);
      let i = (async () => {
        try {
          let s = await xn(UL(await tn(io$1(e, () => n.loadComponent()))));
          return (this.onLoadEndListener && this.onLoadEndListener(n), (n._loadedComponent = s), s);
        } finally {
          this.componentLoaders.delete(n);
        }
      })();
      return (this.componentLoaders.set(n, i), i);
    }
    loadChildren(e, n) {
      if (this.childrenLoaders.get(n)) return this.childrenLoaders.get(n);
      if (n._loadedRoutes) return Promise.resolve({ routes: n._loadedRoutes, injector: n._loadedInjector });
      this.onLoadStartListener && this.onLoadStartListener(n);
      let i = (async () => {
        try {
          let o = await jn(n, this.compiler, e, this.onLoadEndListener);
          return (
            (n._loadedRoutes = o.routes),
            (n._loadedInjector = o.injector),
            (n._loadedNgModuleFactory = o.factory),
            o
          );
        } finally {
          this.childrenLoaders.delete(n);
        }
      })();
      return (this.childrenLoaders.set(n, i), i);
    }
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: t.ɵfac });
  }
  return t;
})();
async function jn(t, r, e, n) {
  let o = await xn(UL(await tn(io$1(e, () => t.loadChildren())))),
    s;
  (o instanceof mf || Array.isArray(o) ? (s = o) : (s = await r.compileModuleAsync(o)), n && n(t));
  let c, a, l;
  return (
    Array.isArray(s)
      ? (a = s)
      : ((c = s.create(e).injector), (l = s), (a = c.get(ke, [], { optional: !0, self: !0 }).flat())),
    { routes: a.map(sr), injector: c, factory: l }
  );
}
async function xn(t) {
  return t;
}
var Rt = (() => {
  class t {
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: () => w(yo) });
  }
  return t;
})();
var yo = (() => {
  class t {
    shouldProcessUrl(e) {
      return !0;
    }
    extract(e) {
      return e;
    }
    merge(e, n) {
      return e;
    }
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var kn = new A$1(``);
var Ro = () => {};
var $n = new A$1(``);
var Fn = (() => {
  class t {
    currentNavigation = Bl(null, { equal: () => !1 });
    currentTransition = null;
    lastSuccessfulNavigation = Bl(null);
    events = new Z$2();
    transitionAbortWithErrorSubject = new Z$2();
    configLoader = w(Ln);
    environmentInjector = w(ie$1);
    destroyRef = w(we$2);
    urlSerializer = w(Ue);
    rootContexts = w(ge);
    location = w(Xt$1);
    inputBindingEnabled = w(mt, { optional: !0 }) !== null;
    titleStrategy = w(ar);
    options = w(xe, { optional: !0 }) || {};
    paramsInheritanceStrategy = this.options.paramsInheritanceStrategy || bi;
    urlHandlingStrategy = w(Rt);
    createViewTransition = w(kn, { optional: !0 });
    navigationErrorHandler = w($n, { optional: !0 });
    routerResourcesFeature = w(Pn, { optional: !0 });
    navigationId = 0;
    get hasRequestedNavigation() {
      return this.navigationId !== 0;
    }
    transitions;
    afterPreactivation = () => kp(void 0);
    rootComponentType = null;
    destroyed = !1;
    constructor() {
      let e = (i) => this.events.next(new st(i)),
        n = (i) => this.events.next(new at(i));
      ((this.configLoader.onLoadEndListener = n),
        (this.configLoader.onLoadStartListener = e),
        this.destroyRef.onDestroy(() => {
          this.destroyed = !0;
        }));
    }
    complete() {
      this.transitions?.complete();
    }
    handleNavigationRequest(e) {
      let n = ++this.navigationId;
      EE(() => {
        this.transitions?.next(
          m$3(l({}, e), {
            extractedUrl: this.urlHandlingStrategy.extract(e.rawUrl),
            targetSnapshot: null,
            targetRouterState: null,
            guards: { canActivateChecks: [], canDeactivateChecks: [] },
            guardsResult: null,
            id: n,
            routesRecognizeHandler: {},
            beforeActivateHandler: {},
          }),
        );
      });
    }
    setupNavigations(e) {
      return (
        (this.transitions = new vn$1(null)),
        this.transitions.pipe(
          qt$2((n) => n !== null),
          ph((n) => {
            let i = !0,
              o = !1,
              s = new AbortController(),
              c = () => !o && this.currentTransition?.id === n.id;
            return kp(n).pipe(
              ph((a) => {
                if (this.navigationId > n.id)
                  return (this.cancelNavigationTransition(n, ``, C.SupersededByNewNavigation), ut$2);
                this.currentTransition = n;
                let u = this.lastSuccessfulNavigation();
                this.currentNavigation.set({
                  id: a.id,
                  initialUrl: a.rawUrl,
                  extractedUrl: a.extractedUrl,
                  targetBrowserUrl:
                    typeof a.extras.browserUrl == `string`
                      ? this.urlSerializer.parse(a.extras.browserUrl)
                      : a.extras.browserUrl,
                  trigger: a.source,
                  extras: a.extras,
                  previousNavigation: u ? m$3(l({}, u), { previousNavigation: null }) : null,
                  abort: () => s.abort(),
                  routesRecognizeHandler: a.routesRecognizeHandler,
                  beforeActivateHandler: a.beforeActivateHandler,
                });
                let l$1 = !e.navigated || this.isUpdatingInternalState() || this.isUpdatedBrowserUrl(),
                  v = a.extras.onSameUrlNavigation ?? e.onSameUrlNavigation;
                if (!l$1 && v !== `reload`)
                  return (
                    this.events.next(
                      new z(a.id, this.urlSerializer.serialize(a.rawUrl), ``, Ee.IgnoredSameUrlNavigation),
                    ),
                    a.resolve(!1),
                    ut$2
                  );
                if (this.urlHandlingStrategy.shouldProcessUrl(a.rawUrl))
                  return kp(a).pipe(
                    ph(
                      (p) => (
                        this.events.next(
                          new X(p.id, this.urlSerializer.serialize(p.extractedUrl), p.source, p.restoredState),
                        ),
                        p.id !== this.navigationId ? ut$2 : Promise.resolve(p)
                      ),
                    ),
                    fo(
                      this.environmentInjector,
                      this.configLoader,
                      this.rootComponentType,
                      e.config,
                      this.urlSerializer,
                      this.paramsInheritanceStrategy,
                      s.signal,
                    ),
                    gh((p) => {
                      ((n.targetSnapshot = p.targetSnapshot),
                        (n.urlAfterRedirects = p.urlAfterRedirects),
                        this.currentNavigation.update((b) => ((b.finalUrl = p.urlAfterRedirects), b)),
                        this.events.next(new _e()));
                    }),
                    ph((p) => Ee$2(n.routesRecognizeHandler.deferredHandle ?? kp(void 0)).pipe(ke$2(() => p))),
                    gh(() => {
                      let p = new Me(
                        a.id,
                        this.urlSerializer.serialize(a.extractedUrl),
                        this.urlSerializer.serialize(a.urlAfterRedirects),
                        a.targetSnapshot,
                      );
                      this.events.next(p);
                    }),
                  );
                if (l$1 && this.urlHandlingStrategy.shouldProcessUrl(a.currentRawUrl)) {
                  let { id: p, extractedUrl: b, source: U, restoredState: W, extras: me } = a,
                    wt = new X(p, this.urlSerializer.serialize(b), U, W);
                  this.events.next(wt);
                  let $e = yn(this.rootComponentType, this.environmentInjector).snapshot;
                  return (
                    (this.currentTransition = n =
                      m$3(l({}, a), {
                        targetSnapshot: $e,
                        urlAfterRedirects: b,
                        extras: m$3(l({}, me), { skipLocationChange: !1, replaceUrl: !1 }),
                      })),
                    this.currentNavigation.update((Q) => ((Q.finalUrl = b), Q)),
                    kp(n)
                  );
                } else
                  return (
                    this.events.next(
                      new z(a.id, this.urlSerializer.serialize(a.extractedUrl), ``, Ee.IgnoredByUrlHandlingStrategy),
                    ),
                    a.resolve(!1),
                    ut$2
                  );
              }),
              ke$2((a) => {
                let u = new rt(
                  a.id,
                  this.urlSerializer.serialize(a.extractedUrl),
                  this.urlSerializer.serialize(a.urlAfterRedirects),
                  a.targetSnapshot,
                );
                return (
                  this.events.next(u),
                  (this.currentTransition = n =
                    m$3(l({}, a), { guards: _i(a.targetSnapshot, a.currentSnapshot, this.rootContexts) })),
                  n
                );
              }),
              $i((a) => this.events.next(a)),
              ph((a) => {
                if (((n.guardsResult = a.guardsResult), a.guardsResult && typeof a.guardsResult != `boolean`))
                  throw pt(this.urlSerializer, a.guardsResult);
                let u = new nt(
                  a.id,
                  this.urlSerializer.serialize(a.extractedUrl),
                  this.urlSerializer.serialize(a.urlAfterRedirects),
                  a.targetSnapshot,
                  !!a.guardsResult,
                );
                if ((this.events.next(u), !c())) return ut$2;
                if (!a.guardsResult) return (this.cancelNavigationTransition(a, ``, C.GuardRejected), ut$2);
                if (a.guards.canActivateChecks.length === 0) return kp(a);
                let l = new it(
                  a.id,
                  this.urlSerializer.serialize(a.extractedUrl),
                  this.urlSerializer.serialize(a.urlAfterRedirects),
                  a.targetSnapshot,
                );
                if ((this.events.next(l), !c())) return ut$2;
                let v = !1;
                return kp(a).pipe(
                  po(this.paramsInheritanceStrategy),
                  gh({
                    next: () => {
                      v = !0;
                      let p = new ot(
                        a.id,
                        this.urlSerializer.serialize(a.extractedUrl),
                        this.urlSerializer.serialize(a.urlAfterRedirects),
                        a.targetSnapshot,
                      );
                      this.events.next(p);
                    },
                    complete: () => {
                      v || this.cancelNavigationTransition(a, ``, C.NoDataFromResolver);
                    },
                  }),
                );
              }),
              rr((a) => {
                let u = (v) => {
                    let p = [];
                    if (v.routeConfig?._loadedComponent) v.component = v.routeConfig?._loadedComponent;
                    else if (v.routeConfig?.loadComponent) {
                      let b = v._environmentInjector;
                      p.push(
                        this.configLoader.loadComponent(b, v.routeConfig).then((U) => {
                          v.component = U;
                        }),
                      );
                    }
                    for (let b of v.children) p.push(...u(b));
                    return p;
                  },
                  l = u(a.targetSnapshot.root);
                return l.length === 0 ? kp(a) : Ee$2(Promise.all(l).then(() => a));
              }),
              ph((a) => {
                let { newlyCreatedRoutes: u, state: l$2 } = Ii(
                  e.routeReuseStrategy,
                  a.targetSnapshot,
                  a.currentRouterState,
                );
                return (
                  (this.currentTransition = n = a = m$3(l({}, a), { targetRouterState: l$2, newlyCreatedRoutes: u })),
                  this.currentNavigation.update((v) => ((v.targetRouterState = l$2), v)),
                  kp(a)
                );
              }),
              this.routerResourcesFeature?.setupAndRunResources(s.signal) ?? ((a) => a),
              rr(() => this.afterPreactivation()),
              ph(() => {
                let { currentSnapshot: a, targetSnapshot: u } = n,
                  l = this.createViewTransition?.(this.environmentInjector, a.root, u.root);
                return l ? Ee$2(l).pipe(ke$2(() => n)) : kp(n);
              }),
              ft$2(1),
              ph((a) => {
                ((i = !1), this.events.next(new le()));
                let u = n.beforeActivateHandler.deferredHandle;
                return u ? Ee$2(u.then(() => a)) : kp(a);
              }),
              gh((a) => {
                (new Zt(
                  e.routeReuseStrategy,
                  n.targetRouterState,
                  n.currentRouterState,
                  (u) => this.events.next(u),
                  this.inputBindingEnabled,
                ).activate(this.rootContexts),
                  a.newlyCreatedRoutes?.clear(),
                  c() &&
                    (zn(a.targetRouterState),
                    (o = !0),
                    this.currentNavigation.update((u) => ((u.abort = Ro), u)),
                    this.lastSuccessfulNavigation.set(EE(this.currentNavigation)),
                    this.events.next(
                      new F(
                        a.id,
                        this.urlSerializer.serialize(a.extractedUrl),
                        this.urlSerializer.serialize(a.urlAfterRedirects),
                      ),
                    ),
                    this.titleStrategy?.updateTitle(a.targetRouterState.snapshot),
                    a.resolve(!0)));
              }),
              hh(
                En(s.signal).pipe(
                  qt$2(() => !o && i),
                  gh(() => {
                    this.cancelNavigationTransition(n, s.signal.reason + ``, C.Aborted);
                  }),
                ),
              ),
              gh({
                complete: () => {
                  o = !0;
                },
              }),
              hh(
                this.transitionAbortWithErrorSubject.pipe(
                  gh((a) => {
                    throw a;
                  }),
                ),
              ),
              ah(() => {
                (s.abort(),
                  o || this.cancelNavigationTransition(n, ``, C.SupersededByNewNavigation),
                  this.currentTransition?.id === n.id &&
                    (this.currentNavigation.set(null), (this.currentTransition = null)));
              }),
              Fc((a) => {
                if (((o = !0), Zr(n), this.destroyed)) return (n.resolve(!1), ut$2);
                if (In(a))
                  (this.events.next(
                    new O(n.id, this.urlSerializer.serialize(n.extractedUrl), a.message, a.cancellationCode),
                  ),
                    Mi(a) ? this.events.next(new de(a.url, a.navigationBehaviorOptions)) : n.resolve(!1));
                else {
                  let u = new ee(n.id, this.urlSerializer.serialize(n.extractedUrl), a, n.targetSnapshot ?? void 0);
                  try {
                    let l = io$1(this.environmentInjector, () => this.navigationErrorHandler?.(u));
                    if (l instanceof fe) {
                      let { message: v, cancellationCode: p } = pt(this.urlSerializer, l);
                      (this.events.next(new O(n.id, this.urlSerializer.serialize(n.extractedUrl), v, p)),
                        this.events.next(new de(l.redirectTo, l.navigationBehaviorOptions)));
                    } else throw (this.events.next(u), a);
                  } catch (l) {
                    this.options.resolveNavigationPromiseOnError ? n.resolve(!1) : n.reject(l);
                  }
                }
                return ut$2;
              }),
            );
          }),
        )
      );
    }
    cancelNavigationTransition(e, n, i) {
      Zr(e);
      let o = new O(e.id, this.urlSerializer.serialize(e.extractedUrl), n, i);
      (this.events.next(o), e.resolve(!1));
    }
    isUpdatingInternalState() {
      return this.currentTransition?.extractedUrl.toString() !== this.currentTransition?.currentUrlTree.toString();
    }
    isUpdatedBrowserUrl() {
      let e = this.urlHandlingStrategy.extract(this.urlSerializer.parse(this.location.path(!0))),
        n = EE(this.currentNavigation),
        i = n?.targetBrowserUrl ?? n?.extractedUrl;
      return e.toString() !== i?.toString() && !n?.extras.skipLocationChange;
    }
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function So(t) {
  return t !== be;
}
function Zr(t) {
  for (let r of t.newlyCreatedRoutes ?? []) (r._localInjector?.destroy(), (r._localInjector = void 0));
  zn(t.targetRouterState);
}
function zn(t) {
  if (!t) return;
  let r = (e) => {
    (e.value.pending?.set(!1), e.children.forEach(r));
  };
  r(t._root);
}
var qn = new A$1(``);
var Hn = (() => {
  class t {
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: () => w(Co) });
  }
  return t;
})();
var vt = class {
  shouldDetach(r) {
    return !1;
  }
  store(r, e) {}
  shouldAttach(r) {
    return !1;
  }
  retrieve(r) {
    return null;
  }
  shouldReuseRoute(r, e) {
    return r.routeConfig === e.routeConfig;
  }
  shouldDestroyInjector(r) {
    return !0;
  }
};
var Co = (() => {
  class t extends vt {
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var cr = (() => {
  class t {
    urlSerializer = w(Ue);
    options = w(xe, { optional: !0 }) || {};
    canceledNavigationResolution = this.options.canceledNavigationResolution || `replace`;
    location = w(Xt$1);
    urlHandlingStrategy = w(Rt);
    urlUpdateStrategy = this.options.urlUpdateStrategy || `deferred`;
    currentUrlTree = new P();
    getCurrentUrlTree() {
      return this.currentUrlTree;
    }
    rawUrlTree = this.currentUrlTree;
    getRawUrlTree() {
      return this.rawUrlTree;
    }
    createBrowserPath({ finalUrl: e, initialUrl: n, targetBrowserUrl: i }) {
      let o = e !== void 0 ? this.urlHandlingStrategy.merge(e, n) : n,
        s = i ?? o;
      return s instanceof P ? this.urlSerializer.serialize(s) : s;
    }
    routerUrlState(e) {
      return e?.targetBrowserUrl === void 0 || e?.finalUrl === void 0
        ? {}
        : { ɵrouterUrl: this.urlSerializer.serialize(e.finalUrl) };
    }
    commitTransition({ targetRouterState: e, finalUrl: n, initialUrl: i }) {
      n && e
        ? ((this.currentUrlTree = n), (this.rawUrlTree = this.urlHandlingStrategy.merge(n, i)), (this.routerState = e))
        : (this.rawUrlTree = i);
    }
    routerState = yn(null, w(ie$1));
    getRouterState() {
      return this.routerState;
    }
    _stateMemento = this.createStateMemento();
    get stateMemento() {
      return this._stateMemento;
    }
    updateStateMemento() {
      this._stateMemento = this.createStateMemento();
    }
    createStateMemento() {
      return { rawUrlTree: this.rawUrlTree, currentUrlTree: this.currentUrlTree, routerState: this.routerState };
    }
    restoredState() {
      return this.location.getState();
    }
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: () => w(wo) });
  }
  return t;
})();
var wo = (() => {
  class t extends cr {
    currentPageId = 0;
    lastSuccessfulId = -1;
    get browserPageId() {
      return this.canceledNavigationResolution !== `computed`
        ? this.currentPageId
        : (this.restoredState()?.ɵrouterPageId ?? this.currentPageId);
    }
    registerNonRouterCurrentEntryChangeListener(e) {
      return this.location.subscribe((n) => {
        n.type === `popstate` &&
          setTimeout(() => {
            e(n.url, n.state, `popstate`, { replaceUrl: !0 });
          });
      });
    }
    handleRouterEvent(e, n) {
      e instanceof X
        ? this.updateStateMemento()
        : e instanceof z
          ? this.commitTransition(n)
          : e instanceof Me
            ? this.urlUpdateStrategy === `eager` &&
              (n.extras.skipLocationChange || this.setBrowserUrl(this.createBrowserPath(n), n))
            : e instanceof le
              ? (this.commitTransition(n),
                this.urlUpdateStrategy === `deferred` &&
                  !n.extras.skipLocationChange &&
                  this.setBrowserUrl(this.createBrowserPath(n), n))
              : e instanceof O && !mn(e)
                ? this.restoreHistory(n)
                : e instanceof ee
                  ? this.restoreHistory(n, !0)
                  : e instanceof F && ((this.lastSuccessfulId = e.id), (this.currentPageId = this.browserPageId));
    }
    setBrowserUrl(e, n) {
      let { extras: i, id: o } = n,
        { replaceUrl: s, state: c } = i;
      if (this.location.isCurrentPathEqualTo(e) || s) {
        let a = this.browserPageId,
          u = l(l({}, c), this.generateNgRouterState(o, a, n));
        this.location.replaceState(e, ``, u);
      } else {
        let a = l(l({}, c), this.generateNgRouterState(o, this.browserPageId + 1, n));
        this.location.go(e, ``, a);
      }
    }
    restoreHistory(e, n = !1) {
      if (this.canceledNavigationResolution === `computed`) {
        let i = this.browserPageId,
          o = this.currentPageId - i;
        o !== 0
          ? this.location.historyGo(o)
          : this.getCurrentUrlTree() === e.finalUrl &&
            o === 0 &&
            (this.resetInternalState(e), this.resetUrlToCurrentUrlTree());
      } else
        this.canceledNavigationResolution === `replace` &&
          (n && this.resetInternalState(e), this.resetUrlToCurrentUrlTree());
    }
    resetInternalState({ finalUrl: e }) {
      ((this.routerState = this.stateMemento.routerState),
        (this.currentUrlTree = this.stateMemento.currentUrlTree),
        (this.rawUrlTree = this.urlHandlingStrategy.merge(this.currentUrlTree, e ?? this.rawUrlTree)));
    }
    resetUrlToCurrentUrlTree() {
      this.location.replaceState(
        this.urlSerializer.serialize(this.getRawUrlTree()),
        ``,
        this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId),
      );
    }
    generateNgRouterState(e, n, i) {
      return this.canceledNavigationResolution === `computed`
        ? l({ navigationId: e, ɵrouterPageId: n }, this.routerUrlState(i))
        : l({ navigationId: e }, this.routerUrlState(i));
    }
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function ur(t, r) {
  t.events
    .pipe(
      qt$2((e) => e instanceof F || e instanceof O || e instanceof ee || e instanceof z),
      ke$2((e) =>
        e instanceof F || e instanceof z
          ? 0
          : (e instanceof O ? e.code === C.Redirect || e.code === C.SupersededByNewNavigation : !1)
            ? 2
            : 1,
      ),
      qt$2((e) => e !== 2),
      ft$2(1),
    )
    .subscribe(() => {
      r();
    });
}
var St = (() => {
  class t {
    get currentUrlTree() {
      return this.stateManager.getCurrentUrlTree();
    }
    get rawUrlTree() {
      return this.stateManager.getRawUrlTree();
    }
    disposed = !1;
    nonRouterCurrentEntryChangeSubscription;
    console = w(rI);
    stateManager = w(cr);
    options = w(xe, { optional: !0 }) || {};
    pendingTasks = w(Mt);
    urlUpdateStrategy = this.options.urlUpdateStrategy || `deferred`;
    navigationTransitions = w(Fn);
    urlSerializer = w(Ue);
    location = w(Xt$1);
    urlHandlingStrategy = w(Rt);
    injector = w(ie$1);
    _events = new Z$2();
    get events() {
      return this._events;
    }
    get routerState() {
      return this.stateManager.getRouterState();
    }
    navigated = !1;
    routeReuseStrategy = w(Hn);
    injectorCleanup = w(qn, { optional: !0 });
    onSameUrlNavigation = this.options.onSameUrlNavigation || `ignore`;
    config = w(ke, { optional: !0 })?.flat() ?? [];
    componentInputBindingEnabled = !!w(mt, { optional: !0 });
    currentNavigation = this.navigationTransitions.currentNavigation.asReadonly();
    constructor() {
      (this.resetConfig(this.config),
        this.navigationTransitions.setupNavigations(this).subscribe({ error: (e) => {} }),
        this.subscribeToNavigationEvents());
    }
    eventsSubscription = new q();
    subscribeToNavigationEvents() {
      let e = this.navigationTransitions.events.subscribe((n) => {
        try {
          let i = this.navigationTransitions.currentTransition,
            o = EE(this.navigationTransitions.currentNavigation);
          if (i !== null && o !== null) {
            if (
              (this.stateManager.handleRouterEvent(n, o),
              n instanceof O && n.code !== C.Redirect && n.code !== C.SupersededByNewNavigation)
            )
              this.navigated = !0;
            else if (n instanceof F)
              ((this.navigated = !0), this.injectorCleanup?.(this.routeReuseStrategy, this.routerState, this.config));
            else if (n instanceof de) {
              let s = n.navigationBehaviorOptions,
                c = this.urlHandlingStrategy.merge(n.url, i.currentRawUrl),
                a = l(
                  {
                    scroll: i.extras.scroll,
                    browserUrl: i.extras.browserUrl,
                    info: i.extras.info,
                    skipLocationChange: i.extras.skipLocationChange,
                    replaceUrl: i.extras.replaceUrl || this.urlUpdateStrategy === `eager` || So(i.source),
                  },
                  s,
                );
              this.scheduleNavigation(c, be, null, a, { resolve: i.resolve, reject: i.reject, promise: i.promise });
            }
          }
          Ci(n) && this._events.next(n);
        } catch (i) {
          this.navigationTransitions.transitionAbortWithErrorSubject.next(i);
        }
      });
      this.eventsSubscription.add(e);
    }
    resetRootComponentType(e) {
      ((this.routerState.root.component = e), (this.navigationTransitions.rootComponentType = e));
    }
    initialNavigation() {
      (this.setUpLocationChangeListener(),
        this.navigationTransitions.hasRequestedNavigation ||
          this.navigateToSyncWithBrowser(this.location.path(!0), be, this.stateManager.restoredState(), {
            replaceUrl: !0,
          }));
    }
    setUpLocationChangeListener() {
      this.nonRouterCurrentEntryChangeSubscription ??= this.stateManager.registerNonRouterCurrentEntryChangeListener(
        (e, n, i, o) => {
          this.navigateToSyncWithBrowser(e, i, n, o);
        },
      );
    }
    navigateToSyncWithBrowser(e, n, i, o) {
      let s = i?.navigationId ? i : null,
        c = i?.ɵrouterUrl ?? e;
      if ((i?.ɵrouterUrl && (o = m$3(l({}, o), { browserUrl: e })), i)) {
        let u = l({}, i);
        (delete u.navigationId,
          delete u.ɵrouterPageId,
          delete u.ɵrouterUrl,
          Object.keys(u).length !== 0 && (o.state = u));
      }
      let a = this.parseUrl(c);
      this.scheduleNavigation(a, n, s, o).catch((u) => {
        this.disposed || this.injector.get(Je$2)(u);
      });
    }
    get url() {
      return this.serializeUrl(this.currentUrlTree);
    }
    getCurrentNavigation() {
      return EE(this.navigationTransitions.currentNavigation);
    }
    get lastSuccessfulNavigation() {
      return this.navigationTransitions.lastSuccessfulNavigation;
    }
    resetConfig(e) {
      ((this.config = e.map(sr)), (this.navigated = !1));
    }
    ngOnDestroy() {
      this.dispose();
    }
    dispose() {
      (this._events.unsubscribe(),
        this.navigationTransitions.complete(),
        this.nonRouterCurrentEntryChangeSubscription?.unsubscribe(),
        (this.nonRouterCurrentEntryChangeSubscription = void 0),
        (this.disposed = !0),
        this.eventsSubscription.unsubscribe());
    }
    createUrlTree(e, n = {}) {
      let { relativeTo: i, queryParams: o, fragment: s, queryParamsHandling: c, preserveFragment: a } = n,
        u = a ? this.currentUrlTree.fragment : s,
        l$3 = null;
      switch (c ?? this.options.defaultQueryParamsHandling) {
        case `merge`:
          l$3 = l(l({}, this.currentUrlTree.queryParams), o);
          break;
        case `preserve`:
          l$3 = this.currentUrlTree.queryParams;
          break;
        default:
          l$3 = o || null;
      }
      l$3 !== null && (l$3 = this.removeEmptyProps(l$3));
      let v;
      try {
        v = fn(i ? i.snapshot : this.routerState.snapshot.root);
      } catch {
        ((typeof e[0] != `string` || e[0][0] !== `/`) && (e = []), (v = this.currentUrlTree.root));
      }
      return pn(v, e, l$3, u ?? null, this.urlSerializer);
    }
    navigateByUrl(e, n = { skipLocationChange: !1 }) {
      let i = ue(e) ? e : this.parseUrl(e),
        o = this.urlHandlingStrategy.merge(i, this.rawUrlTree);
      return this.scheduleNavigation(o, be, null, n);
    }
    navigate(e, n = { skipLocationChange: !1 }) {
      return (bo(e), this.navigateByUrl(this.createUrlTree(e, n), n));
    }
    serializeUrl(e) {
      return this.urlSerializer.serialize(e);
    }
    parseUrl(e) {
      try {
        return this.urlSerializer.parse(e);
      } catch {
        return (this.console.warn(Bi$1(4018, !1)), this.urlSerializer.parse(`/`));
      }
    }
    isActive(e, n) {
      let i;
      if ((n === !0 ? (i = l({}, nn)) : n === !1 ? (i = l({}, Ht)) : (i = l(l({}, Ht), n)), ue(e)))
        return Vr(this.currentUrlTree, e, i);
      let o = this.parseUrl(e);
      return Vr(this.currentUrlTree, o, i);
    }
    removeEmptyProps(e) {
      return Object.entries(e).reduce((n, [i, o]) => (o != null && (n[i] = o), n), {});
    }
    scheduleNavigation(e, n, i, o, s) {
      if (this.disposed) return Promise.resolve(!1);
      let c, a, u;
      s
        ? ((c = s.resolve), (a = s.reject), (u = s.promise))
        : (u = new Promise((v, p) => {
            ((c = v), (a = p));
          }));
      let l = this.pendingTasks.add();
      return (
        ur(this, () => {
          queueMicrotask(() => this.pendingTasks.remove(l));
        }),
        this.navigationTransitions.handleNavigationRequest({
          source: n,
          restoredState: i,
          currentUrlTree: this.currentUrlTree,
          currentRawUrl: this.currentUrlTree,
          rawUrl: e,
          extras: o,
          resolve: c,
          reject: a,
          promise: u,
          currentSnapshot: this.routerState.snapshot,
          currentRouterState: this.routerState,
        }),
        u.catch(Promise.reject.bind(Promise))
      );
    }
    static ɵfac = function (n) {
      return new (n || t)();
    };
    static ɵprov = er$2({ token: t, factory: t.ɵfac });
  }
  return t;
})();
function bo(t) {
  for (let r = 0; r < t.length; r++) if (t[r] == null) throw new M$1(4008, !1);
}
var Eo = new A$1(``);
function lr(t, ...r) {
  return oo$1([
    { provide: ke, multi: !0, useValue: t },
    { provide: G, useFactory: Mo },
    { provide: Mf, multi: !0, useFactory: _o },
    r.map((e) => e.ɵproviders),
  ]);
}
function Mo() {
  return w(St).routerState.root;
}
function _o() {
  let t = w(Te$1);
  return (r) => {
    let e = t.get(oi$2);
    if (r !== e.components[0]) return;
    let n = t.get(St),
      i = t.get(No);
    (t.get(Do) === 1 && n.initialNavigation(),
      t.get(To, null, { optional: !0 })?.setUpPreloading(),
      t.get(Eo, null, { optional: !0 })?.init(),
      n.resetRootComponentType(e.componentTypes[0]),
      i.closed || (i.next(), i.complete(), i.unsubscribe()));
  };
}
var No = new A$1(``, { factory: () => new Z$2() });
var Do = new A$1(``, { factory: () => 1 });
var To = new A$1(``);
var Po = `@`;
var Uo = (() => {
  class t {
    doc;
    delegate;
    zone;
    animationType;
    moduleImpl;
    _rendererFactoryPromise = null;
    scheduler = null;
    injector = w(Te$1);
    loadingSchedulerFn = w(Lo, { optional: !0 });
    _engine;
    constructor(e, n, i, o, s) {
      ((this.doc = e), (this.delegate = n), (this.zone = i), (this.animationType = o), (this.moduleImpl = s));
    }
    ngOnDestroy() {
      this._engine?.flush();
    }
    loadImpl() {
      let e = () => this.moduleImpl ?? import(`./chunk-CR5OON0l.js`).then((i) => i),
        n;
      return (
        this.loadingSchedulerFn ? (n = this.loadingSchedulerFn(e)) : (n = e()),
        n
          .catch((i) => {
            throw new M$1(5300, !1);
          })
          .then(({ ɵcreateEngine: i, ɵAnimationRendererFactory: o }) => {
            this._engine = i(this.animationType, this.doc);
            let s = new o(this.delegate, this._engine, this.zone);
            return ((this.delegate = s), s);
          })
      );
    }
    createRenderer(e, n) {
      let i = this.delegate.createRenderer(e, n);
      if (i.ɵtype === 0) return i;
      typeof i.throwOnSyntheticProps == `boolean` && (i.throwOnSyntheticProps = !1);
      let o = new dr(i);
      return (
        n?.data?.animation && !this._rendererFactoryPromise && (this._rendererFactoryPromise = this.loadImpl()),
        this._rendererFactoryPromise
          ?.then((s) => {
            let c = s.createRenderer(e, n);
            (o.use(c),
              (this.scheduler ??= this.injector.get(be$1, null, { optional: !0 })),
              this.scheduler?.notify(10));
          })
          .catch((s) => {
            o.use(i);
          }),
        o
      );
    }
    begin() {
      this.delegate.begin?.();
    }
    end() {
      this.delegate.end?.();
    }
    whenRenderingDone() {
      return this.delegate.whenRenderingDone?.() ?? Promise.resolve();
    }
    componentReplaced(e) {
      (this._engine?.flush(), this.delegate.componentReplaced?.(e));
    }
    static ɵfac = function (n) {
      Jy();
    };
    static ɵprov = se$1({ token: t, factory: t.ɵfac });
  }
  return t;
})();
var dr = class {
  delegate;
  replay = [];
  ɵtype = 1;
  constructor(r) {
    this.delegate = r;
  }
  use(r) {
    if (((this.delegate = r), this.replay !== null)) {
      for (let e of this.replay) e(r);
      this.replay = null;
    }
  }
  get data() {
    return this.delegate.data;
  }
  destroy() {
    ((this.replay = null), this.delegate.destroy());
  }
  createElement(r, e) {
    return this.delegate.createElement(r, e);
  }
  createComment(r) {
    return this.delegate.createComment(r);
  }
  createText(r) {
    return this.delegate.createText(r);
  }
  get destroyNode() {
    return this.delegate.destroyNode;
  }
  appendChild(r, e) {
    this.delegate.appendChild(r, e);
  }
  insertBefore(r, e, n, i) {
    this.delegate.insertBefore(r, e, n, i);
  }
  removeChild(r, e, n, i) {
    this.delegate.removeChild(r, e, n, i);
  }
  selectRootElement(r, e) {
    return this.delegate.selectRootElement(r, e);
  }
  parentNode(r) {
    return this.delegate.parentNode(r);
  }
  nextSibling(r) {
    return this.delegate.nextSibling(r);
  }
  setAttribute(r, e, n, i) {
    this.delegate.setAttribute(r, e, n, i);
  }
  removeAttribute(r, e, n) {
    this.delegate.removeAttribute(r, e, n);
  }
  addClass(r, e) {
    this.delegate.addClass(r, e);
  }
  removeClass(r, e) {
    this.delegate.removeClass(r, e);
  }
  setStyle(r, e, n, i) {
    this.delegate.setStyle(r, e, n, i);
  }
  removeStyle(r, e, n) {
    this.delegate.removeStyle(r, e, n);
  }
  setProperty(r, e, n) {
    (this.shouldReplay(e) && this.replay.push((i) => i.setProperty(r, e, n)), this.delegate.setProperty(r, e, n));
  }
  setValue(r, e) {
    this.delegate.setValue(r, e);
  }
  listen(r, e, n, i) {
    return (this.shouldReplay(e) && this.replay.push((o) => o.listen(r, e, n, i)), this.delegate.listen(r, e, n, i));
  }
  shouldReplay(r) {
    return this.replay !== null && r.startsWith(Po);
  }
};
var Lo = new A$1(``);
function Bn(t = `animations`) {
  return (
    Rt$1(`NgAsyncAnimations`),
    oo$1([
      { provide: Yn$2, useFactory: () => new Uo(w(jn$2), w(ft$1), w(Ce$1), t) },
      { provide: Kh, useValue: t === `noop` ? `NoopAnimations` : `BrowserAnimations` },
    ])
  );
}
var Gn = {
  providers: [
    Qh(),
    lr([
      { path: ``, redirectTo: `game`, pathMatch: `full` },
      { path: `game`, loadComponent: () => import(`./chunk-CBq7aBd9.js`).then((t) => t.GameContainer) },
    ]),
    Bn(),
  ],
};
Ir(
  class t {
    appVisibility = w(kn$1);
    document = w(jn$2);
    visibilitychange() {
      this.appVisibility.VisibilityChanged.next(!this.document.hidden);
    }
    static ɵfac = function (e) {
      return new (e || t)();
    };
    static ɵcmp = Fv({
      type: t,
      selectors: [[`wgl-root`]],
      hostBindings: function (e, n) {
        e & 1 &&
          Pf(
            `visibilitychange`,
            function () {
              return n.visibilitychange();
            },
            wm,
          );
      },
      decls: 2,
      vars: 0,
      consts: [[1, `app-layout`]],
      template: function (e, n) {
        e & 1 && (Go$1(0, `div`, 0), Af(1, `router-outlet`), Qa());
      },
      dependencies: [Le],
      styles: [
        `.app-layout[_ngcontent-%COMP%]{height:100%;display:grid;grid-template-columns:0 1fr 0;overflow:hidden;will-change:transform;transform:translateZ(0);background-color:#000}@media screen and (min-width:600px){.app-layout[_ngcontent-%COMP%]{background-image:radial-gradient(ellipse at center,#0f0f0f40,#000000d1),url(/rikkle-backer.webp);background-size:cover;background-position:center;background-repeat:no-repeat;grid-template-columns:1fr 600px 1fr}}`,
      ],
    });
  },
  Gn,
)
  .then(() => {
    `serviceWorker` in navigator &&
      window.addEventListener(`load`, () => {
        navigator.serviceWorker.register(`/sw.js`).catch((t) => console.error(`ServiceWorker registration failed:`, t));
      });
  })
  .catch((t) => console.error(t));
export {
  Ul as $,
  qI as $t,
  Jh as A,
  fI as At,
  MI as B,
  ke$2 as Bt,
  GL as C,
  zl as Cn,
  dI as Ct,
  IE as D,
  n as Dn,
  eh as Dt,
  Hm as E,
  m$3 as En,
  eg as Et,
  Kr$2 as F,
  hh as Ft,
  Pg as G,
  lp as Gt,
  OI as H,
  kl as Ht,
  Le$2 as I,
  ie$1 as It,
  Qc as J,
  oi$2 as Jt,
  QL as K,
  mE as Kt,
  Lo$1 as L,
  jc as Lt,
  KL as M,
  ft$2 as Mt,
  Ka as N,
  gE as Nt,
  Il as O,
  ep as Ot,
  Kh as P,
  gh as Pt,
  Tf as Q,
  q as Qt,
  Lp as R,
  jf as Rt,
  Fv as S,
  zI as Sn,
  cI as St,
  Gp as T,
  l as Tn,
  dy as Tt,
  Of as U,
  kp as Ut,
  NI as V,
  kf as Vt,
  Pf as W,
  lI as Wt,
  Sf as X,
  pE as Xt,
  Rl as Y,
  os as Yt,
  Te$1 as Z,
  ph as Zt,
  Cf as _,
  xI as _n,
  aa as _t,
  fr as a,
  ri$2 as an,
  Wt$2 as at,
  Fc as b,
  yg as bn,
  bI as bt,
  li$1 as c,
  tr$2 as cn,
  Ya as ct,
  $v as d,
  uh as dn,
  Z$2 as dt,
  qf as en,
  Vf as et,
  A$1 as f,
  un$2 as fn,
  ZL as ft,
  Ce$1 as g,
  wi$1 as gn,
  aI as gt,
  Bl as h,
  we$2 as hn,
  _i$1 as ht,
  di$1 as i,
  rh as in,
  Wp as it,
  Jy as j,
  fh as jt,
  JL as k,
  er$2 as kt,
  ln$1 as l,
  uE as ln,
  Yh as lt,
  Af as m,
  w as mn,
  Zn$2 as mt,
  Go as n,
  qv as nn,
  WL as nt,
  hr as o,
  se$1 as on,
  Xf as ot,
  AI as p,
  vn$1 as pn,
  Za as pt,
  Qa as q,
  oh as qt,
  Xt$1 as r,
  rE as rn,
  Wf as rt,
  kn$1 as s,
  th as sn,
  YL as st,
  Dn$1 as t,
  qt$2 as tn,
  Vv as tt,
  pr as u,
  uI as un,
  Yn$2 as ut,
  De$2 as v,
  xf as vn,
  ah as vt,
  Go$1 as w,
  zp as wn,
  dh as wt,
  Ff as x,
  yt$2 as xn,
  bf as xt,
  El as y,
  yI as yn,
  b as yt,
  M$1 as z,
  jn$2 as zt,
};
