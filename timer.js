module.exports = class Timer {
    #startTime = null;
    remainingTime = null;
    #timerId = null;
  
    start(duration) {
      this.#startTime = Date.now();
      this.remainingTime = this.#timerId ? this.remainingTime : duration;
  
      return new Promise((resolve) => {
        this.#timerId = setTimeout(() => {
          this.reset();
          resolve();
        }, this.remainingTime);
      });
    }
  
    pause() {
      clearTimeout(this.#timerId);
      this.remainingTime -= Date.now() - this.#startTime;
    }
  
    reset() {
      this.#startTime = null;
      this.remainingTime = null;
      this.#timerId = null;
    }
  }
  