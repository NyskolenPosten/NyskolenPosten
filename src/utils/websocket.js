class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  connect() {
    this.ws = new WebSocket('ws://localhost:3002');

    this.ws.onopen = () => {
      console.log('WebSocket tilkoblet');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const { type, data } = JSON.parse(event.data);
      const listeners = this.listeners.get(type) || [];
      listeners.forEach(listener => listener(data));
    };

    this.ws.onclose = () => {
      console.log('WebSocket frakoblet');
      this.reconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket feil:', error);
    };
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Prøver å koble til på nytt (forsøk ${this.reconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  subscribe(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  unsubscribe(type, callback) {
    if (this.listeners.has(type)) {
      const listeners = this.listeners.get(type);
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

export const websocketClient = new WebSocketClient(); 