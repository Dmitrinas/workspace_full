import { useState, useEffect } from 'react';
import { AppData, User, SparePart, WorkOrder, Inspection, AcceptanceAct, WorkOrderItem, InspectionPhoto } from './types';
import { loadData, saveData, onSync, addSparePart, updateSparePart, deleteSparePart, importSpareParts, addWorkOrder, updateWorkOrder, deleteWorkOrder, addInspection, updateInspection, addAcceptanceAct, updateAcceptanceAct, exportAllData, importAllData } from './store';
import { generateWorkOrderPDF, generateInspectionPDF, generateAcceptanceActPDF } from './utils/pdf';
import { FileText, Package, ClipboardList, Camera, Users, Download, Upload, Plus, Trash2, Edit, X, Check, Mail, AlertCircle, FileImage, Percent, Lock, Shield, Wrench } from 'lucide-react';

type Page = 'dashboard' | 'workorders' | 'catalog' | 'inspections' | 'acts' | 'users';

export default function App() {
  const [data, setData] = useState<AppData>(loadData());
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [modal, setModal] = useState<{ type: string; data?: any } | null>(null);

  useEffect(() => {
    const unsub = onSync(() => setData(loadData()));
    return unsub;
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLogin(false);
    const updated = { ...data, currentUserId: user.id };
    setData(updated);
    saveData(updated);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowLogin(true);
    const updated = { ...data, currentUserId: null };
    setData(updated);
    saveData(updated);
  };

  if (showLogin || !currentUser) {
    return <LoginPage users={data.users} onLogin={handleLogin} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-stone-100 font-sans">
      {/* Header */}
      <header className="bg-stone-900 border-b border-stone-800">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-600 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white tracking-wide uppercase">АвтоСервис</h1>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">Система управления</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-stone-200 font-medium">{currentUser.name}</div>
              <div className="text-[11px] text-stone-500 uppercase tracking-wide">
                {isAdmin ? 'Администратор' : 'Менеджер'}
              </div>
            </div>
            <div className="w-px h-8 bg-stone-700"></div>
            <button onClick={handleLogout} className="text-xs text-stone-400 hover:text-stone-200 uppercase tracking-wide transition-colors">
              Выход
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <nav className="w-60 shrink-0">
          <div className="bg-white border border-stone-200">
            <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Навигация</span>
            </div>
            <div className="p-2 space-y-0.5">
              <NavItem icon={<ClipboardList className="w-4 h-4" />} label="Дашборд" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} disabled={false} />
              <NavItem icon={<FileText className="w-4 h-4" />} label="Заказ-наряды" active={currentPage === 'workorders'} onClick={() => setCurrentPage('workorders')} disabled={!isAdmin} locked={!isAdmin} />
              <NavItem icon={<Camera className="w-4 h-4" />} label="Осмотры" active={currentPage === 'inspections'} onClick={() => setCurrentPage('inspections')} disabled={!isAdmin} locked={!isAdmin} />
              <NavItem icon={<FileText className="w-4 h-4" />} label="Акты приема-передачи" active={currentPage === 'acts'} onClick={() => setCurrentPage('acts')} disabled={!isAdmin} locked={!isAdmin} />
              <NavItem icon={<Package className="w-4 h-4" />} label="Каталог запчастей" active={currentPage === 'catalog'} onClick={() => setCurrentPage('catalog')} disabled={false} />
              <NavItem icon={<Users className="w-4 h-4" />} label="Пользователи" active={currentPage === 'users'} onClick={() => setCurrentPage('users')} disabled={false} />
            </div>
          </div>

          {/* Data management */}
          <div className="bg-white border border-stone-200 mt-4">
            <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
              <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Данные</span>
            </div>
            <div className="p-2 space-y-0.5">
              <button onClick={() => {
                const json = exportAllData(data);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `autoservice_backup_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50 transition-colors">
                <Download className="w-3.5 h-3.5 text-stone-400" />
                <span className="uppercase tracking-wide">Экспорт данных</span>
              </button>
              <label className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-stone-600 hover:bg-stone-50 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-stone-400" />
                <span className="uppercase tracking-wide">Импорт данных</span>
                <input type="file" accept=".json" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const result = importAllData(ev.target?.result as string);
                      if (result) setData(result);
                    };
                    reader.readAsText(file);
                  }
                }} />
              </label>
            </div>
          </div>

          {/* Role info */}
          <div className="bg-stone-800 border border-stone-700 mt-4 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Права доступа</span>
            </div>
            {isAdmin ? (
              <p className="text-[11px] text-stone-300 leading-relaxed">Полный доступ ко всем разделам системы</p>
            ) : (
              <p className="text-[11px] text-stone-300 leading-relaxed">Доступ: каталог запчастей. Заказ-наряды, осмотры и акты — только для администратора.</p>
            )}
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {currentPage === 'dashboard' && <DashboardPage data={data} isAdmin={isAdmin} />}
          {currentPage === 'workorders' && <WorkOrdersPage data={data} setData={setData} currentUser={currentUser} setModal={setModal} />}
          {currentPage === 'catalog' && <CatalogPage data={data} setData={setData} currentUser={currentUser} setModal={setModal} />}
          {currentPage === 'inspections' && <InspectionsPage data={data} setData={setData} currentUser={currentUser} setModal={setModal} />}
          {currentPage === 'acts' && <ActsPage data={data} setData={setData} currentUser={currentUser} setModal={setModal} />}
          {currentPage === 'users' && <UsersPage data={data} />}
        </main>
      </div>

      {modal && <ModalRouter modal={modal} setModal={setModal} data={data} setData={setData} currentUser={currentUser} />}
    </div>
  );
}

// Nav Item
function NavItem({ icon, label, active, onClick, disabled, locked }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void; disabled: boolean; locked?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors ${
        active
          ? 'bg-stone-900 text-white font-medium'
          : disabled
          ? 'text-stone-300 cursor-not-allowed'
          : 'text-stone-700 hover:bg-stone-100'
      }`}
    >
      {icon}
      <span className="uppercase tracking-wide flex-1 text-left">{label}</span>
      {locked && <Lock className="w-3 h-3 text-stone-400" />}
    </button>
  );
}

// Login Page
function LoginPage({ users, onLogin }: { users: User[]; onLogin: (u: User) => void }) {
  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-amber-600 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white uppercase tracking-wider">АвтоСервис</h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest">Система управления</p>
          </div>
        </div>
        <div className="bg-stone-800 border border-stone-700 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wider mb-4 font-semibold">Выберите пользователя</p>
          <div className="space-y-2">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => onLogin(user)}
                className="w-full flex items-center gap-4 p-4 border border-stone-600 bg-stone-750 hover:bg-stone-700 hover:border-amber-600 transition-all group"
              >
                <div className="w-10 h-10 bg-stone-700 border border-stone-600 flex items-center justify-center group-hover:border-amber-600 transition-colors">
                  <Users className="w-4 h-4 text-stone-400 group-hover:text-amber-500 transition-colors" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-stone-200">{user.name}</div>
                  <div className="text-[11px] text-stone-500 uppercase tracking-wide">
                    {user.role === 'admin' ? 'Администратор' : 'Менеджер'}
                  </div>
                </div>
                <div className="ml-auto">
                  {user.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-stone-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard
function DashboardPage({ data, isAdmin }: { data: AppData; isAdmin: boolean }) {
  const stats = [
    { label: 'Заказ-наряды', value: data.workOrders.length, color: 'bg-stone-800' },
    { label: 'Осмотры', value: data.inspections.length, color: 'bg-stone-700' },
    { label: 'Акты', value: data.acceptanceActs.length, color: 'bg-stone-600' },
    { label: 'Запчасти', value: data.spareParts.length, color: 'bg-amber-700' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Обзор</h2>
          <p className="text-xs text-stone-500 mt-1">Статистика системы</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white border border-stone-200 p-5">
            <div className={`w-full h-1 ${s.color} mb-4`}></div>
            <div className="text-2xl font-bold text-stone-900">{s.value}</div>
            <div className="text-[11px] text-stone-500 uppercase tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200">
          <div className="px-5 py-3 border-b border-stone-200 bg-stone-50">
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Последние заказ-наряды</span>
          </div>
          <div className="p-4">
            {data.workOrders.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">Нет данных</p>
            ) : (
              <div className="space-y-2">
                {data.workOrders.slice(-5).reverse().map(wo => (
                  <div key={wo.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                    <div>
                      <span className="text-xs font-semibold text-stone-800 font-mono">{wo.number}</span>
                      <span className="text-xs text-stone-500 ml-2">{wo.clientName}</span>
                    </div>
                    <StatusBadge status={wo.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-stone-200">
          <div className="px-5 py-3 border-b border-stone-200 bg-stone-50">
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Последние осмотры</span>
          </div>
          <div className="p-4">
            {data.inspections.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-6">Нет данных</p>
            ) : (
              <div className="space-y-2">
                {data.inspections.slice(-5).reverse().map(insp => {
                  const wo = data.workOrders.find(w => w.id === insp.workOrderId);
                  return (
                    <div key={insp.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                      <div>
                        <span className="text-xs font-semibold text-stone-800">{new Date(insp.date).toLocaleDateString('ru-RU')}</span>
                        {wo && <span className="text-xs text-stone-500 ml-2">{wo.number}</span>}
                      </div>
                      <span className="text-[10px] text-stone-400 uppercase">{insp.photos.length} фото</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    new: 'bg-stone-100 text-stone-600 border-stone-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  const labels: Record<string, string> = {
    new: 'Новый',
    in_progress: 'В работе',
    completed: 'Завершен',
    cancelled: 'Отменен',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 border uppercase tracking-wide ${config[status] || config.new}`}>
      {labels[status] || status}
    </span>
  );
}

// Work Orders Page (Admin only)
function WorkOrdersPage({ data, setData, currentUser, setModal }: { data: AppData; setData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  const [filter, setFilter] = useState('');

  if (currentUser.role !== 'admin') {
    return <AccessDenied message="Только администратор может управлять заказ-нарядами" />;
  }

  const filtered = data.workOrders.filter(wo =>
    wo.clientName.toLowerCase().includes(filter.toLowerCase()) ||
    wo.number.toLowerCase().includes(filter.toLowerCase()) ||
    wo.carBrand.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Заказ-наряды</h2>
          <p className="text-xs text-stone-500 mt-1">Управление работами и услугами</p>
        </div>
        <button onClick={() => setModal({ type: 'createWorkOrder' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Создать
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск по клиенту, номеру, марке..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full px-4 py-2.5 border border-stone-300 bg-white text-sm focus:border-stone-500 focus:outline-none transition-colors"
        />
      </div>
      <div className="space-y-3">
        {filtered.map(wo => {
          const inspection = data.inspections.find(i => i.workOrderId === wo.id);
          const act = data.acceptanceActs.find(a => a.workOrderId === wo.id);
          const total = wo.items.reduce((s, i) => s + i.quantity * i.price, 0);
          const discountAmt = wo.discountType === 'percent' ? total * wo.discount / 100 : wo.discount;
          return (
            <div key={wo.id} className="bg-white border border-stone-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-bold text-stone-900 font-mono text-sm">{wo.number}</span>
                    <StatusBadge status={wo.status} />
                  </div>
                  <div className="text-sm text-stone-700 font-medium">{wo.clientName}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{wo.carBrand} {wo.carModel} ({wo.carYear}) • {wo.carPlate}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{wo.clientPhone} • {wo.clientEmail}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-stone-900">{(total - discountAmt).toFixed(0)} ₽</div>
                  {wo.discount > 0 && <div className="text-[10px] text-green-700 uppercase tracking-wide">Скидка {wo.discount}{wo.discountType === 'percent' ? '%' : '₽'}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100 flex-wrap">
                <button onClick={() => setModal({ type: 'editWorkOrder', data: wo })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                  <Edit className="w-3 h-3" /> Изменить
                </button>
                {!inspection && (
                  <button onClick={() => setModal({ type: 'confirmInspection', data: wo })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                    <Camera className="w-3 h-3" /> Осмотр
                  </button>
                )}
                {inspection && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
                    <Check className="w-3 h-3" /> Осмотр
                  </span>
                )}
                {!act && (
                  <button onClick={() => setModal({ type: 'confirmAct', data: wo })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                    <FileText className="w-3 h-3" /> Акт
                  </button>
                )}
                {act && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
                    <Check className="w-3 h-3" /> Акт
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => { const doc = generateWorkOrderPDF(wo); doc.save(`${wo.number}.pdf`); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                  <button onClick={() => { const mailto = `mailto:${wo.clientEmail}?subject=Заказ-наряд ${wo.number}&body=Здравствуйте! Направляю вам заказ-наряд ${wo.number}.`; window.open(mailto); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                    <Mail className="w-3 h-3" /> Email
                  </button>
                  <button onClick={() => { if (confirm('Удалить заказ-наряд?')) setData(deleteWorkOrder(data, wo.id)); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 uppercase tracking-wide transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white border border-stone-200 p-12 text-center">
            <p className="text-xs text-stone-400 uppercase tracking-wider">Нет заказ-нарядов</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Access Denied
function AccessDenied({ message }: { message: string }) {
  return (
    <div className="bg-white border border-stone-200 p-12 text-center">
      <Lock className="w-8 h-8 text-stone-300 mx-auto mb-3" />
      <p className="text-xs text-stone-500 uppercase tracking-wider">{message}</p>
    </div>
  );
}

// Catalog Page (both admin and manager)
function CatalogPage({ data, setData, currentUser, setModal }: { data: AppData; setData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  const [filter, setFilter] = useState('');

  const filtered = data.spareParts.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.article.toLowerCase().includes(filter.toLowerCase()) ||
    p.brand.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Каталог запчастей</h2>
          <p className="text-xs text-stone-500 mt-1">Управление складом и номенклатурой</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal({ type: 'importParts' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 text-stone-700 border border-stone-300 text-xs uppercase tracking-wider hover:bg-stone-200 transition-colors">
            <Upload className="w-3.5 h-3.5" /> Импорт
          </button>
          <button onClick={() => setModal({ type: 'createPart' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Добавить
          </button>
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Поиск по названию, артикулу, бренду..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full px-4 py-2.5 border border-stone-300 bg-white text-sm focus:border-stone-500 focus:outline-none transition-colors"
        />
      </div>
      <div className="bg-white border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Артикул</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Название</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Бренд</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Категория</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Цена</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Кол-во</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3 text-stone-900 font-mono text-xs">{p.article}</td>
                <td className="px-4 py-3 text-stone-800 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-stone-600">{p.brand}</td>
                <td className="px-4 py-3 text-stone-600">{p.category}</td>
                <td className="px-4 py-3 text-right text-stone-900 font-medium">{p.price.toFixed(2)} ₽</td>
                <td className="px-4 py-3 text-right text-stone-900">{p.quantity}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setModal({ type: 'editPart', data: p })} className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (confirm('Удалить запчасть?')) setData(deleteSparePart(data, p.id)); }} className="p-1.5 text-stone-400 hover:text-red-600 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-xs text-stone-400 uppercase tracking-wider">Каталог пуст</p>
          </div>
        )}
      </div>
      <div className="mt-3 text-xs text-stone-400">
        Всего позиций: {filtered.length}
      </div>
    </div>
  );
}

// Inspections Page (Admin only)
function InspectionsPage({ data, setData, currentUser, setModal }: { data: AppData; setData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  if (currentUser.role !== 'admin') {
    return <AccessDenied message="Только администратор может управлять осмотрами" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Осмотры</h2>
          <p className="text-xs text-stone-500 mt-1">Фиксация состояния автомобилей</p>
        </div>
        <button onClick={() => setModal({ type: 'createInspection' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Создать
        </button>
      </div>
      <div className="space-y-3">
        {data.inspections.map(insp => {
          const wo = data.workOrders.find(w => w.id === insp.workOrderId);
          return (
            <div key={insp.id} className="bg-white border border-stone-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-stone-900 text-sm mb-1">
                    Осмотр от {new Date(insp.date).toLocaleDateString('ru-RU')}
                  </div>
                  {wo && (
                    <div className="text-xs text-stone-600">
                      <span className="font-mono font-semibold">{wo.number}</span> • {wo.clientName} • {wo.carBrand} {wo.carModel}
                    </div>
                  )}
                  <div className="text-xs text-stone-500 mt-2 space-x-4">
                    <span>Пробег: {insp.mileage} км</span>
                    <span>Топливо: {insp.fuelLevel}%</span>
                    <span>Кузов: {getConditionLabel(insp.bodyCondition)}</span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1 uppercase tracking-wide">Фото: {insp.photos.length} шт.</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModal({ type: 'editInspection', data: insp })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                    <Edit className="w-3 h-3" /> Изменить
                  </button>
                  <button onClick={() => { const doc = generateInspectionPDF(insp, wo); doc.save(`Осмотр_${wo?.number || insp.id}.pdf`); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {data.inspections.length === 0 && (
          <div className="bg-white border border-stone-200 p-12 text-center">
            <p className="text-xs text-stone-400 uppercase tracking-wider">Нет осмотров</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    excellent: 'Отличное',
    good: 'Хорошее',
    fair: 'Удовл.',
    poor: 'Плохое',
  };
  return labels[condition] || condition;
}

// Acts Page (Admin only)
function ActsPage({ data, setData, currentUser, setModal }: { data: AppData; setData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  if (currentUser.role !== 'admin') {
    return <AccessDenied message="Только администратор может управлять актами" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Акты приема-передачи</h2>
          <p className="text-xs text-stone-500 mt-1">Документооборот с клиентами</p>
        </div>
        <button onClick={() => setModal({ type: 'createAct' })} className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-xs uppercase tracking-wider hover:bg-stone-800 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Создать
        </button>
      </div>
      <div className="space-y-3">
        {data.acceptanceActs.map(act => {
          const wo = data.workOrders.find(w => w.id === act.workOrderId);
          return (
            <div key={act.id} className="bg-white border border-stone-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-stone-900 text-sm mb-1">
                    Акт от {new Date(act.date).toLocaleDateString('ru-RU')}
                  </div>
                  {wo && <div className="text-xs text-stone-600"><span className="font-mono font-semibold">{wo.number}</span> • {act.clientName}</div>}
                  <div className="text-xs text-stone-500 mt-1">{act.carInfo}</div>
                  <div className="text-sm font-bold text-stone-900 mt-2">{act.totalAmount.toFixed(0)} ₽ {act.discount > 0 && <span className="text-xs text-green-700 font-normal">(скидка {act.discount}{act.discountType === 'percent' ? '%' : '₽'})</span>}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModal({ type: 'editAct', data: act })} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                    <Edit className="w-3 h-3" /> Изменить
                  </button>
                  <button onClick={() => { const doc = generateAcceptanceActPDF(act, wo); doc.save(`Акт_${wo?.number || act.id}.pdf`); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                  <button onClick={() => { const mailto = `mailto:${wo?.clientEmail || ''}?subject=Акт приема-передачи ${wo?.number || ''}`; window.open(mailto); }} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                    <Mail className="w-3 h-3" /> Email
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {data.acceptanceActs.length === 0 && (
          <div className="bg-white border border-stone-200 p-12 text-center">
            <p className="text-xs text-stone-400 uppercase tracking-wider">Нет актов</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Users Page
function UsersPage({ data }: { data: AppData }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-stone-900 uppercase tracking-wide">Пользователи</h2>
        <p className="text-xs text-stone-500 mt-1">Управление доступом</p>
      </div>
      <div className="space-y-3">
        {data.users.map(u => (
          <div key={u.id} className="bg-white border border-stone-200 p-5 flex items-center gap-5">
            <div className="w-12 h-12 bg-stone-100 border border-stone-200 flex items-center justify-center">
              {u.role === 'admin' ? <Shield className="w-5 h-5 text-amber-600" /> : <Users className="w-5 h-5 text-stone-500" />}
            </div>
            <div className="flex-1">
              <div className="font-bold text-stone-900 text-sm">{u.name}</div>
              <div className="text-xs text-stone-500">{u.email}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Роль</div>
              <div className="text-xs font-semibold text-stone-800 uppercase">
                {u.role === 'admin' ? 'Администратор' : 'Менеджер'}
              </div>
            </div>
            <div className="w-48 text-left">
              <div className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Права</div>
              {u.role === 'admin' ? (
                <div className="text-[11px] text-stone-600">Полный доступ ко всем разделам</div>
              ) : (
                <div className="text-[11px] text-stone-600">Каталог запчастей</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Modal Router
function ModalRouter({ modal, setModal, data, setData, currentUser }: { modal: any; setModal: (m: any) => void; data: AppData; setData: (d: AppData) => void; currentUser: User }) {
  const close = () => setModal(null);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={close}>
      <div className="bg-white border border-stone-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {modal.type === 'createWorkOrder' && <WorkOrderForm data={data} setData={setData} currentUser={currentUser} onClose={close} />}
        {modal.type === 'editWorkOrder' && <WorkOrderForm data={data} setData={setData} currentUser={currentUser} onClose={close} order={modal.data} />}
        {modal.type === 'confirmInspection' && <ConfirmInspection data={data} setData={setData} currentUser={currentUser} onClose={close} order={modal.data} />}
        {modal.type === 'confirmAct' && <ConfirmAct data={data} setData={setData} currentUser={currentUser} onClose={close} order={modal.data} />}
        {modal.type === 'createPart' && <PartForm data={data} setData={setData} onClose={close} />}
        {modal.type === 'editPart' && <PartForm data={data} setData={setData} onClose={close} part={modal.data} />}
        {modal.type === 'importParts' && <ImportPartsForm data={data} setData={setData} onClose={close} />}
        {modal.type === 'createInspection' && <InspectionForm data={data} setData={setData} currentUser={currentUser} onClose={close} />}
        {modal.type === 'editInspection' && <InspectionForm data={data} setData={setData} currentUser={currentUser} onClose={close} inspection={modal.data} />}
        {modal.type === 'createAct' && <ActForm data={data} setData={setData} currentUser={currentUser} onClose={close} />}
        {modal.type === 'editAct' && <ActForm data={data} setData={setData} currentUser={currentUser} onClose={close} act={modal.data} />}
      </div>
    </div>
  );
}

// Work Order Form
function WorkOrderForm({ data, setData, currentUser, onClose, order }: { data: AppData; setData: (d: AppData) => void; currentUser: User; onClose: () => void; order?: WorkOrder }) {
  const [form, setForm] = useState({
    clientName: order?.clientName || '',
    clientPhone: order?.clientPhone || '',
    clientEmail: order?.clientEmail || '',
    carBrand: order?.carBrand || '',
    carModel: order?.carModel || '',
    carYear: order?.carYear || '',
    carPlate: order?.carPlate || '',
    vin: order?.vin || '',
    items: order?.items || [] as WorkOrderItem[],
    discount: order?.discount || 0,
    discountType: order?.discountType || 'percent' as 'percent' | 'fixed',
    status: order?.status || 'new' as WorkOrder['status'],
    notes: order?.notes || '',
  });

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { id: Date.now().toString(), type: 'work', name: '', quantity: 1, price: 0 }] });
  };

  const updateItem = (idx: number, updates: Partial<WorkOrderItem>) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], ...updates };
    setForm({ ...form, items });
  };

  const removeItem = (idx: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const addFromCatalog = (part: SparePart) => {
    setForm({ ...form, items: [...form.items, { id: Date.now().toString(), type: 'part', name: `${part.name} (${part.article})`, quantity: 1, price: part.price, sparePartId: part.id }] });
  };

  const handleSubmit = () => {
    const totalAmount = form.items.reduce((s, i) => s + i.quantity * i.price, 0);
    if (order) {
      setData(updateWorkOrder(data, order.id, { ...form, totalAmount }));
    } else {
      setData(addWorkOrder(data, { ...form, totalAmount, createdBy: currentUser.id }));
    }
    onClose();
  };

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discountAmt = form.discountType === 'percent' ? subtotal * form.discount / 100 : form.discount;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{order ? 'Редактировать' : 'Создать'} заказ-наряд</h3>
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">ФИО клиента *</label>
          <input type="text" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Телефон *</label>
          <input type="text" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Email</label>
          <input type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Статус</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none bg-white">
            <option value="new">Новый</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Завершен</option>
            <option value="cancelled">Отменен</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Марка *</label>
          <input type="text" value={form.carBrand} onChange={e => setForm({ ...form, carBrand: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Модель *</label>
          <input type="text" value={form.carModel} onChange={e => setForm({ ...form, carModel: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Год</label>
          <input type="text" value={form.carYear} onChange={e => setForm({ ...form, carYear: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Гос. номер</label>
          <input type="text" value={form.carPlate} onChange={e => setForm({ ...form, carPlate: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">VIN</label>
          <input type="text" value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
      </div>

      {/* Discount */}
      <div className="border border-stone-200 p-4 mb-5 bg-stone-50">
        <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Percent className="w-3.5 h-3.5" /> Скидка</h4>
        <div className="flex items-center gap-3">
          <input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} className="w-24 px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
          <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} className="px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none">
            <option value="percent">%</option>
            <option value="fixed">руб.</option>
          </select>
          {form.discount > 0 && <span className="text-xs text-green-700 font-medium">= −{discountAmt.toFixed(2)} ₽</span>}
        </div>
      </div>

      {/* Items */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Работы и запчасти</h4>
          <div className="flex gap-2">
            {data.spareParts.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200 uppercase tracking-wide transition-colors">
                  <Package className="w-3 h-3" /> Из каталога
                </button>
                <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-stone-300 shadow-lg hidden group-hover:block z-10 max-h-60 overflow-y-auto">
                  {data.spareParts.map(p => (
                    <button key={p.id} onClick={() => addFromCatalog(p)} className="w-full text-left px-3 py-2 text-xs hover:bg-stone-50 border-b border-stone-100 transition-colors">
                      <span className="font-medium">{p.name}</span> <span className="text-stone-400 font-mono">({p.article})</span> — <span className="font-semibold">{p.price}₽</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-900 text-white hover:bg-stone-800 uppercase tracking-wide transition-colors">
              <Plus className="w-3 h-3" /> Добавить
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {form.items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 border border-stone-200 p-2 bg-white">
              <select value={item.type} onChange={e => updateItem(idx, { type: e.target.value as any })} className="px-2 py-1 border border-stone-300 text-xs w-20 bg-white focus:border-stone-500 focus:outline-none">
                <option value="work">Работа</option>
                <option value="part">Запчасть</option>
              </select>
              <input type="text" placeholder="Название" value={item.name} onChange={e => updateItem(idx, { name: e.target.value })} className="flex-1 px-2 py-1 border border-stone-300 text-xs focus:border-stone-500 focus:outline-none" />
              <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="w-14 px-2 py-1 border border-stone-300 text-xs text-center focus:border-stone-500 focus:outline-none" />
              <input type="number" min="0" value={item.price} onChange={e => updateItem(idx, { price: Number(e.target.value) })} className="w-24 px-2 py-1 border border-stone-300 text-xs text-right focus:border-stone-500 focus:outline-none" />
              <span className="text-xs text-stone-500 w-20 text-right font-medium">{(item.quantity * item.price).toFixed(0)}₽</span>
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

      <div className="mb-5">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Примечания</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm h-20 focus:border-stone-500 focus:outline-none resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wider transition-colors">Отмена</button>
        <button onClick={handleSubmit} disabled={!form.clientName || !form.carBrand} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wider disabled:opacity-50 transition-colors">Сохранить</button>
      </div>
    </div>
  );
}

// Confirm Inspection Dialog
function ConfirmInspection({ data, setData, currentUser, onClose, order }: { data: AppData; setData: (d: AppData) => void; currentUser: User; onClose: () => void; order: WorkOrder }) {
  const handleCreate = () => {
    const newInsp = addInspection(data, {
      workOrderId: order.id,
      date: new Date().toISOString().split('T')[0],
      photos: [],
      findings: '',
      recommendations: '',
      mileage: 0,
      bodyCondition: 'good',
      fuelLevel: 100,
      status: 'draft',
      createdBy: currentUser.id,
    });
    // Find the newly created inspection
    const createdInsp = newInsp.inspections[newInsp.inspections.length - 1];
    if (createdInsp) {
      updateWorkOrder(newInsp, order.id, { inspectionId: createdInsp.id });
    }
    setData(newInsp);
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-200">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Создать осмотр</h3>
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="border border-stone-200 p-4 mb-5 bg-stone-50">
        <p className="text-xs text-stone-700"><span className="font-mono font-bold">{order.number}</span></p>
        <p className="text-xs text-stone-500 mt-1">{order.clientName} • {order.carBrand} {order.carModel}</p>
      </div>
      <p className="text-xs text-stone-600 mb-6 leading-relaxed">Создать акт осмотра для данного заказ-наряда? Осмотр позволит зафиксировать состояние автомобиля с фотографиями.</p>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wider transition-colors">Нет, позже</button>
        <button onClick={handleCreate} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wider transition-colors">Создать осмотр</button>
      </div>
    </div>
  );
}

// Confirm Act Dialog
function ConfirmAct({ data, setData, currentUser, onClose, order }: { data: AppData; setData: (d: AppData) => void; currentUser: User; onClose: () => void; order: WorkOrder }) {
  const handleCreate = () => {
    const totalAmount = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
    const updated = addAcceptanceAct(data, {
      workOrderId: order.id,
      date: new Date().toISOString().split('T')[0],
      clientName: order.clientName,
      carInfo: `${order.carBrand} ${order.carModel} (${order.carYear}) ${order.carPlate}`,
      items: order.items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
      totalAmount,
      discount: order.discount,
      discountType: order.discountType,
      notes: '',
      status: 'draft',
      createdBy: currentUser.id,
    });
    setData(updated);
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-200">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Создать акт приема-передачи</h3>
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="border border-stone-200 p-4 mb-5 bg-stone-50">
        <p className="text-xs text-stone-700"><span className="font-mono font-bold">{order.number}</span></p>
        <p className="text-xs text-stone-500 mt-1">{order.clientName} • {order.carBrand} {order.carModel}</p>
      </div>
      <p className="text-xs text-stone-600 mb-6 leading-relaxed">Создать акт приема-передачи для данного заказ-наряда?</p>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wider transition-colors">Нет, позже</button>
        <button onClick={handleCreate} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wider transition-colors">Создать акт</button>
      </div>
    </div>
  );
}

// Part Form
function PartForm({ data, setData, onClose, part }: { data: AppData; setData: (d: AppData) => void; onClose: () => void; part?: SparePart }) {
  const [form, setForm] = useState({
    article: part?.article || '',
    name: part?.name || '',
    brand: part?.brand || '',
    price: part?.price || 0,
    quantity: part?.quantity || 0,
    category: part?.category || '',
    supplier: part?.supplier || '',
  });

  const handleSubmit = () => {
    if (part) {
      setData(updateSparePart(data, part.id, form));
    } else {
      setData(addSparePart(data, form));
    }
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{part ? 'Редактировать' : 'Добавить'} запчасть</h3>
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Артикул *</label>
          <input type="text" value={form.article} onChange={e => setForm({ ...form, article: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Название *</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Бренд</label>
          <input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Категория</label>
          <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Цена *</label>
          <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Количество</label>
          <input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Поставщик</label>
          <input type="text" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wider transition-colors">Отмена</button>
        <button onClick={handleSubmit} disabled={!form.article || !form.name} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wider disabled:opacity-50 transition-colors">Сохранить</button>
      </div>
    </div>
  );
}

// Import Parts Form
function ImportPartsForm({ data, setData, onClose }: { data: AppData; setData: (d: AppData) => void; onClose: () => void }) {
  const [textData, setTextData] = useState('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  const handleImport = () => {
    try {
      let parts: any[] = [];
      if (format === 'json') {
        parts = JSON.parse(textData);
      } else {
        const lines = textData.trim().split('\n');
        const headers = lines[0].split(/[;,]/).map(h => h.trim().toLowerCase());
        parts = lines.slice(1).map(line => {
          const vals = line.split(/[;,]/).map(v => v.trim());
          const obj: any = {};
          headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
          return {
            article: obj['артикул'] || obj['article'] || '',
            name: obj['название'] || obj['name'] || '',
            brand: obj['бренд'] || obj['brand'] || '',
            price: parseFloat(obj['цена'] || obj['price'] || '0'),
            quantity: parseInt(obj['количество'] || obj['quantity'] || obj['кол-во'] || '0'),
            category: obj['категория'] || obj['category'] || '',
            supplier: obj['поставщик'] || obj['supplier'] || '',
          };
        }).filter(p => p.article && p.name);
      }
      if (parts.length > 0) {
        setData(importSpareParts(data, parts));
        onClose();
      }
    } catch (e) {
      alert('Ошибка импорта. Проверьте формат данных.');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setTextData(ev.target?.result as string);
      if (file.name.endsWith('.json')) setFormat('json');
      else setFormat('csv');
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Импорт запчастей</h3>
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="mb-4">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2 block">Загрузить файл (CSV или JSON)</label>
        <input type="file" accept=".csv,.json,.txt" onChange={handleFileImport} className="w-full text-xs" />
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Формат:</label>
          <select value={format} onChange={e => setFormat(e.target.value as any)} className="px-2 py-1 border border-stone-300 text-xs bg-white focus:border-stone-500 focus:outline-none">
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <textarea
          value={textData}
          onChange={e => setTextData(e.target.value)}
          placeholder={format === 'csv' ? 'артикул;название;бренд;цена;количество;категория\nBR001;Колодки тормозные;Brembo;2500;10;Тормоза' : '[{"article":"BR001","name":"Колодки","brand":"Brembo","price":2500,"quantity":10,"category":"Тормоза"}]'}
          className="w-full px-3 py-2 border border-stone-300 text-xs h-40 font-mono focus:border-stone-500 focus:outline-none resize-none"
        />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wider transition-colors">Отмена</button>
        <button onClick={handleImport} disabled={!textData} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wider disabled:opacity-50 transition-colors">Импортировать</button>
      </div>
    </div>
  );
}

// Inspection Form
function InspectionForm({ data, setData, currentUser, onClose, inspection }: { data: AppData; setData: (d: AppData) => void; currentUser: User; onClose: () => void; inspection?: Inspection }) {
  const [form, setForm] = useState({
    workOrderId: inspection?.workOrderId || '',
    date: inspection?.date || new Date().toISOString().split('T')[0],
    photos: inspection?.photos || [] as InspectionPhoto[],
    findings: inspection?.findings || '',
    recommendations: inspection?.recommendations || '',
    mileage: inspection?.mileage || 0,
    bodyCondition: inspection?.bodyCondition || 'good',
    fuelLevel: inspection?.fuelLevel || 100,
    status: inspection?.status || 'draft' as Inspection['status'],
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newPhoto: InspectionPhoto = {
          id: Date.now().toString() + Math.random(),
          data: ev.target?.result as string,
          description: '',
          timestamp: new Date().toISOString(),
        };
        setForm(prev => ({ ...prev, photos: [...prev.photos, newPhoto] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (id: string) => {
    setForm({ ...form, photos: form.photos.filter(p => p.id !== id) });
  };

  const updatePhotoDesc = (id: string, desc: string) => {
    setForm({ ...form, photos: form.photos.map(p => p.id === id ? { ...p, description: desc } : p) });
  };

  const handleSubmit = () => {
    if (inspection) {
      setData(updateInspection(data, inspection.id, form));
    } else {
      const updated = addInspection(data, { ...form, createdBy: currentUser.id });
      setData(updated);
    }
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{inspection ? 'Редактировать' : 'Создать'} осмотр</h3>
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Заказ-наряд</label>
          <select value={form.workOrderId} onChange={e => setForm({ ...form, workOrderId: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none">
            <option value="">Выберите...</option>
            {data.workOrders.map(wo => (
              <option key={wo.id} value={wo.id}>{wo.number} — {wo.clientName} ({wo.carBrand} {wo.carModel})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Дата</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Пробег (км)</label>
          <input type="number" min="0" value={form.mileage} onChange={e => setForm({ ...form, mileage: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Уровень топлива (%)</label>
          <input type="number" min="0" max="100" value={form.fuelLevel} onChange={e => setForm({ ...form, fuelLevel: Number(e.target.value) })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Состояние кузова</label>
          <select value={form.bodyCondition} onChange={e => setForm({ ...form, bodyCondition: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none">
            <option value="excellent">Отличное</option>
            <option value="good">Хорошее</option>
            <option value="fair">Удовлетворительное</option>
            <option value="poor">Плохое</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Обнаруженные неисправности</label>
        <textarea value={form.findings} onChange={e => setForm({ ...form, findings: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm h-20 focus:border-stone-500 focus:outline-none resize-none" />
      </div>
      <div className="mb-5">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Рекомендации</label>
        <textarea value={form.recommendations} onChange={e => setForm({ ...form, recommendations: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm h-20 focus:border-stone-500 focus:outline-none resize-none" />
      </div>

      {/* Photos */}
      <div className="mb-5">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-2 block flex items-center gap-2"><FileImage className="w-3.5 h-3.5" /> Фотографии осмотра</label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {form.photos.map(photo => (
            <div key={photo.id} className="relative group border border-stone-200 overflow-hidden">
              <img src={photo.data} alt="" className="w-full h-24 object-cover" />
              <button onClick={() => removePhoto(photo.id)} className="absolute top-1 right-1 p-1 bg-stone-900 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
              <input type="text" placeholder="Описание" value={photo.description} onChange={e => updatePhotoDesc(photo.id, e.target.value)} className="w-full px-2 py-1 text-[10px] border-t border-stone-200 focus:outline-none" />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-stone-300 cursor-pointer hover:border-stone-500 hover:bg-stone-50 transition-colors">
          <Camera className="w-4 h-4 text-stone-400" />
          <span className="text-xs text-stone-500 uppercase tracking-wide">Загрузить фото</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wider transition-colors">Отмена</button>
        <button onClick={handleSubmit} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wider transition-colors">Сохранить</button>
      </div>
    </div>
  );
}

// Act Form
function ActForm({ data, setData, currentUser, onClose, act }: { data: AppData; setData: (d: AppData) => void; currentUser: User; onClose: () => void; act?: AcceptanceAct }) {
  const [form, setForm] = useState({
    workOrderId: act?.workOrderId || '',
    date: act?.date || new Date().toISOString().split('T')[0],
    clientName: act?.clientName || '',
    carInfo: act?.carInfo || '',
    items: act?.items || [{ id: '1', name: '', quantity: 1, price: 0 }],
    discount: act?.discount || 0,
    discountType: act?.discountType || 'percent' as 'percent' | 'fixed',
    notes: act?.notes || '',
    status: act?.status || 'draft' as AcceptanceAct['status'],
  });

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { id: Date.now().toString(), name: '', quantity: 1, price: 0 }] });
  };

  const updateItem = (idx: number, updates: any) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], ...updates };
    setForm({ ...form, items });
  };

  const removeItem = (idx: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const selectWorkOrder = (woId: string) => {
    const wo = data.workOrders.find(w => w.id === woId);
    if (wo) {
      setForm({
        ...form,
        workOrderId: woId,
        clientName: wo.clientName,
        carInfo: `${wo.carBrand} ${wo.carModel} (${wo.carYear}) ${wo.carPlate}`,
        items: wo.items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
        discount: wo.discount,
        discountType: wo.discountType,
      });
    }
  };

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discountAmt = form.discountType === 'percent' ? subtotal * form.discount / 100 : form.discount;
  const total = subtotal - discountAmt;

  const handleSubmit = () => {
    if (act) {
      setData(updateAcceptanceAct(data, act.id, { ...form, totalAmount: total }));
    } else {
      setData(addAcceptanceAct(data, { ...form, totalAmount: total, createdBy: currentUser.id }));
    }
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{act ? 'Редактировать' : 'Создать'} акт приема-передачи</h3>
        <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
      </div>
      {!act && (
        <div className="mb-4">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Из заказ-наряда</label>
          <select value={form.workOrderId} onChange={e => selectWorkOrder(e.target.value)} className="w-full px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none">
            <option value="">Выберите заказ-наряд...</option>
            {data.workOrders.map(wo => (
              <option key={wo.id} value={wo.id}>{wo.number} — {wo.clientName}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Дата</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Клиент</label>
          <input type="text" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Автомобиль</label>
          <input type="text" value={form.carInfo} onChange={e => setForm({ ...form, carInfo: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
        </div>
      </div>

      {/* Discount */}
      <div className="border border-stone-200 p-4 mb-5 bg-stone-50">
        <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Percent className="w-3.5 h-3.5" /> Скидка</h4>
        <div className="flex items-center gap-3">
          <input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} className="w-24 px-3 py-2 border border-stone-300 text-sm focus:border-stone-500 focus:outline-none" />
          <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} className="px-3 py-2 border border-stone-300 text-sm bg-white focus:border-stone-500 focus:outline-none">
            <option value="percent">%</option>
            <option value="fixed">руб.</option>
          </select>
          {form.discount > 0 && <span className="text-xs text-green-700 font-medium">= −{discountAmt.toFixed(2)} ₽</span>}
        </div>
      </div>

      {/* Items */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Позиции</h4>
          <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-stone-900 text-white hover:bg-stone-800 uppercase tracking-wide transition-colors">
            <Plus className="w-3 h-3" /> Добавить
          </button>
        </div>
        <div className="space-y-2">
          {form.items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 border border-stone-200 p-2 bg-white">
              <input type="text" placeholder="Наименование" value={item.name} onChange={e => updateItem(idx, { name: e.target.value })} className="flex-1 px-2 py-1 border border-stone-300 text-xs focus:border-stone-500 focus:outline-none" />
              <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="w-14 px-2 py-1 border border-stone-300 text-xs text-center focus:border-stone-500 focus:outline-none" />
              <input type="number" min="0" value={item.price} onChange={e => updateItem(idx, { price: Number(e.target.value) })} className="w-24 px-2 py-1 border border-stone-300 text-xs text-right focus:border-stone-500 focus:outline-none" />
              <span className="text-xs text-stone-500 w-20 text-right font-medium">{(item.quantity * item.price).toFixed(0)}₽</span>
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

      <div className="mb-5">
        <label className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Примечания</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-stone-300 text-sm h-20 focus:border-stone-500 focus:outline-none resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
        <button onClick={onClose} className="px-5 py-2.5 text-xs text-stone-700 bg-stone-100 border border-stone-300 hover:bg-stone-200 uppercase tracking-wider transition-colors">Отмена</button>
        <button onClick={handleSubmit} className="px-5 py-2.5 text-xs text-white bg-stone-900 hover:bg-stone-800 uppercase tracking-wider transition-colors">Сохранить</button>
      </div>
    </div>
  );
}
