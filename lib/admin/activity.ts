











import type { ActivityAction, ActivityEvent } from "./constants";
import { readStore, writeStore } from "./store";


export const ACTIVITY_MAX = 200;

export type ActivityInput = {
  action: ActivityAction;
  entity?: string;
  label?: string;
  username: string;
  ip?: string;
};


export function makeActivityEvent(input: ActivityInput): ActivityEvent {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    username: input.username,
    action: input.action,
    entity: input.entity,
    label: input.label,
    ip: input.ip,
  };
}


export function appendActivityEvent(
  list: ActivityEvent[],
  event: ActivityEvent,
): ActivityEvent[] {
  const next = [...list, event];
  while (next.length > ACTIVITY_MAX) next.shift();
  return next;
}






export async function appendActivity(input: ActivityInput): Promise<void> {
  try {
    const store = await readStore();
    await writeStore({
      ...store,
      activity: appendActivityEvent(store.activity ?? [], makeActivityEvent(input)),
    });
  } catch (err) {
    console.error("[admin] appendActivity échoué (non bloquant) :", err);
  }
}
