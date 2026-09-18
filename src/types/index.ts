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
  quantity: number;
  category: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  number: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  carBrand: string;
  carModel: string;
  carYear: string;
  carPlate: string;
  vin?: string;
  items: WorkOrderItem[];
  discount: number;
  discountType: 'percent' | 'fixed';
  totalAmount: number;
  status: 'new' | 'in_progress' | 'completed' | 'cancelled';
  inspectionId?: string;
  acceptanceActId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface WorkOrderItem {
  id: string;
  type: 'work' | 'part';
  name: string;
  quantity: number;
  price: number;
  sparePartId?: string;
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
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface InspectionPhoto {
  id: string;
  data: string; // base64
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

export interface AppData {
  users: User[];
  spareParts: SparePart[];
  workOrders: WorkOrder[];
  inspections: Inspection[];
  acceptanceActs: AcceptanceAct[];
  currentUserId: string | null;
}
