/**
 * Lightweight Vedic Event Bus (mitt-style)
 */
class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, handler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter((h) => h !== handler);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((handler) => {
      try {
        handler(data);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }
}

export const eventBus = new EventBus();
export default eventBus;
