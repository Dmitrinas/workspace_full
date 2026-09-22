export interface User {
  id: string;
  name: string;
  role: 'admin' | 'manager';
  email: string;
}

export interface SparePart {
  id: string;
  article: string;
  name: string;
  brand: string;
  price: number;
  purchasePrice: number;
  quantity: number;
  category: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkItem {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  carPlate: string;
  vin?: string;
  mileage: number;
  items: WorkOrderItem[];
  discount: number;
  discountType: 'percent' | 'fixed';
  totalAmount: number;
  status: 'waiting_repair' | 'in_progress' | 'approval' | 'waiting_parts' | 'completed' | 'closed';
  inspectionId?: string;
  acceptanceActId?: string;
  isArchived?: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  createdBy: string;
}

export interface WorkOrderItem {
  id: string;
  type: 'work' | 'part';
  name: string;
  quantity: number;
  price: number;
  sparePartId?: string;
  workItemId?: string;
}

export interface Inspection {
  id: string;
  workOrderId: string;
  date: string;
  photos: InspectionPhoto[];
  findings: string;
  recommendations: string;
  mileage: number;
  bodyCondition: string;
  fuelLevel: number;
  status: 'draft' | 'completed';
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface InspectionPhoto {
  id: string;
  imageData: string;
  description: string;
  timestamp: string;
}

export interface AcceptanceAct {
  id: string;
  workOrderId: string;
  date: string;
  clientName: string;
  carInfo: string;
  items: AcceptanceActItem[];
  totalAmount: number;
  discount: number;
  discountType: 'percent' | 'fixed';
  notes: string;
  status: 'draft' | 'signed';
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AcceptanceActItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  cars: ClientCar[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientCar {
  id: string;
  brand: string;
  model: string;
  year: string;
  plate: string;
  vin?: string;
  mileage: number;
}

export interface AppData {
  users: User[];
  spareParts: SparePart[];
  workItems: WorkItem[];
  workOrders: WorkOrder[];
  inspections: Inspection[];
  acceptanceActs: AcceptanceAct[];
  clients: Client[];
  currentUserId: string | null;
}
