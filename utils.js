class Deferred {
  constructor() {
    this._promise = new Promise((resolve) => (this._resolve = resolve));
  }

  run() {
    this._resolve();
  }

  async wait() {
    return this._promise;
  }
}

class Timer {
  #startTime = null;
  remainingTime = null;
  #timerId = null;
  deffered = new Deferred();

  start(duration) {
    this.#startTime = Date.now();
    this.remainingTime = this.#timerId ? this.remainingTime : duration;

    this.#timerId = setTimeout(() => {
      this.deffered.run();
      this.reset();
    }, this.remainingTime);

    return this.deffered.wait();
  }

  pause() {
    clearTimeout(this.#timerId);
    this.remainingTime -= Date.now() - this.#startTime;
  }

  resume() {
    this.#timerId = setTimeout(() => {
      this.deffered.run();
      this.reset();
    }, this.remainingTime);
  }

  reset() {
    this.#startTime = null;
    this.remainingTime = null;
    this.#timerId = null;
    this.deffered = new Deferred();
  }
}

module.exports = {
  Timer: Timer,
  Deferred: Deferred,
};
