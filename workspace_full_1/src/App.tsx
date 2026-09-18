import { useState, useEffect } from 'react';
import { AppData, User, SparePart, WorkItem, WorkOrder, Inspection, AcceptanceAct, Client, ClientCar, WorkOrderItem, InspectionPhoto } from './types';
import { loadData, saveData, onSync, addSparePart, updateSparePart, deleteSparePart, importSpareParts, addWorkItem, updateWorkItem, deleteWorkItem, addWorkOrder, updateWorkOrder, deleteWorkOrder, addInspection, updateInspection, addAcceptanceAct, updateAcceptanceAct, addClient, updateClient, deleteClient, exportAllData, importAllData } from './store';
import { generateWorkOrderPDF, generateInspectionPDF, generateAcceptanceActPDF } from './utils/pdf';
import { FileText, Package, ClipboardList, Camera, Users, Download, Upload, Plus, Trash2, Edit, X, Check, Mail, Percent, Lock, Shield, Wrench, BarChart3, Menu, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

type Page = 'dashboard' | 'workorders' | 'catalog' | 'workscatalog' | 'inspections' | 'acts' | 'clients' | 'analytics';

export default function App() {
  const [appData, setAppData] = useState<AppData>(loadData());
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsub = onSync(() => setAppData(loadData()));
    return unsub;
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLogin(false);
    const updated = { ...appData, currentUserId: user.id };
    setAppData(updated);
    saveData(updated);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    setMobileMenuOpen(false);
  };

  if (showLogin || !currentUser) {
    return <LoginPage users={appData.users} onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="bg-stone-900 border-b border-stone-800">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-amber-600 flex items-center justify-center">
              <Wrench className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm lg:text-base font-semibold text-white tracking-wide uppercase">АвтоСервис</h1>
              <p className="text-[9px] lg:text-[10px] text-stone-400 uppercase tracking-wider hidden sm:block">Система управления</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs lg:text-sm text-stone-200 font-medium">{currentUser.name}</div>
              <div className="text-[10px] lg:text-[11px] text-stone-500 uppercase tracking-wide">{isAdmin ? 'Админ' : 'Менеджер'}</div>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-stone-400">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:block w-px h-8 bg-stone-700"></div>
            <button onClick={handleLogout} className="hidden lg:block text-xs text-stone-400 hover:text-stone-200 uppercase tracking-wide">Выход</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-800 p-4 space-y-1 bg-stone-900">
            <MobileNavItem icon={<ClipboardList className="w-4 h-4" />} label="Дашборд" onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }} />
            {isAdmin && <MobileNavItem icon={<FileText className="w-4 h-4" />} label="Заказ-наряды" onClick={() => { setCurrentPage('workorders'); setMobileMenuOpen(false); }} />}
            {isAdmin && <MobileNavItem icon={<Camera className="w-4 h-4" />} label="Осмотры" onClick={() => { setCurrentPage('inspections'); setMobileMenuOpen(false); }} />}
            {isAdmin && <MobileNavItem icon={<FileText className="w-4 h-4" />} label="Акты" onClick={() => { setCurrentPage('acts'); setMobileMenuOpen(false); }} />}
            <MobileNavItem icon={<Package className="w-4 h-4" />} label="Запчасти" onClick={() => { setCurrentPage('catalog'); setMobileMenuOpen(false); }} />
            <MobileNavItem icon={<Wrench className="w-4 h-4" />} label="Работы" onClick={() => { setCurrentPage('workscatalog'); setMobileMenuOpen(false); }} />
            <MobileNavItem icon={<Users className="w-4 h-4" />} label="Клиенты" onClick={() => { setCurrentPage('clients'); setMobileMenuOpen(false); }} />
            <MobileNavItem icon={<BarChart3 className="w-4 h-4" />} label="Аналитика" onClick={() => { setCurrentPage('analytics'); setMobileMenuOpen(false); }} />
            <div className="pt-2 border-t border-stone-700 mt-2 flex items-center justify-between">
              <span className="text-xs text-stone-400">{currentUser.name}</span>
              <button onClick={handleLogout} className="text-xs text-stone-500 hover:text-stone-300">Выйти</button>
            </div>
          </div>
        )}
      </header>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4 lg:py-6 flex flex-col lg:flex-row gap-4 lg:gap-6">
        <nav className="hidden lg:block w-60 shrink-0">
          <div className="bg-white border border-stone-200">
            <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Навигация</span>
            </div>
            <div className="p-2 space-y-0.5">
              <NavItem icon={<ClipboardList className="w-4 h-4" />} label="Дашборд" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
              <NavItem icon={<FileText className="w-4 h-4" />} label="Заказ-наряды" active={currentPage === 'workorders'} onClick={() => setCurrentPage('workorders')} disabled={!isAdmin} locked={!isAdmin} />
              <NavItem icon={<Camera className="w-4 h-4" />} label="Осмотры" active={currentPage === 'inspections'} onClick={() => setCurrentPage('inspections')} disabled={!isAdmin} locked={!isAdmin} />
              <NavItem icon={<FileText className="w-4 h-4" />} label="Акты" active={currentPage === 'acts'} onClick={() => setCurrentPage('acts')} disabled={!isAdmin} locked={!isAdmin} />
              <NavItem icon={<Package className="w-4 h-4" />} label="Запчасти" active={currentPage === 'catalog'} onClick={() => setCurrentPage('catalog')} />
              <NavItem icon={<Wrench className="w-4 h-4" />} label="Работы" active={currentPage === 'workscatalog'} onClick={() => setCurrentPage('workscatalog')} />
              <NavItem icon={<Users className="w-4 h-4" />} label="Клиенты" active={currentPage === 'clients'} onClick={() => setCurrentPage('clients')} />
              <NavItem icon={<BarChart3 className="w-4 h-4" />} label="Аналитика" active={currentPage === 'analytics'} onClick={() => setCurrentPage('analytics')} />
            </div>
          </div>
        </nav>

        <main className="flex-1 min-w-0">
          {currentPage === 'dashboard' && <DashboardPage appData={appData} setAppData={setAppData} isAdmin={isAdmin} setModal={setModal} />}
          {currentPage === 'workorders' && isAdmin && <WorkOrdersPage appData={appData} setAppData={setAppData} currentUser={currentUser} setModal={setModal} />}
          {currentPage === 'catalog' && <CatalogPage appData={appData} setAppData={setAppData} setModal={setModal} />}
          {currentPage === 'workscatalog' && <WorksCatalogPage appData={appData} setAppData={setAppData} setModal={setModal} />}
          {currentPage === 'inspections' && isAdmin && <InspectionsPage appData={appData} setAppData={setAppData} currentUser={currentUser} setModal={setModal} />}
          {currentPage === 'acts' && isAdmin && <ActsPage appData={appData} setAppData={setAppData} currentUser={currentUser} setModal={setModal} />}
          {currentPage === 'clients' && <ClientsPage appData={appData} setAppData={setAppData} setModal={setModal} />}
          {currentPage === 'analytics' && <AnalyticsPage appData={appData} />}
        </main>
      </div>

      {modal && <ModalRouter modal={modal} setModal={setModal} appData={appData} setAppData={setAppData} currentUser={currentUser} />}
    </div>
  );
}

function NavItem({ icon, label, active, onClick, disabled, locked }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; disabled?: boolean; locked?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${active ? 'bg-stone-900 text-white font-medium' : disabled ? 'text-stone-300 cursor-not-allowed' : 'text-stone-700 hover:bg-stone-100'}`}>
      {icon}<span className="uppercase tracking-wide flex-1 text-left">{label}</span>{locked && <Lock className="w-3 h-3 text-stone-400" />}
    </button>
  );
}

function MobileNavItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-stone-300 hover:bg-stone-800">
      {icon}<span className="uppercase tracking-wide">{label}</span>
    </button>
  );
}

function LoginPage({ users, onLogin }: { users: User[]; onLogin: (u: User) => void }) {
  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-amber-600 flex items-center justify-center"><Wrench className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-white uppercase tracking-wider">АвтоСервис</h1><p className="text-[10px] text-stone-500 uppercase tracking-widest">Система управления</p></div>
        </div>
        <div className="bg-stone-800 border border-stone-700 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-4 font-semibold">Выберите пользователя</p>
          <div className="space-y-2">
            {users.map(user => (
              <button key={user.id} onClick={() => onLogin(user)} className="w-full flex items-center gap-4 p-4 border border-stone-600 hover:bg-stone-700 hover:border-amber-600 transition-all group">
                <div className="w-10 h-10 bg-stone-700 border border-stone-600 flex items-center justify-center group-hover:border-amber-600"><Users className="w-4 h-4 text-stone-400 group-hover:text-amber-500" /></div>
                <div className="text-left"><div className="text-sm font-medium text-stone-200">{user.name}</div><div className="text-[11px] text-stone-500 uppercase tracking-wide">{user.role === 'admin' ? 'Администратор' : 'Менеджер'}</div></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = { new: 'bg-stone-100 text-stone-600 border-stone-200', in_progress: 'bg-amber-50 text-amber-700 border-amber-200', completed: 'bg-green-50 text-green-700 border-green-200', cancelled: 'bg-red-50 text-red-700 border-red-200' };
  const labels: Record<string, string> = { new: 'Новый', in_progress: 'В работе', completed: 'Завершен', cancelled: 'Отменен' };
  return <span className={`text-[10px] px-2 py-0.5 border uppercase tracking-wide ${config[status] || config.new}`}>{labels[status] || status}</span>;
}

function DashboardPage({ appData, setAppData, isAdmin, setModal }: { appData: AppData; setAppData: (d: AppData) => void; isAdmin: boolean; setModal: (m: any) => void }) {
  const stats = [
    { label: 'Заказ-наряды', value: appData.workOrders.length },
    { label: 'Клиенты', value: appData.clients.length },
    { label: 'Запчасти', value: appData.spareParts.length },
    { label: 'Работы', value: appData.workItems.length },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Обзор</h2>
        {isAdmin && <button onClick={() => setModal({ type: 'createWorkOrder' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800"><Plus className="w-3.5 h-3.5" /> Заказ-наряд</button>}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {stats.map(s => (<div key={s.label} className="bg-white border border-stone-200 p-4"><div className="text-2xl font-bold text-stone-900">{s.value}</div><div className="text-[11px] text-stone-500 uppercase tracking-wider mt-1">{s.label}</div></div>))}
      </div>
      <div className="bg-white border border-stone-200">
        <div className="px-5 py-3 border-b border-stone-200 bg-stone-50"><span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Последние заказ-наряды</span></div>
        <div className="p-4">
          {appData.workOrders.length === 0 ? <p className="text-xs text-stone-400 text-center py-6">Нет данных</p> : (
            <div className="space-y-2">{appData.workOrders.slice(-5).reverse().map((wo: WorkOrder) => (
              <div key={wo.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div><span className="text-xs font-semibold text-stone-800 font-mono">{wo.number}</span><span className="text-xs text-stone-500 ml-2">{wo.clientName}</span></div>
                <StatusBadge status={wo.status} />
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Work Orders Page
function WorkOrdersPage({ appData, setAppData, currentUser, setModal }: { appData: AppData; setAppData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  const [filter, setFilter] = useState('');
  const filtered = appData.workOrders.filter(wo => wo.clientName.toLowerCase().includes(filter.toLowerCase()) || wo.number.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Заказ-наряды</h2>
        <button onClick={() => setModal({ type: 'createWorkOrder' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800"><Plus className="w-3.5 h-3.5" /> Создать</button>
      </div>
      <input type="text" placeholder="Поиск..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full mb-4 px-4 py-2.5 border border-stone-300 bg-white text-sm focus:border-stone-500 focus:outline-none" />
      <div className="space-y-3">
        {filtered.map(wo => {
          const inspection = appData.inspections.find(i => i.workOrderId === wo.id);
          const act = appData.acceptanceActs.find(a => a.workOrderId === wo.id);
          const total = wo.items.reduce((s, i) => s + i.quantity * i.price, 0);
          const discountAmt = wo.discountType === 'percent' ? total * wo.discount / 100 : wo.discount;
          return (
            <div key={wo.id} className="bg-white border border-stone-200 p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                    <span className="font-bold text-stone-900 font-mono text-sm">{wo.number}</span>
                    <StatusBadge status={wo.status} />
                  </div>
                  <div className="text-sm text-stone-700 font-medium">{wo.clientName}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{wo.carBrand} {wo.carModel} • Пробег: {wo.mileage} км</div>
                </div>
                <div className="text-right"><div className="text-lg font-bold text-stone-900">{(total - discountAmt).toFixed(0)} ₽</div>{wo.discount > 0 && <div className="text-[10px] text-green-700 uppercase tracking-wide">Скидка {wo.discount}{wo.discountType === 'percent' ? '%' : '₽'}</div>}</div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100 flex-wrap">
                <button onClick={() => setModal({ type: 'editWorkOrder', data: wo })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide"><Edit className="w-3 h-3" /> Изменить</button>
                {!inspection && <button onClick={() => setModal({ type: 'confirmInspection', data: wo })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide"><Camera className="w-3 h-3" /> Осмотр</button>}
                {inspection && <span className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide"><Check className="w-3 h-3" /> Осмотр</span>}
                {!act && <button onClick={() => setModal({ type: 'confirmAct', data: wo })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide"><FileText className="w-3 h-3" /> Акт</button>}
                {act && <span className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide"><Check className="w-3 h-3" /> Акт</span>}
                <button onClick={async () => { const doc = await generateWorkOrderPDF(wo); doc.save(`${wo.number}.pdf`); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide"><Download className="w-3 h-3" /> PDF</button>
                <button onClick={() => { if (confirm('Удалить?')) setAppData(deleteWorkOrder(appData, wo.id)); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 uppercase tracking-wide ml-auto"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="bg-white border border-stone-200 p-12 text-center"><p className="text-xs text-stone-400 uppercase tracking-wider">Нет заказ-нарядов</p></div>}
      </div>
    </div>
  );
}

// Catalog Page
function CatalogPage({ appData, setAppData, setModal }: { appData: AppData; setAppData: (d: AppData) => void; setModal: (m: any) => void }) {
  const [filter, setFilter] = useState('');
  const filtered = appData.spareParts.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) || p.article.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Каталог запчастей</h2>
        <div className="flex gap-2">
          <button onClick={() => setModal({ type: 'importParts' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 text-stone-700 border border-stone-300 text-xs uppercase tracking-wider hover:bg-stone-200"><Upload className="w-3.5 h-3.5" /> Импорт</button>
          <button onClick={() => setModal({ type: 'createPart' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800"><Plus className="w-3.5 h-3.5" /> Добавить</button>
        </div>
      </div>
      <input type="text" placeholder="Поиск..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full mb-4 px-4 py-2.5 border border-stone-300 bg-white text-sm focus:border-stone-500 focus:outline-none" />
      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Артикул</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Название</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Бренд</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Цена</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Кол-во</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-900 font-mono text-xs">{p.article}</td>
                <td className="px-4 py-3 text-stone-800 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-stone-600">{p.brand}</td>
                <td className="px-4 py-3 text-right text-stone-900 font-medium">{p.price.toFixed(2)} ₽</td>
                <td className="px-4 py-3 text-right text-stone-900">{p.quantity}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setModal({ type: 'editPart', data: p })} className="p-1.5 text-stone-400 hover:text-stone-700"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (confirm('Удалить?')) setAppData(deleteSparePart(appData, p.id)); }} className="p-1.5 text-stone-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-12 text-center"><p className="text-xs text-stone-400 uppercase tracking-wider">Каталог пуст</p></div>}
      </div>
    </div>
  );
}

// Works Catalog Page
function WorksCatalogPage({ appData, setAppData, setModal }: { appData: AppData; setAppData: (d: AppData) => void; setModal: (m: any) => void }) {
  const [filter, setFilter] = useState('');
  const filtered = appData.workItems.filter(w => w.name.toLowerCase().includes(filter.toLowerCase()) || w.category.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Каталог работ</h2>
        <button onClick={() => setModal({ type: 'createWorkItem' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800"><Plus className="w-3.5 h-3.5" /> Добавить</button>
      </div>
      <input type="text" placeholder="Поиск..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full mb-4 px-4 py-2.5 border border-stone-300 bg-white text-sm focus:border-stone-500 focus:outline-none" />
      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Название</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Категория</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Цена</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Время (мин)</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(w => (
              <tr key={w.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-3 text-stone-800 font-medium">{w.name}</td>
                <td className="px-4 py-3 text-stone-600">{w.category}</td>
                <td className="px-4 py-3 text-right text-stone-900 font-medium">{w.price.toFixed(2)} ₽</td>
                <td className="px-4 py-3 text-right text-stone-600">{w.duration}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setModal({ type: 'editWorkItem', data: w })} className="p-1.5 text-stone-400 hover:text-stone-700"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (confirm('Удалить?')) setAppData(deleteWorkItem(appData, w.id)); }} className="p-1.5 text-stone-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="p-12 text-center"><p className="text-xs text-stone-400 uppercase tracking-wider">Каталог работ пуст</p></div>}
      </div>
    </div>
  );
}

// Inspections Page
function InspectionsPage({ appData, setAppData, currentUser, setModal }: { appData: AppData; setAppData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Осмотры</h2>
        <button onClick={() => setModal({ type: 'createInspection' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800"><Plus className="w-3.5 h-3.5" /> Создать</button>
      </div>
      <div className="space-y-3">
        {appData.inspections.map(insp => {
          const wo = appData.workOrders.find(w => w.id === insp.workOrderId);
          return (
            <div key={insp.id} className="bg-white border border-stone-200 p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-stone-900 text-sm mb-1">Осмотр от {new Date(insp.date).toLocaleDateString('ru-RU')}</div>
                  {wo && <div className="text-xs text-stone-600"><span className="font-mono font-semibold">{wo.number}</span> • {wo.clientName}</div>}
                  <div className="text-xs text-stone-500 mt-1">Пробег: {insp.mileage} км • Топливо: {insp.fuelLevel}% • Фото: {insp.photos.length}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModal({ type: 'editInspection', data: insp })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide"><Edit className="w-3 h-3" /> Изменить</button>
                  <button onClick={async () => { const doc = await generateInspectionPDF(insp, wo); doc.save(`Осмотр_${wo?.number || insp.id}.pdf`); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide"><Download className="w-3 h-3" /> PDF</button>
                </div>
              </div>
            </div>
          );
        })}
        {appData.inspections.length === 0 && <div className="bg-white border border-stone-200 p-12 text-center"><p className="text-xs text-stone-400 uppercase tracking-wider">Нет осмотров</p></div>}
      </div>
    </div>
  );
}

// Acts Page
function ActsPage({ appData, setAppData, currentUser, setModal }: { appData: AppData; setAppData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Акты приема-передачи</h2>
        <button onClick={() => setModal({ type: 'createAct' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800"><Plus className="w-3.5 h-3.5" /> Создать</button>
      </div>
      <div className="space-y-3">
        {appData.acceptanceActs.map(act => {
          const wo = appData.workOrders.find(w => w.id === act.workOrderId);
          return (
            <div key={act.id} className="bg-white border border-stone-200 p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-stone-900 text-sm mb-1">Акт от {new Date(act.date).toLocaleDateString('ru-RU')}</div>
                  {wo && <div className="text-xs text-stone-600"><span className="font-mono font-semibold">{wo.number}</span> • {act.clientName}</div>}
                  <div className="text-sm font-bold text-stone-900 mt-2">{act.totalAmount.toFixed(0)} ₽</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModal({ type: 'editAct', data: act })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide"><Edit className="w-3 h-3" /> Изменить</button>
                  <button onClick={async () => { const doc = await generateAcceptanceActPDF(act, wo); doc.save(`Акт_${wo?.number || act.id}.pdf`); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide"><Download className="w-3 h-3" /> PDF</button>
                </div>
              </div>
            </div>
          );
        })}
        {appData.acceptanceActs.length === 0 && <div className="bg-white border border-stone-200 p-12 text-center"><p className="text-xs text-stone-400 uppercase tracking-wider">Нет актов</p></div>}
      </div>
    </div>
  );
}

// Clients Page
function ClientsPage({ appData, setAppData, setModal }: { appData: AppData; setAppData: (d: AppData) => void; setModal: (m: any) => void }) {
  const [filter, setFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const filtered = appData.clients.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.phone.includes(filter));
  
  if (selectedClient) {
    const clientOrders = appData.workOrders.filter(wo => wo.clientId === selectedClient.id);
    const totalSpent = clientOrders.reduce((s, wo) => {
      const total = wo.items.reduce((si, i) => si + i.quantity * i.price, 0);
      const disc = wo.discountType === 'percent' ? total * wo.discount / 100 : wo.discount;
      return s + total - disc;
    }, 0);
    return (
      <div>
        <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-xs text-stone-600 hover:text-stone-900 mb-4 uppercase tracking-wide">← Назад к списку</button>
        <div className="bg-white border border-stone-200 p-5 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">{selectedClient.name}</h2>
              <p className="text-xs text-stone-500">{selectedClient.phone} • {selectedClient.email}</p>
            </div>
            <button onClick={() => setModal({ type: 'editClient', data: selectedClient })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide"><Edit className="w-3 h-3" /> Изменить</button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-stone-50 p-3"><div className="text-lg font-bold text-stone-900">{clientOrders.length}</div><div className="text-[10px] text-stone-500 uppercase tracking-wider">Заездов</div></div>
            <div className="bg-stone-50 p-3"><div className="text-lg font-bold text-stone-900">{totalSpent.toFixed(0)} ₽</div><div className="text-[10px] text-stone-500 uppercase tracking-wider">Всего потрачено</div></div>
            <div className="bg-stone-50 p-3"><div className="text-lg font-bold text-stone-900">{selectedClient.cars.length}</div><div className="text-[10px] text-stone-500 uppercase tracking-wider">Автомобилей</div></div>
            <div className="bg-stone-50 p-3"><div className="text-lg font-bold text-stone-900">{clientOrders.filter(o => o.status === 'completed').length}</div><div className="text-[10px] text-stone-500 uppercase tracking-wider">Завершённых</div></div>
          </div>
        </div>
        <div className="bg-white border border-stone-200 mb-4">
          <div className="px-5 py-3 border-b border-stone-200 bg-stone-50"><span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Автомобили</span></div>
          <div className="p-4 space-y-2">
            {selectedClient.cars.map(car => (
              <div key={car.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div><span className="text-sm font-medium text-stone-800">{car.brand} {car.model}</span><span className="text-xs text-stone-500 ml-2">({car.year})</span></div>
                <div className="text-xs text-stone-600">{car.plate} • {car.mileage} км</div>
              </div>
            ))}
            {selectedClient.cars.length === 0 && <p className="text-xs text-stone-400">Нет автомобилей</p>}
          </div>
        </div>
        <div className="bg-white border border-stone-200">
          <div className="px-5 py-3 border-b border-stone-200 bg-stone-50"><span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">История заказ-нарядов</span></div>
          <div className="p-4 space-y-2">
            {clientOrders.map(wo => (
              <div key={wo.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                <div><span className="text-xs font-mono font-semibold text-stone-800">{wo.number}</span><span className="text-xs text-stone-500 ml-2">{new Date(wo.createdAt).toLocaleDateString('ru-RU')}</span></div>
                <StatusBadge status={wo.status} />
              </div>
            ))}
            {clientOrders.length === 0 && <p className="text-xs text-stone-400">Нет заказ-нарядов</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Клиенты</h2>
        <button onClick={() => setModal({ type: 'createClient' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800"><Plus className="w-3.5 h-3.5" /> Добавить</button>
      </div>
      <input type="text" placeholder="Поиск по имени или телефону..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full mb-4 px-4 py-2.5 border border-stone-300 bg-white text-sm focus:border-stone-500 focus:outline-none" />
      <div className="space-y-2">
        {filtered.map(client => {
          const ordersCount = appData.workOrders.filter(wo => wo.clientId === client.id).length;
          return (
            <div key={client.id} onClick={() => setSelectedClient(client)} className="bg-white border border-stone-200 p-4 cursor-pointer hover:border-stone-400 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-stone-900">{client.name}</div>
                  <div className="text-xs text-stone-500">{client.phone} • {client.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-stone-900">{ordersCount}</div>
                  <div className="text-[10px] text-stone-500 uppercase tracking-wider">заездов</div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="bg-white border border-stone-200 p-12 text-center"><p className="text-xs text-stone-400 uppercase tracking-wider">Нет клиентов</p></div>}
      </div>
    </div>
  );
}

// Analytics Page
function AnalyticsPage({ appData }: { appData: AppData }) {
  const monthlyData = appData.workOrders.reduce((acc: any[], wo) => {
    const month = new Date(wo.createdAt).toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
    const total = wo.items.reduce((s, i) => s + i.quantity * i.price, 0);
    const disc = wo.discountType === 'percent' ? total * wo.discount / 100 : wo.discount;
    const existing = acc.find(a => a.month === month);
    if (existing) { existing.orders++; existing.revenue += total - disc; }
    else acc.push({ month, orders: 1, revenue: total - disc });
    return acc;
  }, []);

  const statusData = [
    { name: 'Новые', value: appData.workOrders.filter(w => w.status === 'new').length },
    { name: 'В работе', value: appData.workOrders.filter(w => w.status === 'in_progress').length },
    { name: 'Завершены', value: appData.workOrders.filter(w => w.status === 'completed').length },
    { name: 'Отменены', value: appData.workOrders.filter(w => w.status === 'cancelled').length },
  ].filter(d => d.value > 0);

  const COLORS = ['#292524', '#78716c', '#a8a29e', '#d6d3d1'];

  const totalRevenue = appData.workOrders.reduce((s, wo) => {
    const total = wo.items.reduce((si, i) => si + i.quantity * i.price, 0);
    const disc = wo.discountType === 'percent' ? total * wo.discount / 100 : wo.discount;
    return s + total - disc;
  }, 0);

  const avgCheck = appData.workOrders.length > 0 ? totalRevenue / appData.workOrders.length : 0;

  return (
    <div>
      <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide mb-6">Аналитика</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-white border border-stone-200 p-4"><div className="text-2xl font-bold text-stone-900">{totalRevenue.toFixed(0)} ₽</div><div className="text-[11px] text-stone-500 uppercase tracking-wider mt-1">Общая выручка</div></div>
        <div className="bg-white border border-stone-200 p-4"><div className="text-2xl font-bold text-stone-900">{avgCheck.toFixed(0)} ₽</div><div className="text-[11px] text-stone-500 uppercase tracking-wider mt-1">Средний чек</div></div>
        <div className="bg-white border border-stone-200 p-4"><div className="text-2xl font-bold text-stone-900">{appData.clients.length}</div><div className="text-[11px] text-stone-500 uppercase tracking-wider mt-1">Клиентов</div></div>
        <div className="bg-white border border-stone-200 p-4"><div className="text-2xl font-bold text-stone-900">{appData.workOrders.filter(w => w.status === 'completed').length}</div><div className="text-[11px] text-stone-500 uppercase tracking-wider mt-1">Завершённых</div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-stone-200 p-5">
          <h3 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-4">Выручка по месяцам</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#292524" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-stone-400 text-center py-12">Нет данных</p>}
        </div>
        <div className="bg-white border border-stone-200 p-5">
          <h3 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-4">Статусы заказ-нарядов</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-xs text-stone-400 text-center py-12">Нет данных</p>}
        </div>
      </div>
      <div className="bg-white border border-stone-200 p-5">
        <h3 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-4">Количество заказ-нарядов по месяцам</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#292524" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-xs text-stone-400 text-center py-12">Нет данных</p>}
      </div>
    </div>
  );
}

// Modal Router
function ModalRouter({ modal, setModal, appData, setAppData, currentUser }: { modal: any; setModal: (m: any) => void; appData: AppData; setAppData: (d: AppData) => void; currentUser: User }) {
  const close = () => setModal(null);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 lg:p-4" onClick={close}>
      <div className="bg-white border border-stone-300 w-full max-w-2xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {modal.type === 'createWorkOrder' && <WorkOrderForm appData={appData} setAppData={setAppData} currentUser={currentUser} onClose={close} />}
        {modal.type === 'editWorkOrder' && <WorkOrderForm appData={appData} setAppData={setAppData} currentUser={currentUser} onClose={close} order={modal.data} />}
        {modal.type === 'confirmInspection' && <ConfirmInspection appData={appData} setAppData={setAppData} currentUser={currentUser} onClose={close} order={modal.data} />}
        {modal.type === 'confirmAct' && <ConfirmAct appData={appData} setAppData={setAppData} currentUser={currentUser} onClose={close} order={modal.data} />}
        {modal.type === 'createPart' && <PartForm appData={appData} setAppData={setAppData} onClose={close} />}
        {modal.type === 'editPart' && <PartForm appData={appData} setAppData={setAppData} onClose={close} part={modal.data} />}
        {modal.type === 'importParts' && <ImportPartsForm appData={appData} setAppData={setAppData} onClose={close} />}
        {modal.type === 'createWorkItem' && <WorkItemForm appData={appData} setAppData={setAppData} onClose={close} />}
        {modal.type === 'editWorkItem' && <WorkItemForm appData={appData} setAppData={setAppData} onClose={close} workItem={modal.data} />}
        {modal.type === 'createInspection' && <InspectionForm appData={appData} setAppData={setAppData} currentUser={currentUser} onClose={close} />}
        {modal.type === 'editInspection' && <InspectionForm appData={appData} setAppData={setAppData} currentUser={currentUser} onClose={close} inspection={modal.data} />}
        {modal.type === 'createAct' && <ActForm appData={appData} setAppData={setAppData} currentUser={currentUser} onClose={close} />}
        {modal.type === 'editAct' && <ActForm appData={appData} setAppData={setAppData} currentUser={currentUser} onClose={close} act={modal.data} />}
        {modal.type === 'createClient' && <ClientForm appData={appData} setAppData={setAppData} onClose={close} />}
        {modal.type === 'editClient' && <ClientForm appData={appData} setAppData={setAppData} onClose={close} client={modal.data} />}
      </div>
    </div>
  );
}

// Work Order Form
function WorkOrderForm({ appData, setAppData, currentUser, onClose, order }: { appData: AppData; setAppData: (d: AppData) => void; currentUser: User; onClose: () => void; order?: WorkOrder }) {
  const [form, setForm] = useState({
    clientId: order?.clientId || '',
    clientName: order?.clientName || '',
    clientPhone: order?.clientPhone || '',
    clientEmail: order?.clientEmail || '',
    carBrand: order?.carBrand || '',
    carModel: order?.carModel || '',
    carYear: order?.carYear || '',
    carPlate: order?.carPlate || '',
    vin: order?.vin || '',
    mileage: order?.mileage || 0,
    items: order?.items || [] as WorkOrderItem[],
    discount: order?.discount || 0,
    discountType: order?.discountType || 'percent' as 'percent' | 'fixed',
    status: order?.status || 'new' as WorkOrder['status'],
    notes: order?.notes || '',
  });

  const selectClient = (clientId: string) => {
    const client = appData.clients.find(c => c.id === clientId);
    if (client && client.cars.length > 0) {
      const car = client.cars[0];
      setForm({ ...form, clientId, clientName: client.name, clientPhone: client.phone, clientEmail: client.email, carBrand: car.brand, carModel: car.model, carYear: car.year, carPlate: car.plate, vin: car.vin || '', mileage: car.mileage });
    } else if (client) {
      setForm({ ...form, clientId, clientName: client.name, clientPhone: client.phone, clientEmail: client.email });
    }
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { id: Date.now().toString(), type: 'work', name: '', quantity: 1, price: 0 }] });
  const updateItem = (idx: number, updates: Partial<WorkOrderItem>) => { const items = [...form.items]; items[idx] = { ...items[idx], ...updates }; setForm({ ...form, items }); };
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const addFromCatalog = (part: SparePart) => setForm({ ...form, items: [...form.items, { id: Date.now().toString(), type: 'part', name: `${part.name} (${part.article})`, quantity: 1, price: part.price, sparePartId: part.id }] });
  const addWorkFromCatalog = (work: WorkItem) => setForm({ ...form, items: [...form.items, { id: Date.now().toString(), type: 'work', name: work.name, quantity: 1, price: work.price, workItemId: work.id }] });

  const handleSubmit = () => {
    const totalAmount = form.items.reduce((s, i) => s + i.quantity * i.price, 0);
    if (order) setAppData(updateWorkOrder(appData, order.id, { ...form, totalAmount }));
    else setAppData(addWorkOrder(appData, { ...form, totalAmount, createdBy: currentUser.id }));
    onClose();
  };

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discountAmt = form.discountType === 'percent' ? subtotal * form.discount / 100 : form.discount;

  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{order ? 'Редактировать' : 'Создать'} заказ-наряд</h3>
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
      </div>
      
      {appData.clients.length > 0 && (
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Выбрать клиента</label>
          <select value={form.clientId} onChange={e => selectClient(e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none">
            <option value="">Вручную...</option>
            {appData.clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">ФИО клиента *</label><input type="text" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Телефон *</label><input type="text" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Email</label><input type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Пробег (км) *</label><input type="number" min="0" value={form.mileage} onChange={e => setForm({ ...form, mileage: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Марка *</label><input type="text" value={form.carBrand} onChange={e => setForm({ ...form, carBrand: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Модель *</label><input type="text" value={form.carModel} onChange={e => setForm({ ...form, carModel: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Год</label><input type="text" value={form.carYear} onChange={e => setForm({ ...form, carYear: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Гос. номер</label><input type="text" value={form.carPlate} onChange={e => setForm({ ...form, carPlate: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
      </div>

      <div className="border border-stone-200 p-4 mb-4 bg-stone-50">
        <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Percent className="w-3.5 h-3.5" /> Скидка</h4>
        <div className="flex items-center gap-3">
          <input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} className="w-24 px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
          <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} className="px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none">
            <option value="percent">%</option><option value="fixed">руб.</option>
          </select>
          {form.discount > 0 && <span className="text-xs text-green-700 font-medium">= −{discountAmt.toFixed(2)} ₽</span>}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Работы и запчасти</h4>
          <div className="flex gap-2 flex-wrap">
            {appData.workItems.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide"><Wrench className="w-3 h-3" /> Работы</button>
                <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-stone-300 shadow-lg hidden group-hover:block z-10 max-h-60 overflow-y-auto">
                  {appData.workItems.map(w => <button key={w.id} onClick={() => addWorkFromCatalog(w)} className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 border-b border-stone-100"><span className="font-medium">{w.name}</span> — <span className="font-semibold">{w.price}₽</span></button>)}
                </div>
              </div>
            )}
            {appData.spareParts.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide"><Package className="w-3 h-3" /> Запчасти</button>
                <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-stone-300 shadow-lg hidden group-hover:block z-10 max-h-60 overflow-y-auto">
                  {appData.spareParts.map(p => <button key={p.id} onClick={() => addFromCatalog(p)} className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 border-b border-stone-100"><span className="font-medium">{p.name}</span> <span className="text-stone-400 font-mono">({p.article})</span> — <span className="font-semibold">{p.price}₽</span></button>)}
                </div>
              </div>
            )}
            <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-900 text-white hover:bg-stone-800 uppercase tracking-wide"><Plus className="w-3 h-3" /> Вручную</button>
          </div>
        </div>
        <div className="space-y-2">
          {form.items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 border border-stone-200 p-2 bg-white flex-wrap">
              <select value={item.type} onChange={e => updateItem(idx, { type: e.target.value as any })} className="px-2 py-1 border border-stone-300 text-xs w-20 bg-white"><option value="work">Работа</option><option value="part">Запчасть</option></select>
              <input type="text" placeholder="Название" value={item.name} onChange={e => updateItem(idx, { name: e.target.value })} className="flex-1 min-w-[120px] px-2 py-1 border border-stone-300 text-xs focus:border-stone-500 focus:outline-none" />
              <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="w-14 px-2 py-1 border border-stone-300 text-xs text-center focus:border-stone-500 focus:outline-none" />
              <input type="number" min="0" value={item.price} onChange={e => updateItem(idx, { price: Number(e.target.value) })} className="w-20 px-2 py-1 border border-stone-300 text-xs text-right focus:border-stone-500 focus:outline-none" />
              <span className="text-xs text-stone-500 w-16 text-right font-medium">{(item.quantity * item.price).toFixed(0)}₽</span>
              <button onClick={() => removeItem(idx)} className="p-1 text-stone-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-stone-200 text-right text-sm">
          <span className="text-stone-500">Подитог: </span><span className="font-medium">{subtotal.toFixed(2)} ₽</span>
          {form.discount > 0 && <><span className="text-stone-500 ml-3">Скидка: </span><span className="text-green-700 font-medium">−{discountAmt.toFixed(2)} ₽</span></>}
          <span className="text-stone-500 ml-3">Итого: </span><span className="font-bold text-stone-900">{(subtotal - discountAmt).toFixed(2)} ₽</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide">Отмена</button>
        <button onClick={handleSubmit} disabled={!form.clientName || !form.carBrand} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wide disabled:opacity-50">Сохранить</button>
      </div>
    </div>
  );
}

function ConfirmInspection({ appData, setAppData, currentUser, onClose, order }: { appData: AppData; setAppData: (d: AppData) => void; currentUser: User; onClose: () => void; order: WorkOrder }) {
  const handleCreate = () => {
    const newInsp = addInspection(appData, { workOrderId: order.id, date: new Date().toISOString().split('T')[0], photos: [], findings: '', recommendations: '', mileage: order.mileage, bodyCondition: 'good', fuelLevel: 100, status: 'draft', createdBy: currentUser.id });
    const createdInsp = newInsp.inspections[newInsp.inspections.length - 1];
    if (createdInsp) updateWorkOrder(newInsp, order.id, { inspectionId: createdInsp.id });
    setAppData(newInsp);
    onClose();
  };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-200"><h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Создать осмотр</h3><button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button></div>
      <div className="border border-stone-200 p-4 mb-5 bg-stone-50"><p className="text-xs text-stone-700"><span className="font-mono font-bold">{order.number}</span></p><p className="text-xs text-stone-500 mt-1">{order.clientName} • {order.carBrand} {order.carModel}</p></div>
      <p className="text-xs text-stone-600 mb-6 leading-relaxed">Создать акт осмотра для данного заказ-наряда?</p>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide">Нет, позже</button>
        <button onClick={handleCreate} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wide">Создать</button>
      </div>
    </div>
  );
}

function ConfirmAct({ appData, setAppData, currentUser, onClose, order }: { appData: AppData; setAppData: (d: AppData) => void; currentUser: User; onClose: () => void; order: WorkOrder }) {
  const handleCreate = () => {
    const totalAmount = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
    const updated = addAcceptanceAct(appData, { workOrderId: order.id, date: new Date().toISOString().split('T')[0], clientName: order.clientName, carInfo: `${order.carBrand} ${order.carModel} (${order.carYear}) ${order.carPlate}`, items: order.items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })), totalAmount, discount: order.discount, discountType: order.discountType, notes: '', status: 'draft', createdBy: currentUser.id });
    setAppData(updated);
    onClose();
  };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-200"><h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Создать акт</h3><button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button></div>
      <div className="border border-stone-200 p-4 mb-5 bg-stone-50"><p className="text-xs text-stone-700"><span className="font-mono font-bold">{order.number}</span></p><p className="text-xs text-stone-500 mt-1">{order.clientName} • {order.carBrand} {order.carModel}</p></div>
      <p className="text-xs text-stone-600 mb-6 leading-relaxed">Создать акт приема-передачи?</p>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide">Нет, позже</button>
        <button onClick={handleCreate} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wide">Создать</button>
      </div>
    </div>
  );
}

function PartForm({ appData, setAppData, onClose, part }: { appData: AppData; setAppData: (d: AppData) => void; onClose: () => void; part?: SparePart }) {
  const [form, setForm] = useState({ article: part?.article || '', name: part?.name || '', brand: part?.brand || '', price: part?.price || 0, quantity: part?.quantity || 0, category: part?.category || '', supplier: part?.supplier || '' });
  const handleSubmit = () => { if (part) setAppData(updateSparePart(appData, part.id, form)); else setAppData(addSparePart(appData, form)); onClose(); };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200"><h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{part ? 'Редактировать' : 'Добавить'} запчасть</h3><button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Артикул *</label><input type="text" value={form.article} onChange={e => setForm({ ...form, article: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Название *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Бренд</label><input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Категория</label><input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Цена *</label><input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Количество</label><input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide">Отмена</button>
        <button onClick={handleSubmit} disabled={!form.article || !form.name} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wide disabled:opacity-50">Сохранить</button>
      </div>
    </div>
  );
}

function ImportPartsForm({ appData, setAppData, onClose }: { appData: AppData; setAppData: (d: AppData) => void; onClose: () => void }) {
  const [textData, setTextData] = useState('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const handleImport = () => {
    try {
      let parts: any[] = [];
      if (format === 'json') parts = JSON.parse(textData);
      else {
        const lines = textData.trim().split('\n');
        const headers = lines[0].split(/[;,]/).map(h => h.trim().toLowerCase());
        parts = lines.slice(1).map(line => {
          const vals = line.split(/[;,]/).map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
          return { article: obj['артикул'] || obj['article'] || '', name: obj['название'] || obj['name'] || '', brand: obj['бренд'] || obj['brand'] || '', price: parseFloat(obj['цена'] || obj['price'] || '0'), quantity: parseInt(obj['количество'] || obj['quantity'] || '0'), category: obj['категория'] || obj['category'] || '', supplier: obj['поставщик'] || obj['supplier'] || '' };
        }).filter(p => p.article && p.name);
      }
      if (parts.length > 0) { setAppData(importSpareParts(appData, parts)); onClose(); }
    } catch (e) { alert('Ошибка импорта'); }
  };
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setTextData(ev.target?.result as string); if (file.name.endsWith('.json')) setFormat('json'); else setFormat('csv'); };
    reader.readAsText(file);
  };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200"><h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Импорт запчастей</h3><button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button></div>
      <div className="mb-4"><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2 block">Загрузить файл</label><input type="file" accept=".csv,.json,.txt" onChange={handleFileImport} className="w-full text-xs" /></div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2"><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Формат:</label><select value={format} onChange={e => setFormat(e.target.value as any)} className="px-2 py-1 border border-stone-300 text-xs bg-white"><option value="csv">CSV</option><option value="json">JSON</option></select></div>
        <textarea value={textData} onChange={e => setTextData(e.target.value)} placeholder="артикул;название;бренд;цена;количество" className="w-full px-3 py-2 border border-stone-300 text-xs h-40 font-mono focus:border-stone-500 focus:outline-none resize-none" />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide">Отмена</button>
        <button onClick={handleImport} disabled={!textData} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wide disabled:opacity-50">Импортировать</button>
      </div>
    </div>
  );
}

function WorkItemForm({ appData, setAppData, onClose, workItem }: { appData: AppData; setAppData: (d: AppData) => void; onClose: () => void; workItem?: WorkItem }) {
  const [form, setForm] = useState({ name: workItem?.name || '', category: workItem?.category || '', price: workItem?.price || 0, duration: workItem?.duration || 30, description: workItem?.description || '' });
  const handleSubmit = () => { if (workItem) setAppData(updateWorkItem(appData, workItem.id, form)); else setAppData(addWorkItem(appData, form)); onClose(); };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200"><h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{workItem ? 'Редактировать' : 'Добавить'} работу</h3><button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div className="sm:col-span-2"><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Название *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Категория</label><input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Время (мин)</label><input type="number" min="0" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Цена *</label><input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide">Отмена</button>
        <button onClick={handleSubmit} disabled={!form.name} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wide disabled:opacity-50">Сохранить</button>
      </div>
    </div>
  );
}

function InspectionForm({ appData, setAppData, currentUser, onClose, inspection }: { appData: AppData; setAppData: (d: AppData) => void; currentUser: User; onClose: () => void; inspection?: Inspection }) {
  const [form, setForm] = useState({ workOrderId: inspection?.workOrderId || '', date: inspection?.date || new Date().toISOString().split('T')[0], photos: inspection?.photos || [] as InspectionPhoto[], findings: inspection?.findings || '', recommendations: inspection?.recommendations || '', mileage: inspection?.mileage || 0, bodyCondition: inspection?.bodyCondition || 'good', fuelLevel: inspection?.fuelLevel || 100, status: inspection?.status || 'draft' as Inspection['status'] });
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => { const newPhoto: InspectionPhoto = { id: Date.now().toString() + Math.random(), imageData: ev.target?.result as string, description: '', timestamp: new Date().toISOString() }; setForm(prev => ({ ...prev, photos: [...prev.photos, newPhoto] })); };
      reader.readAsDataURL(file);
    });
  };
  const removePhoto = (id: string) => setForm({ ...form, photos: form.photos.filter(p => p.id !== id) });
  const updatePhotoDesc = (id: string, desc: string) => setForm({ ...form, photos: form.photos.map(p => p.id === id ? { ...p, description: desc } : p) });
  const handleSubmit = () => { if (inspection) setAppData(updateInspection(appData, inspection.id, form)); else setAppData(addInspection(appData, { ...form, createdBy: currentUser.id })); onClose(); };
  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200"><h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{inspection ? 'Редактировать' : 'Создать'} осмотр</h3><button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Заказ-наряд</label><select value={form.workOrderId} onChange={e => setForm({ ...form, workOrderId: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none"><option value="">Выберите...</option>{appData.workOrders.map(wo => <option key={wo.id} value={wo.id}>{wo.number} — {wo.clientName}</option>)}</select></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Дата</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Пробег (км)</label><input type="number" min="0" value={form.mileage} onChange={e => setForm({ ...form, mileage: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Топливо (%)</label><input type="number" min="0" max="100" value={form.fuelLevel} onChange={e => setForm({ ...form, fuelLevel: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div className="sm:col-span-2"><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Состояние кузова</label><select value={form.bodyCondition} onChange={e => setForm({ ...form, bodyCondition: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none"><option value="excellent">Отличное</option><option value="good">Хорошее</option><option value="fair">Удовлетворительное</option><option value="poor">Плохое</option></select></div>
      </div>
      <div className="mb-4"><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Неисправности</label><textarea value={form.findings} onChange={e => setForm({ ...form, findings: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm h-20 focus:border-stone-500 focus:outline-none resize-none" /></div>
      <div className="mb-5"><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Рекомендации</label><textarea value={form.recommendations} onChange={e => setForm({ ...form, recommendations: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm h-20 focus:border-stone-500 focus:outline-none resize-none" /></div>
      <div className="mb-5">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2 block">Фотографии</label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {form.photos.map(photo => (
            <div key={photo.id} className="relative group border border-stone-200 overflow-hidden">
              <img src={photo.imageData} alt="" className="w-full h-20 object-cover" />
              <button onClick={() => removePhoto(photo.id)} className="absolute top-1 right-1 p-1 bg-stone-900 text-white opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
              <input type="text" placeholder="Описание" value={photo.description} onChange={e => updatePhotoDesc(photo.id, e.target.value)} className="w-full px-2 py-1 text-[10px] border-t border-stone-200 focus:outline-none" />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-stone-300 cursor-pointer hover:border-stone-500 hover:bg-stone-50"><Camera className="w-4 h-4 text-stone-400" /><span className="text-xs text-stone-500 uppercase tracking-wide">Загрузить фото</span><input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} /></label>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide">Отмена</button>
        <button onClick={handleSubmit} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wide">Сохранить</button>
      </div>
    </div>
  );
}

function ActForm({ appData, setAppData, currentUser, onClose, act }: { appData: AppData; setAppData: (d: AppData) => void; currentUser: User; onClose: () => void; act?: AcceptanceAct }) {
  const [form, setForm] = useState({ workOrderId: act?.workOrderId || '', date: act?.date || new Date().toISOString().split('T')[0], clientName: act?.clientName || '', carInfo: act?.carInfo || '', items: act?.items || [{ id: '1', name: '', quantity: 1, price: 0 }], discount: act?.discount || 0, discountType: act?.discountType || 'percent' as 'percent' | 'fixed', notes: act?.notes || '', status: act?.status || 'draft' as AcceptanceAct['status'] });
  const addItem = () => setForm({ ...form, items: [...form.items, { id: Date.now().toString(), name: '', quantity: 1, price: 0 }] });
  const updateItem = (idx: number, updates: any) => { const items = [...form.items]; items[idx] = { ...items[idx], ...updates }; setForm({ ...form, items }); };
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  const selectWorkOrder = (woId: string) => {
    const wo = appData.workOrders.find(w => w.id === woId);
    if (wo) setForm({ ...form, workOrderId: woId, clientName: wo.clientName, carInfo: `${wo.carBrand} ${wo.carModel} (${wo.carYear}) ${wo.carPlate}`, items: wo.items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })), discount: wo.discount, discountType: wo.discountType });
  };
  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discountAmt = form.discountType === 'percent' ? subtotal * form.discount / 100 : form.discount;
  const total = subtotal - discountAmt;
  const handleSubmit = () => { if (act) setAppData(updateAcceptanceAct(appData, act.id, { ...form, totalAmount: total })); else setAppData(addAcceptanceAct(appData, { ...form, totalAmount: total, createdBy: currentUser.id })); onClose(); };
  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200"><h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{act ? 'Редактировать' : 'Создать'} акт</h3><button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button></div>
      {!act && <div className="mb-4"><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Из заказ-наряда</label><select value={form.workOrderId} onChange={e => selectWorkOrder(e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none"><option value="">Выберите...</option>{appData.workOrders.map(wo => <option key={wo.id} value={wo.id}>{wo.number} — {wo.clientName}</option>)}</select></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Дата</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Клиент</label><input type="text" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div className="sm:col-span-2"><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Автомобиль</label><input type="text" value={form.carInfo} onChange={e => setForm({ ...form, carInfo: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
      </div>
      <div className="border border-stone-200 p-4 mb-4 bg-stone-50">
        <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Percent className="w-3.5 h-3.5" /> Скидка</h4>
        <div className="flex items-center gap-3">
          <input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} className="w-24 px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
          <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} className="px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none"><option value="percent">%</option><option value="fixed">руб.</option></select>
          {form.discount > 0 && <span className="text-xs text-green-700 font-medium">= −{discountAmt.toFixed(2)} ₽</span>}
        </div>
      </div>
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3"><h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Позиции</h4><button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-900 text-white hover:bg-stone-800 uppercase tracking-wide"><Plus className="w-3 h-3" /> Добавить</button></div>
        <div className="space-y-2">
          {form.items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 border border-stone-200 p-2 bg-white flex-wrap">
              <input type="text" placeholder="Наименование" value={item.name} onChange={e => updateItem(idx, { name: e.target.value })} className="flex-1 min-w-[120px] px-2 py-1 border border-stone-300 text-xs focus:border-stone-500 focus:outline-none" />
              <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="w-14 px-2 py-1 border border-stone-300 text-xs text-center focus:border-stone-500 focus:outline-none" />
              <input type="number" min="0" value={item.price} onChange={e => updateItem(idx, { price: Number(e.target.value) })} className="w-20 px-2 py-1 border border-stone-300 text-xs text-right focus:border-stone-500 focus:outline-none" />
              <span className="text-xs text-stone-500 w-16 text-right font-medium">{(item.quantity * item.price).toFixed(0)}₽</span>
              <button onClick={() => removeItem(idx)} className="p-1 text-stone-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-stone-200 text-right text-sm">
          <span className="text-stone-500">Подитог: </span><span className="font-medium">{subtotal.toFixed(2)} ₽</span>
          {form.discount > 0 && <><span className="text-stone-500 ml-3">Скидка: </span><span className="text-green-700 font-medium">−{discountAmt.toFixed(2)} ₽</span></>}
          <span className="text-stone-500 ml-3">Итого: </span><span className="font-bold text-stone-900">{total.toFixed(2)} ₽</span>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide">Отмена</button>
        <button onClick={handleSubmit} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wide">Сохранить</button>
      </div>
    </div>
  );
}

function ClientForm({ appData, setAppData, onClose, client }: { appData: AppData; setAppData: (d: AppData) => void; onClose: () => void; client?: Client }) {
  const [form, setForm] = useState({ name: client?.name || '', phone: client?.phone || '', email: client?.email || '', cars: client?.cars || [] as ClientCar[], notes: client?.notes || '' });
  const addCar = () => setForm({ ...form, cars: [...form.cars, { id: Date.now().toString(), brand: '', model: '', year: '', plate: '', vin: '', mileage: 0 }] });
  const updateCar = (idx: number, updates: any) => { const cars = [...form.cars]; cars[idx] = { ...cars[idx], ...updates }; setForm({ ...form, cars }); };
  const removeCar = (idx: number) => setForm({ ...form, cars: form.cars.filter((_, i) => i !== idx) });
  const handleSubmit = () => { if (client) setAppData(updateClient(appData, client.id, form)); else setAppData(addClient(appData, form)); onClose(); };
  return (
    <div className="p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200"><h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{client ? 'Редактировать' : 'Добавить'} клиента</h3><button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">ФИО *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Телефон *</label><input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
        <div className="sm:col-span-2"><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" /></div>
      </div>
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3"><h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Автомобили</h4><button onClick={addCar} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-900 text-white hover:bg-stone-800 uppercase tracking-wide"><Plus className="w-3 h-3" /> Добавить</button></div>
        <div className="space-y-3">
          {form.cars.map((car, idx) => (
            <div key={car.id} className="border border-stone-200 p-3 bg-stone-50">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Марка" value={car.brand} onChange={e => updateCar(idx, { brand: e.target.value })} className="px-2 py-1 border border-stone-300 text-xs focus:border-stone-500 focus:outline-none" />
                <input type="text" placeholder="Модель" value={car.model} onChange={e => updateCar(idx, { model: e.target.value })} className="px-2 py-1 border border-stone-300 text-xs focus:border-stone-500 focus:outline-none" />
                <input type="text" placeholder="Год" value={car.year} onChange={e => updateCar(idx, { year: e.target.value })} className="px-2 py-1 border border-stone-300 text-xs focus:border-stone-500 focus:outline-none" />
                <input type="text" placeholder="Гос. номер" value={car.plate} onChange={e => updateCar(idx, { plate: e.target.value })} className="px-2 py-1 border border-stone-300 text-xs focus:border-stone-500 focus:outline-none" />
                <input type="number" placeholder="Пробег" value={car.mileage} onChange={e => updateCar(idx, { mileage: Number(e.target.value) })} className="px-2 py-1 border border-stone-300 text-xs focus:border-stone-500 focus:outline-none" />
                <button onClick={() => removeCar(idx)} className="p-1 text-stone-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-5"><label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Примечания</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm h-20 focus:border-stone-500 focus:outline-none resize-none" /></div>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide">Отмена</button>
        <button onClick={handleSubmit} disabled={!form.name || !form.phone} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wide disabled:opacity-50">Сохранить</button>
      </div>
    </div>
  );
}
