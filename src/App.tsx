import { useState, useEffect, useCallback } from 'react';
import { AppData, User, SparePart, WorkOrder, Inspection, AcceptanceAct, WorkOrderItem, InspectionPhoto } from './types';
import { loadData, saveData, onSync, addSparePart, updateSparePart, deleteSparePart, importSpareParts, addWorkOrder, updateWorkOrder, deleteWorkOrder, addInspection, updateInspection, addAcceptanceAct, updateAcceptanceAct, exportAllData, importAllData } from './store';
import { generateWorkOrderPDF, generateInspectionPDF, generateAcceptanceActPDF } from './utils/pdf';
import { FileText, Package, ClipboardList, Camera, Users, Download, Upload, Plus, Trash2, Edit, X, Check, ChevronRight, Mail, AlertCircle, FileImage, Percent, DollarSign } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">АвтоСервис</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{currentUser.name} ({currentUser.role === 'admin' ? 'Админ' : 'Менеджер'})</span>
            <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">Выйти</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <nav className="w-56 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-1">
            <NavItem icon={<ClipboardList className="w-4 h-4" />} label="Заказ-наряды" active={currentPage === 'workorders'} onClick={() => setCurrentPage('workorders')} />
            <NavItem icon={<Camera className="w-4 h-4" />} label="Осмотры" active={currentPage === 'inspections'} onClick={() => setCurrentPage('inspections')} />
            <NavItem icon={<FileText className="w-4 h-4" />} label="Акты приема-передачи" active={currentPage === 'acts'} onClick={() => setCurrentPage('acts')} />
            <NavItem icon={<Package className="w-4 h-4" />} label="Каталог запчастей" active={currentPage === 'catalog'} onClick={() => setCurrentPage('catalog')} />
            <NavItem icon={<Users className="w-4 h-4" />} label="Пользователи" active={currentPage === 'users'} onClick={() => setCurrentPage('users')} />
            <NavItem icon={<FileText className="w-4 h-4" />} label="Дашборд" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
          </div>
          <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 p-3 space-y-2">
            <button onClick={() => { const json = exportAllData(data); const blob = new Blob([json], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'autoservice_backup.json'; a.click(); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
              <Download className="w-4 h-4" /> Экспорт данных
            </button>
            <label className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
              <Upload className="w-4 h-4" /> Импорт данных
              <input type="file" accept=".json" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = (ev) => { const result = importAllData(ev.target?.result as string); if (result) setData(result); }; reader.readAsText(file); } }} />
            </label>
          </div>
        </nav>

        <main className="flex-1 min-w-0">
          {currentPage === 'dashboard' && <DashboardPage data={data} />}
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
function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
      {icon} {label}
    </button>
  );
}

// Login Page
function LoginPage({ users, onLogin }: { users: User[]; onLogin: (u: User) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">АвтоСервис</h1>
        </div>
        <p className="text-gray-600 mb-6">Выберите пользователя для входа:</p>
        <div className="space-y-3">
          {users.map(user => (
            <button key={user.id} onClick={() => onLogin(user)} className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{user.name}</div>
                <div className="text-sm text-gray-500">{user.role === 'admin' ? 'Администратор' : 'Менеджер'} • {user.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard
function DashboardPage({ data }: { data: AppData }) {
  const stats = [
    { label: 'Заказ-нарядов', value: data.workOrders.length, color: 'bg-blue-500' },
    { label: 'Осмотров', value: data.inspections.length, color: 'bg-green-500' },
    { label: 'Актов', value: data.acceptanceActs.length, color: 'bg-purple-500' },
    { label: 'Запчастей в каталоге', value: data.spareParts.length, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Дашборд</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className={`w-3 h-3 ${s.color} rounded-full mb-3`}></div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Последние заказ-наряды</h3>
        {data.workOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">Нет заказ-нарядов</p>
        ) : (
          <div className="space-y-2">
            {data.workOrders.slice(-5).reverse().map(wo => (
              <div key={wo.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <span className="font-medium text-gray-900">{wo.number}</span>
                  <span className="text-gray-500 ml-2">{wo.clientName}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${wo.status === 'completed' ? 'bg-green-100 text-green-700' : wo.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : wo.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {wo.status === 'new' ? 'Новый' : wo.status === 'in_progress' ? 'В работе' : wo.status === 'completed' ? 'Завершен' : 'Отменен'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Work Orders Page
function WorkOrdersPage({ data, setData, currentUser, setModal }: { data: AppData; setData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  const [filter, setFilter] = useState('');

  const filtered = data.workOrders.filter(wo =>
    wo.clientName.toLowerCase().includes(filter.toLowerCase()) ||
    wo.number.toLowerCase().includes(filter.toLowerCase()) ||
    wo.carBrand.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Заказ-наряды</h2>
        <button onClick={() => setModal({ type: 'createWorkOrder' })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="w-4 h-4" /> Создать
        </button>
      </div>
      <input type="text" placeholder="Поиск по клиенту, номеру, марке..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full mb-4 px-4 py-2 border border-gray-200 rounded-lg text-sm" />
      <div className="space-y-3">
        {filtered.map(wo => {
          const inspection = data.inspections.find(i => i.workOrderId === wo.id);
          const act = data.acceptanceActs.find(a => a.workOrderId === wo.id);
          const total = wo.items.reduce((s, i) => s + i.quantity * i.price, 0);
          const discountAmt = wo.discountType === 'percent' ? total * wo.discount / 100 : wo.discount;
          return (
            <div key={wo.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{wo.number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${wo.status === 'completed' ? 'bg-green-100 text-green-700' : wo.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' : wo.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                      {wo.status === 'new' ? 'Новый' : wo.status === 'in_progress' ? 'В работе' : wo.status === 'completed' ? 'Завершен' : 'Отменен'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{wo.clientName} • {wo.carBrand} {wo.carModel} ({wo.carYear})</div>
                  <div className="text-sm text-gray-500">Тел: {wo.clientPhone} • {wo.clientEmail}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{(total - discountAmt).toFixed(2)} ₽</div>
                  {wo.discount > 0 && <div className="text-xs text-green-600">Скидка: {wo.discount}{wo.discountType === 'percent' ? '%' : '₽'}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button onClick={() => setModal({ type: 'editWorkOrder', data: wo })} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <Edit className="w-3 h-3" /> Редактировать
                </button>
                {!inspection && (
                  <button onClick={() => setModal({ type: 'confirmInspection', data: wo })} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                    <Camera className="w-3 h-3" /> Осмотр
                  </button>
                )}
                {inspection && (
                  <span className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg">
                    <Check className="w-3 h-3" /> Осмотр выполнен
                  </span>
                )}
                {!act && (
                  <button onClick={() => setModal({ type: 'confirmAct', data: wo })} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                    <FileText className="w-3 h-3" /> Акт
                  </button>
                )}
                {act && (
                  <span className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg">
                    <Check className="w-3 h-3" /> Акт создан
                  </span>
                )}
                <button onClick={() => { const doc = generateWorkOrderPDF(wo); doc.save(`${wo.number}.pdf`); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                  <Download className="w-3 h-3" /> PDF
                </button>
                <button onClick={() => { const doc = generateWorkOrderPDF(wo); const blob = doc.output('blob'); const url = URL.createObjectURL(blob); const mailto = `mailto:${wo.clientEmail}?subject=Заказ-наряд ${wo.number}&body=Здравствуйте! Направляю вам заказ-наряд ${wo.number}.`; window.open(mailto); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100">
                  <Mail className="w-3 h-3" /> Email
                </button>
                <button onClick={() => { if (confirm('Удалить заказ-наряд?')) setData(deleteWorkOrder(data, wo.id)); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-gray-500 text-center py-8">Нет заказ-нарядов</p>}
      </div>
    </div>
  );
}

// Catalog Page
function CatalogPage({ data, setData, currentUser, setModal }: { data: AppData; setData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  const [filter, setFilter] = useState('');
  const isAdmin = currentUser.role === 'admin';

  const filtered = data.spareParts.filter(p =>
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.article.toLowerCase().includes(filter.toLowerCase()) ||
    p.brand.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Каталог запчастей</h2>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setModal({ type: 'importParts' })} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              <Upload className="w-4 h-4" /> Импорт
            </button>
            <button onClick={() => setModal({ type: 'createPart' })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <Plus className="w-4 h-4" /> Добавить
            </button>
          </div>
        )}
      </div>
      {!isAdmin && <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Только администратор может управлять каталогом</div>}
      <input type="text" placeholder="Поиск по названию, артикулу, бренду..." value={filter} onChange={e => setFilter(e.target.value)} className="w-full mb-4 px-4 py-2 border border-gray-200 rounded-lg text-sm" />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Артикул</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Название</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Бренд</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Категория</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Цена</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Кол-во</th>
              {isAdmin && <th className="text-right px-4 py-3 font-medium text-gray-600">Действия</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-mono text-xs">{p.article}</td>
                <td className="px-4 py-3 text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.brand}</td>
                <td className="px-4 py-3 text-gray-600">{p.category}</td>
                <td className="px-4 py-3 text-right text-gray-900">{p.price.toFixed(2)} ₽</td>
                <td className="px-4 py-3 text-right text-gray-900">{p.quantity}</td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setModal({ type: 'editPart', data: p })} className="p-1 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { if (confirm('Удалить?')) setData(deleteSparePart(data, p.id)); }} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-gray-500 text-center py-8">Каталог пуст</p>}
      </div>
    </div>
  );
}

// Inspections Page
function InspectionsPage({ data, setData, currentUser, setModal }: { data: AppData; setData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Осмотры</h2>
        <button onClick={() => setModal({ type: 'createInspection' })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="w-4 h-4" /> Создать
        </button>
      </div>
      <div className="space-y-3">
        {data.inspections.map(insp => {
          const wo = data.workOrders.find(w => w.id === insp.workOrderId);
          return (
            <div key={insp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900 mb-1">Осмотр от {new Date(insp.date).toLocaleDateString('ru-RU')}</div>
                  {wo && <div className="text-sm text-gray-600">Заказ: {wo.number} • {wo.clientName} • {wo.carBrand} {wo.carModel}</div>}
                  <div className="text-sm text-gray-500 mt-1">Пробег: {insp.mileage} км • Топливо: {insp.fuelLevel}% • Кузов: {insp.bodyCondition}</div>
                  <div className="text-sm text-gray-500 mt-1">Фото: {insp.photos.length} шт.</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModal({ type: 'editInspection', data: insp })} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <Edit className="w-3 h-3" /> Редактировать
                  </button>
                  <button onClick={() => { const doc = generateInspectionPDF(insp, wo); doc.save(`Осмотр_${wo?.number || insp.id}.pdf`); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {data.inspections.length === 0 && <p className="text-gray-500 text-center py-8">Нет осмотров</p>}
      </div>
    </div>
  );
}

// Acts Page
function ActsPage({ data, setData, currentUser, setModal }: { data: AppData; setData: (d: AppData) => void; currentUser: User; setModal: (m: any) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Акты приема-передачи</h2>
        <button onClick={() => setModal({ type: 'createAct' })} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          <Plus className="w-4 h-4" /> Создать
        </button>
      </div>
      <div className="space-y-3">
        {data.acceptanceActs.map(act => {
          const wo = data.workOrders.find(w => w.id === act.workOrderId);
          const subtotal = act.items.reduce((s, i) => s + i.quantity * i.price, 0);
          const discountAmt = act.discountType === 'percent' ? subtotal * act.discount / 100 : act.discount;
          return (
            <div key={act.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-gray-900 mb-1">Акт от {new Date(act.date).toLocaleDateString('ru-RU')}</div>
                  {wo && <div className="text-sm text-gray-600">Заказ: {wo.number} • {act.clientName}</div>}
                  <div className="text-sm text-gray-500 mt-1">Сумма: {act.totalAmount.toFixed(2)} ₽ {act.discount > 0 && `(скидка: ${act.discount}${act.discountType === 'percent' ? '%' : '₽'})`}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setModal({ type: 'editAct', data: act })} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <Edit className="w-3 h-3" /> Редактировать
                  </button>
                  <button onClick={() => { const doc = generateAcceptanceActPDF(act, wo); doc.save(`Акт_${wo?.number || act.id}.pdf`); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                    <Download className="w-3 h-3" /> PDF
                  </button>
                  <button onClick={() => { const doc = generateAcceptanceActPDF(act, wo); const blob = doc.output('blob'); const mailto = `mailto:${wo?.clientEmail || ''}?subject=Акт приема-передачи ${wo?.number || ''}`; window.open(mailto); }} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100">
                    <Mail className="w-3 h-3" /> Email
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {data.acceptanceActs.length === 0 && <p className="text-gray-500 text-center py-8">Нет актов</p>}
      </div>
    </div>
  );
}

// Users Page
function UsersPage({ data }: { data: AppData }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Пользователи</h2>
      <div className="space-y-3">
        {data.users.map(u => (
          <div key={u.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900">{u.name}</div>
              <div className="text-sm text-gray-500">{u.email}</div>
              <div className="text-xs text-gray-400 mt-1">
                {u.role === 'admin' ? '🔑 Полный доступ (вкл. каталог запчастей)' : '📋 Менеджер (заказ-наряды, осмотры, акты)'}
              </div>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={close}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">{order ? 'Редактировать' : 'Создать'} заказ-наряд</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">ФИО клиента *</label>
          <input type="text" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Телефон *</label>
          <input type="text" value={form.clientPhone} onChange={e => setForm({ ...form, clientPhone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
          <input type="email" value={form.clientEmail} onChange={e => setForm({ ...form, clientEmail: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Статус</label>
          <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="new">Новый</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Завершен</option>
            <option value="cancelled">Отменен</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Марка *</label>
          <input type="text" value={form.carBrand} onChange={e => setForm({ ...form, carBrand: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Модель *</label>
          <input type="text" value={form.carModel} onChange={e => setForm({ ...form, carModel: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Год</label>
          <input type="text" value={form.carYear} onChange={e => setForm({ ...form, carYear: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Гос. номер</label>
          <input type="text" value={form.carPlate} onChange={e => setForm({ ...form, carPlate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">VIN</label>
          <input type="text" value={form.vin} onChange={e => setForm({ ...form, vin: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>

      {/* Discount */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><Percent className="w-4 h-4" /> Скидка</h4>
        <div className="flex items-center gap-3">
          <input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="percent">%</option>
            <option value="fixed">руб.</option>
          </select>
          {form.discount > 0 && <span className="text-sm text-green-600">= -{discountAmt.toFixed(2)} ₽</span>}
        </div>
      </div>

      {/* Items */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Работы и запчасти</h4>
          <div className="flex gap-2">
            {data.spareParts.length > 0 && (
              <div className="relative group">
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100">
                  <Package className="w-3 h-3" /> Из каталога
                </button>
                <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-10 max-h-60 overflow-y-auto">
                  {data.spareParts.map(p => (
                    <button key={p.id} onClick={() => addFromCatalog(p)} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-100">
                      <span className="font-medium">{p.name}</span> <span className="text-gray-400">({p.article})</span> — {p.price}₽
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
              <Plus className="w-3 h-3" /> Добавить
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {form.items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
              <select value={item.type} onChange={e => updateItem(idx, { type: e.target.value as any })} className="px-2 py-1 border border-gray-200 rounded text-xs w-20">
                <option value="work">Работа</option>
                <option value="part">Запчасть</option>
              </select>
              <input type="text" placeholder="Название" value={item.name} onChange={e => updateItem(idx, { name: e.target.value })} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" />
              <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="w-14 px-2 py-1 border border-gray-200 rounded text-xs text-center" />
              <input type="number" min="0" value={item.price} onChange={e => updateItem(idx, { price: Number(e.target.value) })} className="w-24 px-2 py-1 border border-gray-200 rounded text-xs text-right" />
              <span className="text-xs text-gray-500 w-20 text-right">{(item.quantity * item.price).toFixed(0)}₽</span>
              <button onClick={() => removeItem(idx)} className="p-1 text-gray-400 hover:text-red-600"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 text-right text-sm">
          <span className="text-gray-500">Подитог: </span><span className="font-medium">{subtotal.toFixed(2)} ₽</span>
          {form.discount > 0 && <><span className="text-gray-500 ml-3">Скидка: </span><span className="text-green-600">-{discountAmt.toFixed(2)} ₽</span></>}
          <span className="text-gray-500 ml-3">Итого: </span><span className="font-bold text-lg">{(subtotal - discountAmt).toFixed(2)} ₽</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-1 block">Примечания</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20" />
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Отмена</button>
        <button onClick={handleSubmit} disabled={!form.clientName || !form.carBrand} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">Сохранить</button>
      </div>
    </div>
  );
}

// Confirm Inspection Dialog
function ConfirmInspection({ data, setData, currentUser, onClose, order }: { data: AppData; setData: (d: AppData) => void; currentUser: User; onClose: () => void; order: WorkOrder }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Создать осмотр?</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">Заказ-наряд: <strong>{order.number}</strong></p>
        <p className="text-sm text-blue-700">Клиент: {order.clientName} • {order.carBrand} {order.carModel}</p>
      </div>
      <p className="text-sm text-gray-600 mb-6">Хотите создать акт осмотра для этого заказ-наряда? Осмотр позволит зафиксировать состояние автомобиля с фотографиями.</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Нет, позже</button>
        <button onClick={() => {
          setData(addInspection(data, {
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
          }));
          setData(updateWorkOrder(data, order.id, { inspectionId: data.inspections.length > 0 ? data.inspections[data.inspections.length - 1]?.id : '' }));
          onClose();
        }} className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">Да, создать осмотр</button>
      </div>
    </div>
  );
}

// Confirm Act Dialog
function ConfirmAct({ data, setData, currentUser, onClose, order }: { data: AppData; setData: (d: AppData) => void; currentUser: User; onClose: () => void; order: WorkOrder }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">Создать акт приема-передачи?</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-purple-800">Заказ-наряд: <strong>{order.number}</strong></p>
        <p className="text-sm text-purple-700">Клиент: {order.clientName} • {order.carBrand} {order.carModel}</p>
      </div>
      <p className="text-sm text-gray-600 mb-6">Хотите создать акт приема-передачи для этого заказ-наряда?</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Нет, позже</button>
        <button onClick={() => {
          const totalAmount = order.items.reduce((s, i) => s + i.quantity * i.price, 0);
          setData(addAcceptanceAct(data, {
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
          }));
          onClose();
        }} className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700">Да, создать акт</button>
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">{part ? 'Редактировать' : 'Добавить'} запчасть</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Артикул *</label>
          <input type="text" value={form.article} onChange={e => setForm({ ...form, article: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Название *</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Бренд</label>
          <input type="text" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Категория</label>
          <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Цена *</label>
          <input type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Количество</label>
          <input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Поставщик</label>
          <input type="text" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Отмена</button>
        <button onClick={handleSubmit} disabled={!form.article || !form.name} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">Сохранить</button>
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Импорт запчастей</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-1 block">Загрузить файл (CSV или JSON)</label>
        <input type="file" accept=".csv,.json,.txt" onChange={handleFileImport} className="w-full text-sm" />
      </div>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs font-medium text-gray-600">Формат:</label>
          <select value={format} onChange={e => setFormat(e.target.value as any)} className="px-2 py-1 border border-gray-200 rounded text-xs">
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <textarea value={textData} onChange={e => setTextData(e.target.value)} placeholder={format === 'csv' ? 'артикул;название;бренд;цена;количество;категория\nBR001;Колодки тормозные;Brembo;2500;10;Тормоза' : '[{"article":"BR001","name":"Колодки","brand":"Brembo","price":2500,"quantity":10,"category":"Тормоза"}]'} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-40 font-mono" />
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Отмена</button>
        <button onClick={handleImport} disabled={!textData} className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">Импортировать</button>
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
      const newInsp = addInspection(data, { ...form, createdBy: currentUser.id });
      if (form.workOrderId) {
        // Link to work order
      }
    }
    onClose();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">{inspection ? 'Редактировать' : 'Создать'} осмотр</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Заказ-наряд</label>
          <select value={form.workOrderId} onChange={e => setForm({ ...form, workOrderId: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">Выберите...</option>
            {data.workOrders.map(wo => (
              <option key={wo.id} value={wo.id}>{wo.number} — {wo.clientName} ({wo.carBrand} {wo.carModel})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Дата</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Пробег (км)</label>
          <input type="number" min="0" value={form.mileage} onChange={e => setForm({ ...form, mileage: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Уровень топлива (%)</label>
          <input type="number" min="0" max="100" value={form.fuelLevel} onChange={e => setForm({ ...form, fuelLevel: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Состояние кузова</label>
          <select value={form.bodyCondition} onChange={e => setForm({ ...form, bodyCondition: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="excellent">Отличное</option>
            <option value="good">Хорошее</option>
            <option value="fair">Удовлетворительное</option>
            <option value="poor">Плохое</option>
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-1 block">Обнаруженные неисправности</label>
        <textarea value={form.findings} onChange={e => setForm({ ...form, findings: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20" />
      </div>
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-1 block">Рекомендации</label>
        <textarea value={form.recommendations} onChange={e => setForm({ ...form, recommendations: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20" />
      </div>

      {/* Photos */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-2 block flex items-center gap-2"><FileImage className="w-4 h-4" /> Фотографии осмотра</label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {form.photos.map(photo => (
            <div key={photo.id} className="relative group border border-gray-200 rounded-lg overflow-hidden">
              <img src={photo.data} alt="" className="w-full h-24 object-cover" />
              <button onClick={() => removePhoto(photo.id)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
              <input type="text" placeholder="Описание" value={photo.description} onChange={e => updatePhotoDesc(photo.id, e.target.value)} className="w-full px-2 py-1 text-xs border-t border-gray-200" />
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
          <Camera className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Загрузить фото</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Отмена</button>
        <button onClick={handleSubmit} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Сохранить</button>
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">{act ? 'Редактировать' : 'Создать'} акт приема-передачи</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
      </div>
      {!act && (
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Из заказ-наряда</label>
          <select value={form.workOrderId} onChange={e => selectWorkOrder(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">Выберите заказ-наряд...</option>
            {data.workOrders.map(wo => (
              <option key={wo.id} value={wo.id}>{wo.number} — {wo.clientName}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Дата</label>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Клиент</label>
          <input type="text" value={form.clientName} onChange={e => setForm({ ...form, clientName: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Автомобиль</label>
          <input type="text" value={form.carInfo} onChange={e => setForm({ ...form, carInfo: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>

      {/* Discount */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2"><Percent className="w-4 h-4" /> Скидка</h4>
        <div className="flex items-center gap-3">
          <input type="number" min="0" value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as any })} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="percent">%</option>
            <option value="fixed">руб.</option>
          </select>
          {form.discount > 0 && <span className="text-sm text-green-600">= -{discountAmt.toFixed(2)} ₽</span>}
        </div>
      </div>

      {/* Items */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Позиции</h4>
          <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
            <Plus className="w-3 h-3" /> Добавить
          </button>
        </div>
        <div className="space-y-2">
          {form.items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-2">
              <input type="text" placeholder="Наименование" value={item.name} onChange={e => updateItem(idx, { name: e.target.value })} className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs" />
              <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="w-14 px-2 py-1 border border-gray-200 rounded text-xs text-center" />
              <input type="number" min="0" value={item.price} onChange={e => updateItem(idx, { price: Number(e.target.value) })} className="w-24 px-2 py-1 border border-gray-200 rounded text-xs text-right" />
              <span className="text-xs text-gray-500 w-20 text-right">{(item.quantity * item.price).toFixed(0)}₽</span>
              <button onClick={() => removeItem(idx)} className="p-1 text-gray-400 hover:text-red-600"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
        <div className="mt-3 text-right text-sm">
          <span className="text-gray-500">Подитог: </span><span className="font-medium">{subtotal.toFixed(2)} ₽</span>
          {form.discount > 0 && <><span className="text-gray-500 ml-3">Скидка: </span><span className="text-green-600">-{discountAmt.toFixed(2)} ₽</span></>}
          <span className="text-gray-500 ml-3">Итого: </span><span className="font-bold text-lg">{total.toFixed(2)} ₽</span>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs font-medium text-gray-600 mb-1 block">Примечания</label>
        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-20" />
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Отмена</button>
        <button onClick={handleSubmit} className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700">Сохранить</button>
      </div>
    </div>
  );
}
