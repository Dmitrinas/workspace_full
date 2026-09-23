import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Стили
import './App.css';

// Типы
import { AppData, User, SparePart, WorkItem, WorkOrder, WorkOrderItem, Inspection, InspectionPhoto, AcceptanceAct, AcceptanceActItem, Client, ClientCar } from './types';

// Хуки
import { useLocalStorage } from './hooks/useLocalStorage';

// Компоненты
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import SparePartsPage from './pages/SparePartsPage';
import WorksCatalogPage from './pages/WorksCatalogPage';
import WorkOrdersPage from './pages/WorkOrdersPage';
import InspectionsPage from './pages/InspectionsPage';
import AcceptanceActsPage from './pages/AcceptanceActsPage';
import ClientsPage from './pages/ClientsPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';

// Модальные окна
import AddSparePartModal from './modals/AddSparePartModal';
import EditSparePartModal from './modals/EditSparePartModal';
import AddWorkItemModal from './modals/AddWorkItemModal';
import EditWorkItemModal from './modals/EditWorkItemModal';
import AddWorkOrderModal from './modals/AddWorkOrderModal';
import EditWorkOrderModal from './modals/EditWorkOrderModal';
import AddInspectionModal from './modals/AddInspectionModal';
import EditInspectionModal from './modals/EditInspectionModal';
import AddAcceptanceActModal from './modals/AddAcceptanceActModal';
import EditAcceptanceActModal from './modals/EditAcceptanceActModal';
import AddClientModal from './modals/AddClientModal';
import EditClientModal from './modals/EditClientModal';
import ViewWorkOrderModal from './modals/ViewWorkOrderModal';
import ViewInspectionModal from './modals/ViewInspectionModal';
import ViewAcceptanceActModal from './modals/ViewAcceptanceActModal';
import ViewClientModal from './modals/ViewClientModal';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [appData, setAppData] = useLocalStorage<AppData>('appData', {
    users: [
      { id: '1', name: 'Администратор', role: 'admin', email: 'admin@example.com' },
      { id: '2', name: 'Менеджер', role: 'manager', email: 'manager@example.com' }
    ],
    spareParts: [],
    workItems: [],
    workOrders: [],
    inspections: [],
    acceptanceActs: [],
    clients: [],
    currentUserId: null,
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Модальные состояния
  const [isAddSparePartModalOpen, setIsAddSparePartModalOpen] = useState(false);
  const [isEditSparePartModalOpen, setIsEditSparePartModalOpen] = useState(false);
  const [editingSparePart, setEditingSparePart] = useState<SparePart | null>(null);

  const [isAddWorkItemModalOpen, setIsAddWorkItemModalOpen] = useState(false);
  const [isEditWorkItemModalOpen, setIsEditWorkItemModalOpen] = useState(false);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);

  const [isAddWorkOrderModalOpen, setIsAddWorkOrderModalOpen] = useState(false);
  const [isEditWorkOrderModalOpen, setIsEditWorkOrderModalOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);

  const [isAddInspectionModalOpen, setIsAddInspectionModalOpen] = useState(false);
  const [isEditInspectionModalOpen, setIsEditInspectionModalOpen] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);

  const [isAddAcceptanceActModalOpen, setIsAddAcceptanceActModalOpen] = useState(false);
  const [isEditAcceptanceActModalOpen, setIsEditAcceptanceActModalOpen] = useState(false);
  const [editingAcceptanceAct, setEditingAcceptanceAct] = useState<AcceptanceAct | null>(null);

  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isViewWorkOrderModalOpen, setIsViewWorkOrderModalOpen] = useState(false);
  const [viewingWorkOrder, setViewingWorkOrder] = useState<WorkOrder | null>(null);

  const [isViewInspectionModalOpen, setIsViewInspectionModalOpen] = useState(false);
  const [viewingInspection, setViewingInspection] = useState<Inspection | null>(null);

  const [isViewAcceptanceActModalOpen, setIsViewAcceptanceActModalOpen] = useState(false);
  const [viewingAcceptanceAct, setViewingAcceptanceAct] = useState<AcceptanceAct | null>(null);

  const [isViewClientModalOpen, setIsViewClientModalOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  useEffect(() => {
    if (appData.currentUserId) {
      const user = appData.users.find(u => u.id === appData.currentUserId);
      if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
    }
  }, [appData]);

  const handleLogin = (userId: string) => {
    const user = appData.users.find(u => u.id === userId);
    if (user) {
      setAppData({ ...appData, currentUserId: userId });
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setAppData({ ...appData, currentUserId: null });
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // Функции для работы с запчастями
  const addSparePart = (sparePart: Omit<SparePart, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSparePart: SparePart = {
      ...sparePart,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAppData({
      ...appData,
      spareParts: [...appData.spareParts, newSparePart],
    });
  };

  const updateSparePart = (updatedSparePart: SparePart) => {
    setAppData({
      ...appData,
      spareParts: appData.spareParts.map(sp =>
        sp.id === updatedSparePart.id ? { ...updatedSparePart, updatedAt: new Date().toISOString() } : sp
      ),
    });
  };

  const deleteSparePart = (id: string) => {
    setAppData({
      ...appData,
      spareParts: appData.spareParts.filter(sp => sp.id !== id),
    });
  };

  // Функции для работы с работами
  const addWorkItem = (workItem: Omit<WorkItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkItem: WorkItem = {
      ...workItem,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAppData({
      ...appData,
      workItems: [...appData.workItems, newWorkItem],
    });
  };

  const updateWorkItem = (updatedWorkItem: WorkItem) => {
    setAppData({
      ...appData,
      workItems: appData.workItems.map(wi =>
        wi.id === updatedWorkItem.id ? { ...updatedWorkItem, updatedAt: new Date().toISOString() } : wi
      ),
    });
  };

  const deleteWorkItem = (id: string) => {
    setAppData({
      ...appData,
      workItems: appData.workItems.filter(wi => wi.id !== id),
    });
  };

  // Функции для работы с заказ-нарядами
  const addWorkOrder = (workOrder: Omit<WorkOrder, 'id' | 'number' | 'totalAmount' | 'status' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newWorkOrder: WorkOrder = {
      ...workOrder,
      id: Date.now().toString(),
      number: `WO-${Date.now()}`,
      totalAmount: 0,
      status: 'waiting_repair',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: appData.currentUserId || '',
      closedAt: undefined,
      isArchived: false,
      notes: workOrder.notes || '',
    };
    setAppData({
      ...appData,
      workOrders: [...appData.workOrders, newWorkOrder],
    });
  };

  const updateWorkOrder = (updatedWorkOrder: WorkOrder) => {
    setAppData({
      ...appData,
      workOrders: appData.workOrders.map(wo =>
        wo.id === updatedWorkOrder.id ? { ...updatedWorkOrder, updatedAt: new Date().toISOString() } : wo
      ),
    });
  };

  const deleteWorkOrder = (id: string) => {
    setAppData({
      ...appData,
      workOrders: appData.workOrders.filter(wo => wo.id !== id),
    });
  };

  // Функции для работы с осмотрами
  const addInspection = (inspection: Omit<Inspection, 'id' | 'status' | 'isArchived' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newInspection: Inspection = {
      ...inspection,
      id: Date.now().toString(),
      status: 'draft',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: appData.currentUserId || '',
    };
    setAppData({
      ...appData,
      inspections: [...appData.inspections, newInspection],
    });
  };

  const updateInspection = (updatedInspection: Inspection) => {
    setAppData({
      ...appData,
      inspections: appData.inspections.map(insp =>
        insp.id === updatedInspection.id ? { ...updatedInspection, updatedAt: new Date().toISOString() } : insp
      ),
    });
  };

  const deleteInspection = (id: string) => {
    setAppData({
      ...appData,
      inspections: appData.inspections.filter(insp => insp.id !== id),
    });
  };

  // Функции для работы с актами приёма-передачи
  const addAcceptanceAct = (acceptanceAct: Omit<AcceptanceAct, 'id' | 'totalAmount' | 'status' | 'isArchived' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    const newAcceptanceAct: AcceptanceAct = {
      ...acceptanceAct,
      id: Date.now().toString(),
      totalAmount: 0,
      status: 'draft',
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: appData.currentUserId || '',
    };
    setAppData({
      ...appData,
      acceptanceActs: [...appData.acceptanceActs, newAcceptanceAct],
    });
  };

  const updateAcceptanceAct = (updatedAcceptanceAct: AcceptanceAct) => {
    setAppData({
      ...appData,
      acceptanceActs: appData.acceptanceActs.map(aa =>
        aa.id === updatedAcceptanceAct.id ? { ...updatedAcceptanceAct, updatedAt: new Date().toISOString() } : aa
      ),
    });
  };

  const deleteAcceptanceAct = (id: string) => {
    setAppData({
      ...appData,
      acceptanceActs: appData.acceptanceActs.filter(aa => aa.id !== id),
    });
  };

  // Функции для работы с клиентами
  const addClient = (client: Omit<Client, 'id' | 'cars' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      cars: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAppData({
      ...appData,
      clients: [...appData.clients, newClient],
    });
  };

  const updateClient = (updatedClient: Client) => {
    setAppData({
      ...appData,
      clients: appData.clients.map(c =>
        c.id === updatedClient.id ? { ...updatedClient, updatedAt: new Date().toISOString() } : c
      ),
    });
  };

  const deleteClient = (id: string) => {
    setAppData({
      ...appData,
      clients: appData.clients.filter(c => c.id !== id),
    });
  };

  // Функция для получения данных по ID
  const getSparePartById = (id: string) => appData.spareParts.find(sp => sp.id === id);
  const getWorkItemById = (id: string) => appData.workItems.find(wi => wi.id === id);
  const getWorkOrderById = (id: string) => appData.workOrders.find(wo => wo.id === id);
  const getInspectionById = (id: string) => appData.inspections.find(i => i.id === id);
  const getAcceptanceActById = (id: string) => appData.acceptanceActs.find(aa => aa.id === id);
  const getClientById = (id: string) => appData.clients.find(c => c.id === id);

  // Функции для открытия модальных окон
  const openAddSparePartModal = () => setIsAddSparePartModalOpen(true);
  const closeAddSparePartModal = () => setIsAddSparePartModalOpen(false);

  const openEditSparePartModal = (sparePart: SparePart) => {
    setEditingSparePart(sparePart);
    setIsEditSparePartModalOpen(true);
  };
  const closeEditSparePartModal = () => {
    setIsEditSparePartModalOpen(false);
    setEditingSparePart(null);
  };

  const openAddWorkItemModal = () => setIsAddWorkItemModalOpen(true);
  const closeAddWorkItemModal = () => setIsAddWorkItemModalOpen(false);

  const openEditWorkItemModal = (workItem: WorkItem) => {
    setEditingWorkItem(workItem);
    setIsEditWorkItemModalOpen(true);
  };
  const closeEditWorkItemModal = () => {
    setIsEditWorkItemModalOpen(false);
    setEditingWorkItem(null);
  };

  const openAddWorkOrderModal = () => setIsAddWorkOrderModalOpen(true);
  const closeAddWorkOrderModal = () => setIsAddWorkOrderModalOpen(false);

  const openEditWorkOrderModal = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setIsEditWorkOrderModalOpen(true);
  };
  const closeEditWorkOrderModal = () => {
    setIsEditWorkOrderModalOpen(false);
    setEditingWorkOrder(null);
  };

  const openAddInspectionModal = () => setIsAddInspectionModalOpen(true);
  const closeAddInspectionModal = () => setIsAddInspectionModalOpen(false);

  const openEditInspectionModal = (inspection: Inspection) => {
    setEditingInspection(inspection);
    setIsEditInspectionModalOpen(true);
  };
  const closeEditInspectionModal = () => {
    setIsEditInspectionModalOpen(false);
    setEditingInspection(null);
  };

  const openAddAcceptanceActModal = () => setIsAddAcceptanceActModalOpen(true);
  const closeAddAcceptanceActModal = () => setIsAddAcceptanceActModalOpen(false);

  const openEditAcceptanceActModal = (acceptanceAct: AcceptanceAct) => {
    setEditingAcceptanceAct(acceptanceAct);
    setIsEditAcceptanceActModalOpen(true);
  };
  const closeEditAcceptanceActModal = () => {
    setIsEditAcceptanceActModalOpen(false);
    setEditingAcceptanceAct(null);
  };

  const openAddClientModal = () => setIsAddClientModalOpen(true);
  const closeAddClientModal = () => setIsAddClientModalOpen(false);

  const openEditClientModal = (client: Client) => {
    setEditingClient(client);
    setIsEditClientModalOpen(true);
  };
  const closeEditClientModal = () => {
    setIsEditClientModalOpen(false);
    setEditingClient(null);
  };

  const openViewWorkOrderModal = (workOrder: WorkOrder) => {
    setViewingWorkOrder(workOrder);
    setIsViewWorkOrderModalOpen(true);
  };
  const closeViewWorkOrderModal = () => {
    setIsViewWorkOrderModalOpen(false);
    setViewingWorkOrder(null);
  };

  const openViewInspectionModal = (inspection: Inspection) => {
    setViewingInspection(inspection);
    setIsViewInspectionModalOpen(true);
  };
  const closeViewInspectionModal = () => {
    setIsViewInspectionModalOpen(false);
    setViewingInspection(null);
  };

  const openViewAcceptanceActModal = (acceptanceAct: AcceptanceAct) => {
    setViewingAcceptanceAct(acceptanceAct);
    setIsViewAcceptanceActModalOpen(true);
  };
  const closeViewAcceptanceActModal = () => {
    setIsViewAcceptanceActModalOpen(false);
    setViewingAcceptanceAct(null);
  };

  const openViewClientModal = (client: Client) => {
    setViewingClient(client);
    setIsViewClientModalOpen(true);
  };
  const closeViewClientModal = () => {
    setIsViewClientModalOpen(false);
    setViewingClient(null);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} users={appData.users} />;
  }

  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Header currentUser={currentUser} onLogout={handleLogout} />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Dashboard data={appData} />} />
            <Route path="/spare-parts" element={
              <SparePartsPage
                spareParts={appData.spareParts}
                onAdd={openAddSparePartModal}
                onEdit={openEditSparePartModal}
                onDelete={deleteSparePart}
              />
            } />
            <Route path="/works-catalog" element={
              <WorksCatalogPage
                workItems={appData.workItems}
                onAdd={openAddWorkItemModal}
                onEdit={openEditWorkItemModal}
                onDelete={deleteWorkItem}
              />
            } />
            <Route path="/work-orders" element={
              <WorkOrdersPage
                workOrders={appData.workOrders}
                onAdd={openAddWorkOrderModal}
                onEdit={openEditWorkOrderModal}
                onDelete={deleteWorkOrder}
                onView={openViewWorkOrderModal}
                onInspection={(wo) => {
                  openAddInspectionModal();
                  // Для упрощения передаем данные заказ-наряда через контекст или глобальное состояние
                  // В реальном приложении лучше использовать более изящный способ передачи данных
                  setTimeout(() => {
                    const newInspection: Omit<Inspection, 'id' | 'status' | 'isArchived' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
                      workOrderId: wo.id,
                      date: new Date().toISOString(),
                      photos: [],
                      findings: '',
                      recommendations: '',
                      mileage: wo.mileage,
                      bodyCondition: '',
                      fuelLevel: 50,
                    };
                    addInspection(newInspection);
                  }, 100);
                }}
                onAcceptanceAct={(wo) => {
                  openAddAcceptanceActModal();
                  setTimeout(() => {
                    const newAcceptanceAct: Omit<AcceptanceAct, 'id' | 'totalAmount' | 'status' | 'isArchived' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
                      workOrderId: wo.id,
                      date: new Date().toISOString(),
                      clientName: wo.clientName,
                      carInfo: `${wo.carBrand} ${wo.carModel}`,
                      items: wo.items.map(item => ({
                        id: Date.now().toString() + item.id,
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                      })),
                      totalAmount: 0,
                      discount: 0,
                      discountType: 'percent',
                      notes: '',
                    };
                    addAcceptanceAct(newAcceptanceAct);
                  }, 100);
                }}
              />
            } />
            <Route path="/inspections" element={
              <InspectionsPage
                inspections={appData.inspections}
                onAdd={openAddInspectionModal}
                onEdit={openEditInspectionModal}
                onDelete={deleteInspection}
                onView={openViewInspectionModal}
              />
            } />
            <Route path="/acceptance-acts" element={
              <AcceptanceActsPage
                acceptanceActs={appData.acceptanceActs}
                onAdd={openAddAcceptanceActModal}
                onEdit={openEditAcceptanceActModal}
                onDelete={deleteAcceptanceAct}
                onView={openViewAcceptanceActModal}
              />
            } />
            <Route path="/clients" element={
              <ClientsPage
                clients={appData.clients}
                onAdd={openAddClientModal}
                onEdit={openEditClientModal}
                onDelete={deleteClient}
                onView={openViewClientModal}
              />
            } />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>

      {/* Модальные окна */}
      {isAddSparePartModalOpen && (
        <AddSparePartModal
          onClose={closeAddSparePartModal}
          onSave={addSparePart}
        />
      )}
      {isEditSparePartModalOpen && editingSparePart && (
        <EditSparePartModal
          sparePart={editingSparePart}
          onClose={closeEditSparePartModal}
          onSave={updateSparePart}
        />
      )}
      {isAddWorkItemModalOpen && (
        <AddWorkItemModal
          onClose={closeAddWorkItemModal}
          onSave={addWorkItem}
        />
      )}
      {isEditWorkItemModalOpen && editingWorkItem && (
        <EditWorkItemModal
          workItem={editingWorkItem}
          onClose={closeEditWorkItemModal}
          onSave={updateWorkItem}
        />
      )}
      {isAddWorkOrderModalOpen && (
        <AddWorkOrderModal
          onClose={closeAddWorkOrderModal}
          onSave={addWorkOrder}
          clients={appData.clients}
        />
      )}
      {isEditWorkOrderModalOpen && editingWorkOrder && (
        <EditWorkOrderModal
          workOrder={editingWorkOrder}
          onClose={closeEditWorkOrderModal}
          onSave={updateWorkOrder}
          clients={appData.clients}
        />
      )}
      {isAddInspectionModalOpen && (
        <AddInspectionModal
          onClose={closeAddInspectionModal}
          onSave={addInspection}
          workOrders={appData.workOrders}
        />
      )}
      {isEditInspectionModalOpen && editingInspection && (
        <EditInspectionModal
          inspection={editingInspection}
          onClose={closeEditInspectionModal}
          onSave={updateInspection}
          workOrders={appData.workOrders}
        />
      )}
      {isAddAcceptanceActModalOpen && (
        <AddAcceptanceActModal
          onClose={closeAddAcceptanceActModal}
          onSave={addAcceptanceAct}
          workOrders={appData.workOrders}
        />
      )}
      {isEditAcceptanceActModalOpen && editingAcceptanceAct && (
        <EditAcceptanceActModal
          acceptanceAct={editingAcceptanceAct}
          onClose={closeEditAcceptanceActModal}
          onSave={updateAcceptanceAct}
          workOrders={appData.workOrders}
        />
      )}
      {isAddClientModalOpen && (
        <AddClientModal
          onClose={closeAddClientModal}
          onSave={addClient}
        />
      )}
      {isEditClientModalOpen && editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={closeEditClientModal}
          onSave={updateClient}
        />
      )}
      {isViewWorkOrderModalOpen && viewingWorkOrder && (
        <ViewWorkOrderModal
          workOrder={viewingWorkOrder}
          onClose={closeViewWorkOrderModal}
          clients={appData.clients}
          spareParts={appData.spareParts}
          workItems={appData.workItems}
        />
      )}
      {isViewInspectionModalOpen && viewingInspection && (
        <ViewInspectionModal
          inspection={viewingInspection}
          onClose={closeViewInspectionModal}
          workOrders={appData.workOrders}
        />
      )}
      {isViewAcceptanceActModalOpen && viewingAcceptanceAct && (
        <ViewAcceptanceActModal
          acceptanceAct={viewingAcceptanceAct}
          onClose={closeViewAcceptanceActModal}
          workOrders={appData.workOrders}
        />
      )}
      {isViewClientModalOpen && viewingClient && (
        <ViewClientModal
          client={viewingClient}
          onClose={closeViewClientModal}
          workOrders={appData.workOrders}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <AppContent />
      </Router>
    </DndProvider>
  );
}

export default App;