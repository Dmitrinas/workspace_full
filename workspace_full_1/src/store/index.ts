import { AppData, SparePart, WorkItem, WorkOrder, Inspection, AcceptanceAct, Client } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'autoservice_data';
const CHANNEL_NAME = 'autoservice_sync';

const defaultData: AppData = {
  users: [
    { id: 'user-1', name: 'Администратор', role: 'admin', email: 'admin@auto.ru' },
    { id: 'user-2', name: 'Менеджер', role: 'manager', email: 'manager@auto.ru' },
  ],
  spareParts: [],
  workItems: [],
  workOrders: [],
  inspections: [],
  acceptanceActs: [],
  clients: [],
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

export function saveData(state: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

export function addSparePart(state: AppData, part: Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const newPart: SparePart = { ...part, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const updated = { ...state, spareParts: [...state.spareParts, newPart] };
  saveData(updated);
  return updated;
}

export function updateSparePart(state: AppData, id: string, updates: Partial<SparePart>): AppData {
  const updated = { ...state, spareParts: state.spareParts.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p) };
  saveData(updated);
  return updated;
}

export function deleteSparePart(state: AppData, id: string): AppData {
  const updated = { ...state, spareParts: state.spareParts.filter(p => p.id !== id) };
  saveData(updated);
  return updated;
}

export function importSpareParts(state: AppData, parts: Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>[]): AppData {
  const newParts = parts.map(p => ({ ...p, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  const updated = { ...state, spareParts: [...state.spareParts, ...newParts] };
  saveData(updated);
  return updated;
}

export function addWorkItem(state: AppData, item: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const newItem: WorkItem = { ...item, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const updated = { ...state, workItems: [...state.workItems, newItem] };
  saveData(updated);
  return updated;
}

export function updateWorkItem(state: AppData, id: string, updates: Partial<WorkItem>): AppData {
  const updated = { ...state, workItems: state.workItems.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i) };
  saveData(updated);
  return updated;
}

export function deleteWorkItem(state: AppData, id: string): AppData {
  const updated = { ...state, workItems: state.workItems.filter(i => i.id !== id) };
  saveData(updated);
  return updated;
}

export function addWorkOrder(state: AppData, order: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt' | 'number'>): AppData {
  const number = `WO-${String(state.workOrders.length + 1).padStart(4, '0')}`;
  const newOrder: WorkOrder = { ...order, id: uuidv4(), number, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const updated = { ...state, workOrders: [...state.workOrders, newOrder] };
  saveData(updated);
  return updated;
}

export function updateWorkOrder(state: AppData, id: string, updates: Partial<WorkOrder>): AppData {
  const updated = { ...state, workOrders: state.workOrders.map(o => o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o) };
  saveData(updated);
  return updated;
}

export function deleteWorkOrder(state: AppData, id: string): AppData {
  const updated = { ...state, workOrders: state.workOrders.filter(o => o.id !== id) };
  saveData(updated);
  return updated;
}

export function addInspection(state: AppData, inspection: Omit<Inspection, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const newInspection: Inspection = { ...inspection, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const updated = { ...state, inspections: [...state.inspections, newInspection] };
  saveData(updated);
  return updated;
}

export function updateInspection(state: AppData, id: string, updates: Partial<Inspection>): AppData {
  const updated = { ...state, inspections: state.inspections.map(i => i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i) };
  saveData(updated);
  return updated;
}

export function addAcceptanceAct(state: AppData, act: Omit<AcceptanceAct, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const newAct: AcceptanceAct = { ...act, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const updated = { ...state, acceptanceActs: [...state.acceptanceActs, newAct] };
  saveData(updated);
  return updated;
}

export function updateAcceptanceAct(state: AppData, id: string, updates: Partial<AcceptanceAct>): AppData {
  const updated = { ...state, acceptanceActs: state.acceptanceActs.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a) };
  saveData(updated);
  return updated;
}

export function addClient(state: AppData, client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const newClient: Client = { ...client, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const updated = { ...state, clients: [...state.clients, newClient] };
  saveData(updated);
  return updated;
}

export function updateClient(state: AppData, id: string, updates: Partial<Client>): AppData {
  const updated = { ...state, clients: state.clients.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c) };
  saveData(updated);
  return updated;
}

export function deleteClient(state: AppData, id: string): AppData {
  const updated = { ...state, clients: state.clients.filter(c => c.id !== id) };
  saveData(updated);
  return updated;
}

export function exportAllData(state: AppData): string {
  return JSON.stringify(state, null, 2);
}

export function importAllData(json: string): AppData | null {
  try {
    const parsed = JSON.parse(json);
    saveData(parsed);
    return parsed;
  } catch (e) {
    return null;
  }
}
