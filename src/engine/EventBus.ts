import type { EventMap } from "../types/Event.ts";

type Callback<K extends keyof EventMap> = (context: EventMap[K]) => EventMap[K];

export class EventBus {
  private listeners: { [K in keyof EventMap]?: Callback<K>[] } = {};

  public subscribe<K extends keyof EventMap>(event: K, callback: Callback<K>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(callback);
  }

  public emit<K extends keyof EventMap>(event: K, context: EventMap[K]) {
    const callbacks = this.listeners[event];
    if (!callbacks) return context;

    let currentContext = context;
    for (const callback of callbacks) {
      currentContext = callback(currentContext);
    }
    return currentContext;
  }
}
