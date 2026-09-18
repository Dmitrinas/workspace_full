import { AppData, User, SparePart, WorkOrder, Inspection, AcceptanceAct } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'autoservice_data';
const CHANNEL_NAME = 'autoservice_sync';

const defaultUsers: User[] = [
  { id: 'user-1', name: 'Администратор', role: 'admin', email: 'admin@auto.ru' },
  { id: 'user-2', name: 'Менеджер', role: 'manager', email: 'manager@auto.ru' },
];

const defaultData: AppData = {
  users: defaultUsers,
  spareParts: [],
  workOrders: [],
  inspections: [],
  acceptanceActs: [],
  currentUserId: null,
};

let channel: BroadcastChannel | null = null;
try {
  channel = new BroadcastChannel(CHANNEL_NAME);
} catch (e) {
  console.warn('BroadcastChannel not supported');
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultData, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load data', e);
  }
  return { ...defaultData };
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (channel) {
      channel.postMessage({ type: 'sync', timestamp: Date.now() });
    }
  } catch (e) {
    console.error('Failed to save data', e);
  }
}

export function onSync(callback: () => void): () => void {
  if (channel) {
    const handler = () => callback();
    channel.addEventListener('message', handler);
    return () => channel?.removeEventListener('message', handler);
  }
  return () => {};
}

// Spare Parts
export function addSparePart(data: AppData, part: Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const newPart: SparePart = {
    ...part,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = { ...data, spareParts: [...data.spareParts, newPart] };
  saveData(updated);
  return updated;
}

export function updateSparePart(data: AppData, id: string, updates: Partial<SparePart>): AppData {
  const updated = {
    ...data,
    spareParts: data.spareParts.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p),
  };
  saveData(updated);
  return updated;
}

export function deleteSparePart(data: AppData, id: string): AppData {
  const updated = { ...data, spareParts: data.spareParts.filter(p => p.id !== id) };
  saveData(updated);
  return updated;
}

export function importSpareParts(data: AppData, parts: Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>[]): AppData {
  const newParts: SparePart[] = parts.map(p => ({
    ...p,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const updated = { ...data, spareParts: [...data.spareParts, ...newParts] };
  saveData(updated);
  return updated;
}

// Work Orders
export function addWorkOrder(data: AppData, order: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt' | 'number'>): AppData {
  const number = `WO-${String(data.workOrders.length + 1).padStart(4, '0')}`;
  const newOrder: WorkOrder = {
    ...order,
    id: uuidv4(),
    number,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = { ...data, workOrders: [...data.workOrders, newOrder] };
  saveData(updated);
  return updated;
}

export function updateWorkOrder(data: AppData, id: string, updates: Partial<WorkOrder>): AppData {
  const updated = {
    ...data,
    workOrders: data.workOrders.map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o),
  };
  saveData(updated);
  return updated;
}

export function deleteWorkOrder(data: AppData, id: string): AppData {
  const updated = { ...data, workOrders: data.workOrders.filter(o => o.id !== id) };
  saveData(updated);
  return updated;
}

// Inspections
export function addInspection(data: AppData, inspection: Omit<Inspection, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const newInspection: Inspection = {
    ...inspection,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = { ...data, inspections: [...data.inspections, newInspection] };
  saveData(updated);
  return updated;
}

export function updateInspection(data: AppData, id: string, updates: Partial<Inspection>): AppData {
  const updated = {
    ...data,
    inspections: data.inspections.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i),
  };
  saveData(updated);
  return updated;
}

// Acceptance Acts
export function addAcceptanceAct(data: AppData, act: Omit<AcceptanceAct, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const newAct: AcceptanceAct = {
    ...act,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = { ...data, acceptanceActs: [...data.acceptanceActs, newAct] };
  saveData(updated);
  return updated;
}

export function updateAcceptanceAct(data: AppData, id: string, updates: Partial<AcceptanceAct>): AppData {
  const updated = {
    ...data,
    acceptanceActs: data.acceptanceActs.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a),
  };
  saveData(updated);
  return updated;
}

// Export/Import all data
export function exportAllData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importAllData(json: string): AppData | null {
  try {
    const parsed = JSON.parse(json);
    saveData(parsed);
    return parsed;
  } catch (e) {
    console.error('Failed to import data', e);
    return null;
  }
}
