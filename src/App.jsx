import React, { useState, useRef, useEffect } from 'react';
import { 
  Database, LayoutDashboard, Wrench, Users, ClipboardList, BarChart3, Settings,
  Menu, X, Upload, Edit, Save, Trash2, Image as ImageIcon, Building2,
  MapPin, Store, Hash, Map, Plus, MousePointer2, Printer, PackageSearch,
  CheckCircle2, UserCircle, Lock, LogOut, Loader2, Network, Server, Monitor, HardDrive, RefreshCw,
  Move, Crosshair, Map as MapIcon, Download, FileText, PhoneCall, Contact2, AlertCircle
} from 'lucide-react';

const MENUS = [
  { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'site_survey', name: 'Site Survey', icon: <Map size={20} /> },
  { id: 'layout', name: 'Layout', icon: <MapPin size={20} /> },
  { id: 'prepare', name: 'Prepare', icon: <Settings size={20} /> },
  { id: 'inventory', name: 'Inventory', icon: <PackageSearch size={20} /> },
  { id: 'follow_up', name: 'Follow Up', icon: <PhoneCall size={20} /> },
  { id: 'database', name: 'Database', icon: <Database size={20} /> }
];

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzAuVj7tIBnQho81leMwb97mMSGkT6wZvqGn9EjWoljxG3685a6SnXnRVjkATmrxN2GWA/exec"; 

const compressImage = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 600; 
      let { width, height } = img;
      
      if (width > height) {
        if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
      } else {
        if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.5));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }
  return <MainLayout currentUser={currentUser} onLogout={() => setCurrentUser(null)} />;
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if(SCRIPT_URL === "ใส่_WEB_APP_URL_ของคุณที่นี่" || SCRIPT_URL === "") {
         throw new Error("กรุณานำ SCRIPT URL มาใส่ในโค้ดบรรทัดที่ 20 ก่อนครับ");
      }
      const response = await fetch(`${SCRIPT_URL}?action=getUsers`);
      const result = await response.json();

      if (result.status === 'success') {
        const user = result.data.find(u => u.username.toString() === username && u.password.toString() === password);
        if (user) {
          const { password, ...safeUser } = user;
          onLogin(safeUser);
        } else {
          setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
      } else {
        setError('ไม่สามารถโหลดข้อมูล: ' + result.message);
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-800 p-8 text-center">
          <Database className="mx-auto h-12 w-12 text-blue-400 mb-3" />
          <h2 className="text-2xl font-bold text-white">ESL Management System</h2>
        </div>
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="text" 
                  required 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-blue-500" 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:border-blue-500" 
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold flex justify-center">
              {isLoading ? <Loader2 className="animate-spin" /> : 'เข้าสู่ระบบ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MainLayout({ currentUser, onLogout }) {
  const [activeMenu, setActiveMenu] = useState('dashboard'); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [equipments, setEquipments] = useState([]);
  const [stores, setStores] = useState([]);
  const [globalInventories, setGlobalInventories] = useState({});
  const [prepareGateways, setPrepareGateways] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]); 
  const [contactRecords, setContactRecords] = useState([]); 
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [alertConfig, setAlertConfig] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [promptConfig, setPromptConfig] = useState(null); 

  const showAlert = (message) => setAlertConfig({ message });
  const showConfirm = (message, onConfirm) => setConfirmConfig({ message, onConfirm });
  const showPrompt = (message, defaultValue, onConfirm) => setPromptConfig({ message, defaultValue, onConfirm });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${SCRIPT_URL}?action=getInitialData`);
        const result = await res.json();
        if(result.status === 'success') {
          setEquipments(result.equipments || []);
          setStores(result.stores || []);
          setPrepareGateways(result.prepareGateways || []);
          setBorrowRecords(result.borrowRecords || []); 
          setContactRecords(result.contactRecords || []); 
          
          const invMap = {};
          if (result.inventory) {
            result.inventory.forEach(item => {
              if(!invMap[item.storeId]) invMap[item.storeId] = { items: [], layoutImage: null, areas: [] };
              invMap[item.storeId].items.push({
                id: item.id,
                equipmentId: item.equipmentId,
                deliveredQty: parseInt(item.deliveredQty) || 0,
                currentBalance: parseInt(item.currentBalance) || 0
              });
            });
          }
          if (result.layouts) {
            result.layouts.forEach(layout => {
              if(!invMap[layout.storeId]) invMap[layout.storeId] = { items: [], layoutImage: null, areas: [] };
              invMap[layout.storeId].layoutImage = layout.layoutImage;
              try { 
                invMap[layout.storeId].areas = layout.areasJson ? JSON.parse(layout.areasJson) : []; 
              } catch(e) { 
                invMap[layout.storeId].areas = []; 
              }
            });
          }
          setGlobalInventories(invMap);
        }
      } catch (err) {
        showAlert("ไม่สามารถโหลดข้อมูลฐานข้อมูลได้: " + err.message);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const executeApi = async (action, data) => {
    try {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, data })
      });
      const result = await response.json();
      if(result.status !== 'success') throw new Error(result.message);
      return result;
    } catch (err) {
      showAlert("เกิดข้อผิดพลาด: " + err.message);
      return false;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 w-full overflow-hidden">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .page-break { page-break-before: always; }
          .print-table th { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }
        }
        .print-only { display: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {alertConfig && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center">
            <p className="text-gray-800 text-lg mb-6 whitespace-pre-line leading-relaxed">{alertConfig.message}</p>
            <button onClick={() => setAlertConfig(null)} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-lg font-medium w-full">ตกลง</button>
          </div>
        </div>
      )}

      {confirmConfig && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center">
            <p className="text-gray-800 text-lg mb-6 whitespace-pre-line leading-relaxed">{confirmConfig.message}</p>
            <div className="flex gap-3">
              <button 
                onClick={() => { confirmConfig.onConfirm(); setConfirmConfig(null); }} 
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 transition-colors text-white rounded-lg font-medium"
              >
                ยืนยัน
              </button>
              <button 
                onClick={() => setConfirmConfig(null)} 
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 rounded-lg font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {promptConfig && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full text-center">
            <p className="text-gray-800 text-lg mb-4 whitespace-pre-line leading-relaxed">{promptConfig.message}</p>
            <input 
              type="number" 
              step="0.01"
              autoFocus 
              id="prompt-input"
              defaultValue={promptConfig.defaultValue}
              className="w-full text-center px-4 py-3 border rounded-lg outline-none focus:border-blue-500 text-lg font-bold mb-6 bg-gray-50"
              placeholder="ระบุตัวเลข (เช่น 12.30)"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => { 
                  const val = document.getElementById('prompt-input').value;
                  promptConfig.onConfirm(val); 
                  setPromptConfig(null); 
                }} 
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-lg font-medium"
              >
                ตกลง
              </button>
              <button 
                onClick={() => setPromptConfig(null)} 
                className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 rounded-lg font-medium"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
      
      <aside className="hidden md:flex flex-col w-64 bg-slate-800 text-white shadow-xl z-20 no-print flex-shrink-0">
        <div className="p-5 text-2xl font-bold border-b border-slate-700 flex items-center gap-2">
          <Database className="text-blue-400" /> ESL System
        </div>
        <div className="px-5 py-4 bg-slate-900 flex items-center gap-3 border-b border-slate-700">
          <UserCircle size={32} className="text-blue-400" />
          <div className="overflow-hidden">
            <div className="text-sm font-bold leading-tight truncate">{currentUser?.username}</div>
            <div className="text-xs text-slate-400 truncate">{currentUser?.role}</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {MENUS.map((menu) => (
            <button 
              key={menu.id} 
              onClick={() => setActiveMenu(menu.id)} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeMenu === menu.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              {menu.icon} <span className="font-medium">{menu.name}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700">
           <button onClick={onLogout} className="w-full flex justify-center gap-2 px-4 py-2 text-slate-300 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
             <LogOut size={18} /> ออกจากระบบ
           </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-800 text-white z-50 flex flex-col no-print">
          <div className="flex justify-between items-center p-4 border-b border-slate-700">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Database className="text-blue-400" /> ESL System
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-700 rounded-lg">
              <X size={24} />
            </button>
          </div>
          <div className="px-5 py-4 bg-slate-900 flex items-center gap-3 border-b border-slate-700">
            <UserCircle size={32} className="text-blue-400" />
            <div>
              <div className="text-sm font-bold leading-tight">{currentUser?.username}</div>
              <div className="text-xs text-slate-400">{currentUser?.role}</div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
            {MENUS.map((menu) => (
              <button
                key={menu.id}
                onClick={() => {
                  setActiveMenu(menu.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  activeMenu === menu.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {menu.icon}
                <span className="font-medium">{menu.name}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-700">
             <button onClick={onLogout} className="w-full flex justify-center gap-2 px-4 py-2 text-slate-300 hover:bg-red-500 hover:text-white rounded-lg transition-colors">
               <LogOut size={18} /> ออกจากระบบ
             </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden bg-slate-800 text-white shadow-sm px-4 py-3 flex items-center justify-between no-print flex-shrink-0 z-30">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Database className="text-blue-400" size={20} /> ESL System
          </div>
          <button className="p-1" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </header>

        <header className="hidden md:flex bg-white shadow-sm px-6 py-4 items-center justify-between no-print flex-shrink-0 z-10 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 capitalize flex items-center gap-2">
            {MENUS.find(m => m.id === activeMenu)?.name}
          </h1>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 print-area bg-gray-50 no-scrollbar">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center h-full text-blue-600 gap-3">
              <Loader2 size={48} className="animate-spin" />
              <p className="font-medium">กำลังซิงค์ข้อมูลกับ Google Sheet...</p>
            </div>
          ) : (
            <>
              {activeMenu === 'database' && (
                <DatabaseMenu 
                  equipments={equipments} setEquipments={setEquipments} 
                  stores={stores} setStores={setStores} 
                  executeApi={executeApi} showAlert={showAlert} showConfirm={showConfirm} 
                />
              )}
              {activeMenu === 'site_survey' && (
                <SiteSurveyMenu 
                  equipments={equipments} stores={stores} 
                  showAlert={showAlert} showConfirm={showConfirm} 
                />
              )}
              {activeMenu === 'inventory' && (
                <InventoryMenu 
                  equipments={equipments} stores={stores} 
                  inventories={globalInventories} setInventories={setGlobalInventories}
                  currentUser={currentUser} executeApi={executeApi} 
                  showAlert={showAlert} showConfirm={showConfirm} 
                />
              )}
              {activeMenu === 'prepare' && (
                <PrepareMenu 
                  equipments={equipments} stores={stores} executeApi={executeApi} 
                  prepareGateways={prepareGateways} setPrepareGateways={setPrepareGateways}
                  showAlert={showAlert} showConfirm={showConfirm} 
                />
              )}
              {activeMenu === 'layout' && (
                <LayoutMenu showAlert={showAlert} showPrompt={showPrompt} showConfirm={showConfirm} />
              )}
              {activeMenu === 'follow_up' && (
                <FollowUpMenu 
                  stores={stores} currentUser={currentUser} executeApi={executeApi}
                  borrowRecords={borrowRecords} setBorrowRecords={setBorrowRecords}
                  contactRecords={contactRecords} setContactRecords={setContactRecords}
                  showAlert={showAlert} showConfirm={showConfirm}
                />
              )}
              {activeMenu === 'dashboard' && (
                <DashboardMenu 
                  stores={stores} 
                  equipments={equipments} 
                  inventories={globalInventories} 
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ==========================================
// เมนู 1: Dashboard Menu (ภาพรวมระบบ)
// ==========================================
function DashboardMenu({ stores, equipments, inventories }) {
  const companies = [...new Set(stores.map(s => s.company))];
  const totalCompanies = companies.length;
  const totalBranches = stores.length;
  
  const companyBranchCounts = companies.reduce((acc, company) => {
    acc[company] = stores.filter(s => s.company === company).length;
    return acc;
  }, {});

  // รายการอุปกรณ์ที่ต้องการโฟกัสในตาราง
  const targetEquipments = [
    'ESL Newton Size 1.6"',
    'ESL Newton Size 2.2"',
    'ESL Newton Size 2.6"',
    'ESL Newton Size 2.6" (Freezer)',
    'ESL Newton Size 4.2"',
    'ESL Newton Core Size 3.5"',
    'ESL Newton Core Size 3.5" (Freezer)',
    'ESL Newton Core Size 6.1"',
    'ESL Newton Core Size 12.2"',
    'ESL Newton Size 13.3" (Full Color)'
  ];

  // ดึง 3 สาขาล่าสุดที่มีการอัปเดตสต๊อก
  const storeUpdates = Object.keys(inventories).map(storeId => {
    const items = inventories[storeId].items || [];
    let maxDate = 0;
    items.forEach(item => {
        const d = new Date(item.lastUpdated || 0).getTime();
        if(d > maxDate) maxDate = d;
    });
    return { storeId, maxDate, items };
  }).filter(s => s.items.length > 0);
  
  // เรียงลำดับจากอัปเดตล่าสุด
  storeUpdates.sort((a, b) => b.maxDate - a.maxDate);
  const top3Stores = storeUpdates.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ส่วนที่ 1: การ์ดสรุปตัวเลข ปรับดีไซน์ใหม่ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* กล่อง 1: บริษัททั้งหมด */}
        <div className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-t-blue-500 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 text-blue-500 rounded-full mb-3"><Building2 size={32}/></div>
          <p className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider text-center">บริษัททั้งหมด (Companies)</p>
          <p className="text-7xl font-extrabold text-blue-600">{totalCompanies}</p>
        </div>

        {/* กล่อง 2: สาขาทั้งหมด */}
        <div className="bg-white p-8 rounded-xl shadow-sm border-t-4 border-t-green-500 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
          <div className="p-4 bg-green-50 text-green-500 rounded-full mb-3"><Store size={32}/></div>
          <p className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider text-center">สาขาทั้งหมด (Branches)</p>
          <p className="text-7xl font-extrabold text-green-600">{totalBranches}</p>
        </div>

        {/* กล่อง 3: สรุปข้อมูลสาขาตามบริษัท (ขยายพื้นที่ให้กว้างขึ้นเป็น 2 คอลัมน์) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col hover:shadow-md transition-shadow h-full">
           <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-3">
             <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><BarChart3 size={20}/></div>
             <h3 className="text-md font-bold text-gray-800">สรุปข้อมูลสาขาตามบริษัท</h3>
           </div>
           {/* จัดเรียงเป็น Grid แบบ 2 คอลัมน์ เพื่อความสวยงามและอ่านง่าย */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 flex-1 content-start">
             {Object.keys(companyBranchCounts).map(comp => (
               <div key={comp} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                 <span className="font-bold text-gray-700 truncate mr-2" title={comp}>{comp}</span>
                 <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold text-xs whitespace-nowrap">
                   {companyBranchCounts[comp]} สาขา
                 </span>
               </div>
             ))}
             {Object.keys(companyBranchCounts).length === 0 && <span className="text-gray-400 text-sm py-2 pl-2">ยังไม่มีข้อมูล</span>}
           </div>
        </div>
      </div>

      {/* ส่วนที่ 2: ตารางภาพรวมการติดตั้ง */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
          <PackageSearch size={22} className="text-blue-600"/> ตารางภาพรวมการติดตั้ง <span className="text-sm font-normal text-gray-500 ml-2">(แสดง 3 สาขาล่าสุด)</span>
        </h2>
        
        {top3Stores.length > 0 ? top3Stores.map((storeData) => {
          const storeInfo = stores.find(s => s.id === storeData.storeId);
          if (!storeInfo) return null;
          
          // กรองเฉพาะอุปกรณ์ที่อยู่ใน targetEquipments
          const filteredItems = storeData.items.filter(item => {
             const eq = equipments.find(e => e.id === item.equipmentId);
             return eq && targetEquipments.includes(eq.name);
          });

          // ซ่อนตารางสาขานั้นไปเลย ถ้าไม่มีอุปกรณ์ที่ตรงกับ Target List
          if (filteredItems.length === 0) return null; 

          return (
            <div key={storeData.storeId} className="border border-gray-200 rounded-xl overflow-hidden mb-6 shadow-sm">
              <div className="bg-slate-800 text-white px-5 py-3 font-bold text-md flex items-center gap-2">
                <Store size={18} className="text-blue-400"/> {storeInfo.company} - {storeInfo.branchNumber} - {storeInfo.branch}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 whitespace-nowrap">
                    <tr>
                      <th className="px-4 py-3 text-center w-16">ลำดับ</th>
                      <th className="px-4 py-3 text-center w-24">รูปภาพ</th>
                      <th className="px-4 py-3">ชื่ออุปกรณ์</th>
                      <th className="px-4 py-3 text-right">จำนวนจัดส่ง</th>
                      <th className="px-4 py-3 text-right">ยอดคงเหลือ</th>
                      <th className="px-4 py-3 text-center w-36">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredItems.map((item, idx) => {
                      const eq = equipments.find(e => e.id === item.equipmentId);
                      // คำนวณสถานะ: ถ้ายอดคงเหลือน้อยกว่าหรือเท่ากับ 10% ของจำนวนจัดส่ง = ใกล้หมด
                      const isLow = item.currentBalance <= (item.deliveredQty * 0.1);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-center text-gray-500 font-medium">{idx + 1}</td>
                          <td className="px-4 py-3 text-center">
                            {eq?.image ? (
                              <img src={eq.image} className="w-12 h-12 object-cover rounded mx-auto border bg-white" alt="Equipment" />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded flex justify-center items-center mx-auto text-gray-400">
                                <ImageIcon size={18}/>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-800">{eq?.name}</td>
                          <td className="px-4 py-3 text-right text-gray-600 font-mono">{item.deliveredQty.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-blue-700">{item.currentBalance.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            {isLow ? (
                              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold w-full max-w-[120px]">
                                <AlertCircle size={14}/> ใกล้หมด
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold w-full max-w-[120px]">
                                <CheckCircle2 size={14}/> ปกติ
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center">
            <PackageSearch size={40} className="mb-3 text-gray-300"/>
            <p>ยังไม่มีข้อมูลการติดตั้งในระบบ</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// เมนู 6: Follow Up Menu (ติดตามอุปกรณ์ / Borrow / Contact)
// ==========================================
function FollowUpMenu({ stores, currentUser, executeApi, borrowRecords, setBorrowRecords, contactRecords, setContactRecords, showAlert, showConfirm }) {
  const [activeTab, setActiveTab] = useState('borrow');

  const tabs = [
    { id: 'borrow', name: 'Borrow (ยืมอุปกรณ์)', icon: <ClipboardList size={18} /> },
    { id: 'contact', name: 'Contact (ข้อมูลผู้ติดต่อ)', icon: <Users size={18} /> }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`px-6 py-3 font-bold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.icon} {tab.name}
          </button>
        ))}
      </div>
      
      {activeTab === 'borrow' && (
        <BorrowTab 
          stores={stores} currentUser={currentUser} executeApi={executeApi}
          borrowRecords={borrowRecords} setBorrowRecords={setBorrowRecords}
          showAlert={showAlert} showConfirm={showConfirm}
        />
      )}
      {activeTab === 'contact' && (
        <ContactTab 
          stores={stores} executeApi={executeApi}
          contactRecords={contactRecords} setContactRecords={setContactRecords}
          showAlert={showAlert} showConfirm={showConfirm}
        />
      )}
    </div>
  );
}

// ------------------------------------------
// Follow Up -> แท็บ Contact (ข้อมูลผู้ติดต่อ)
// ------------------------------------------
function ContactTab({ stores, executeApi, contactRecords, setContactRecords, showAlert, showConfirm }) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  const currentBranch = stores.find(s => s.id === selectedBranchId);
  const branchNumber = currentBranch ? currentBranch.branchNumber : '';
  const uniqueCompanies = [...new Set(stores.map(s => s.company))];
  const filteredBranches = stores.filter(s => s.company === selectedCompany);

  const [isSaving, setIsSaving] = useState(false);

  const initialForm = { id: '', storeId: '', customerName: '', position: '', phoneNumber: '' };
  const [form, setForm] = useState(initialForm);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedBranchId) {
      showAlert('กรุณาเลือกสาขาที่ต้องการบันทึกข้อมูล');
      return;
    }
    
    setIsSaving(true);
    const payload = {
      ...form,
      storeId: selectedBranchId,
      lastUpdated: new Date().toISOString()
    };

    const result = await executeApi('saveContactRecord', payload);
    
    if (result && result.status === 'success') {
      if (form.id) {
        setContactRecords(contactRecords.map(item => item.id === form.id ? payload : item));
        showAlert('อัปเดตข้อมูลผู้ติดต่อเรียบร้อยแล้ว');
      } else {
        payload.id = 'CT-' + Date.now();
        setContactRecords([...contactRecords, payload]);
        showAlert('บันทึกข้อมูลผู้ติดต่อเรียบร้อยแล้ว');
      }
      setForm(initialForm);
    } else {
      showAlert('ไม่สามารถบันทึกข้อมูลได้: ' + (result?.message || 'Error (อย่าลืมอัปเดต Apps Script เป็นเวอร์ชันใหม่)'));
    }
    setIsSaving(false);
  };

  const handleEdit = (item) => {
    const store = stores.find(s => s.id === item.storeId);
    if (store) {
      setSelectedCompany(store.company);
      setSelectedBranchId(item.storeId);
    }
    setForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    showConfirm('ต้องการลบข้อมูลผู้ติดต่อนี้ใช่หรือไม่?', async () => {
      const result = await executeApi('deleteContactRecord', { id });
      if(result && result.status === 'success') {
        setContactRecords(contactRecords.filter(item => item.id !== id));
      }
    });
  };

  // จัดกลุ่มข้อมูลตามชื่อบริษัท
  const groupedContacts = contactRecords.reduce((groups, record) => {
    const store = stores.find(s => s.id === record.storeId);
    const companyName = store ? store.company : 'ไม่ระบุบริษัท';
    if (!groups[companyName]) {
      groups[companyName] = [];
    }
    groups[companyName].push({ ...record, storeObj: store });
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Contact2 size={20} className="text-blue-600"/> บันทึกข้อมูลผู้ติดต่อ 
          {form.id && <span className="text-amber-500 text-sm font-normal">(โหมดแก้ไข)</span>}
        </h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">บริษัท <span className="text-red-500">*</span></label>
              <select required className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:border-blue-500" value={selectedCompany} onChange={(e) => { setSelectedCompany(e.target.value); setSelectedBranchId(''); }}>
                <option value="">-- ระบุบริษัท --</option>
                {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สาขา <span className="text-red-500">*</span></label>
              <select required className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:border-blue-500" value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} disabled={!selectedCompany}>
                <option value="">-- ระบุสาขา --</option>
                {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.branch}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมายเลขสาขา</label>
              <input type="text" readOnly value={branchNumber} className="w-full px-4 py-2 border bg-gray-100 text-gray-500 rounded-lg outline-none cursor-not-allowed" placeholder="แสดงอัตโนมัติ" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อลูกค้า <span className="text-red-500">*</span></label>
              <input required type="text" value={form.customerName} onChange={(e) => setForm({...form, customerName: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="ชื่อ นามสกุล" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ตำแหน่ง</label>
              <input type="text" value={form.position} onChange={(e) => setForm({...form, position: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="ระบุตำแหน่ง" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
              <input required type="text" value={form.phoneNumber} onChange={(e) => setForm({...form, phoneNumber: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 font-mono" placeholder="08X-XXX-XXXX" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {form.id && (
              <button type="button" onClick={() => { setForm(initialForm); setSelectedBranchId(''); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                ยกเลิก
              </button>
            )}
            <button type="submit" disabled={isSaving || !selectedBranchId} className={`px-8 py-2.5 text-white rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50 ${form.id ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
              {form.id ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList size={20} className="text-blue-600"/> รายชื่อผู้ติดต่อทั้งหมด
        </h2>

        {Object.keys(groupedContacts).length > 0 ? (
          Object.keys(groupedContacts).map(company => (
            <div key={company} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-slate-800 text-white px-4 py-3 font-bold text-lg flex items-center gap-2">
                <Building2 size={20}/> {company}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 whitespace-nowrap border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">สาขา</th>
                      <th className="px-4 py-3 text-center">หมายเลขสาขา</th>
                      <th className="px-4 py-3">ชื่อลูกค้า</th>
                      <th className="px-4 py-3">ตำแหน่ง</th>
                      <th className="px-4 py-3">เบอร์โทรศัพท์</th>
                      <th className="px-4 py-3 text-center w-24">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupedContacts[company].map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-800">{item.storeObj?.branch || '-'}</td>
                        <td className="px-4 py-3 text-center font-mono text-gray-600">#{item.storeObj?.branchNumber || '-'}</td>
                        <td className="px-4 py-3 font-bold text-blue-700 whitespace-nowrap">{item.customerName}</td>
                        <td className="px-4 py-3 text-gray-600">{item.position || '-'}</td>
                        <td className="px-4 py-3 font-mono font-medium">{item.phoneNumber}</td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded mx-1 transition-colors" title="แก้ไข">
                            <Edit size={16}/>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded mx-1 transition-colors" title="ลบ">
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
            ยังไม่มีข้อมูลผู้ติดต่อในระบบ
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------
// Follow Up -> แท็บ Borrow (ยืมอุปกรณ์)
// ------------------------------------------
function BorrowTab({ stores, currentUser, executeApi, borrowRecords, setBorrowRecords, showAlert, showConfirm }) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  const currentBranch = stores.find(s => s.id === selectedBranchId);
  const branchNumber = currentBranch ? currentBranch.branchNumber : '';
  const uniqueCompanies = [...new Set(stores.map(s => s.company))];
  const filteredBranches = stores.filter(s => s.company === selectedCompany);

  const fileRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialForm = {
    id: '', storeId: '', image: null, equipmentName: '', serialNumber: '', 
    borrowerName: '', borrowerContact: '', status: 'ลูกค้ากำลังยืมใช้งาน'
  };
  const [form, setForm] = useState(initialForm);

  const handleImage = (e) => { 
    const file = e.target.files[0]; 
    if (file) { 
      compressImage(file, (compressedDataUrl) => { 
        setForm({...form, image: compressedDataUrl}); 
      }); 
    } 
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedBranchId) {
      showAlert('กรุณาเลือกสาขาที่ต้องการบันทึกข้อมูล');
      return;
    }
    
    setIsSaving(true);
    const payload = {
      ...form,
      storeId: selectedBranchId,
      responsiblePerson: currentUser?.username, 
      lastUpdated: new Date().toISOString()
    };

    const result = await executeApi('saveBorrowRecord', payload);
    
    if (result && result.status === 'success') {
      if (form.id) {
        setBorrowRecords(borrowRecords.map(item => item.id === form.id ? payload : item));
        showAlert('อัปเดตข้อมูลเรียบร้อยแล้ว');
      } else {
        payload.id = 'BW-' + Date.now();
        setBorrowRecords([...borrowRecords, payload]);
        showAlert('บันทึกข้อมูลการยืมเรียบร้อยแล้ว');
      }
      setForm(initialForm);
    } else {
      showAlert('ไม่สามารถบันทึกข้อมูลได้: ' + (result?.message || 'Error'));
    }
    setIsSaving(false);
  };

  const handleEdit = (item) => {
    const store = stores.find(s => s.id === item.storeId);
    if (store) {
      setSelectedCompany(store.company);
      setSelectedBranchId(item.storeId);
    }
    setForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    showConfirm('ต้องการลบข้อมูลการยืมนี้ใช่หรือไม่?', async () => {
      const result = await executeApi('deleteBorrowRecord', { id });
      if(result && result.status === 'success') {
        setBorrowRecords(borrowRecords.filter(item => item.id !== id));
      }
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    const itemToUpdate = borrowRecords.find(item => item.id === id);
    if(!itemToUpdate) return;
    
    const payload = { ...itemToUpdate, status: newStatus, lastUpdated: new Date().toISOString() };
    
    setBorrowRecords(borrowRecords.map(item => item.id === id ? payload : item));
    
    const result = await executeApi('saveBorrowRecord', payload);
    if (!result || result.status !== 'success') {
       setBorrowRecords(borrowRecords.map(item => item.id === id ? itemToUpdate : item));
       showAlert('เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const groupedRecords = borrowRecords.reduce((groups, record) => {
    const store = stores.find(s => s.id === record.storeId);
    const companyName = store ? store.company : 'ไม่ระบุบริษัท';
    if (!groups[companyName]) {
      groups[companyName] = [];
    }
    groups[companyName].push({ ...record, storeObj: store });
    return groups;
  }, {});

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <PhoneCall size={20} className="text-blue-600"/> บันทึกการยืมอุปกรณ์ 
          {form.id && <span className="text-amber-500 text-sm font-normal">(โหมดแก้ไข)</span>}
        </h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">บริษัท <span className="text-red-500">*</span></label>
              <select required className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:border-blue-500" value={selectedCompany} onChange={(e) => { setSelectedCompany(e.target.value); setSelectedBranchId(''); }}>
                <option value="">-- ระบุบริษัท --</option>
                {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สาขา <span className="text-red-500">*</span></label>
              <select required className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:border-blue-500" value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} disabled={!selectedCompany}>
                <option value="">-- ระบุสาขา --</option>
                {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.branch}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมายเลขสาขา</label>
              <input type="text" readOnly value={branchNumber} className="w-full px-4 py-2 border bg-gray-100 text-gray-500 rounded-lg outline-none cursor-not-allowed" placeholder="แสดงอัตโนมัติ" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">ภาพอุปกรณ์</label>
              <input type="file" ref={fileRef} onChange={handleImage} className="hidden" accept="image/*" />
              <div 
                onClick={() => fileRef.current?.click()} 
                className="w-full h-40 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden relative bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {form.image ? (
                  <img src={form.image} className="w-full h-full object-contain p-2" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs">คลิกอัปโหลดรูปภาพ</span>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่ออุปกรณ์ <span className="text-red-500">*</span></label>
                <input required type="text" value={form.equipmentName} onChange={(e) => setForm({...form, equipmentName: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="ระบุชื่ออุปกรณ์" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number <span className="text-red-500">*</span></label>
                <input required type="text" value={form.serialNumber} onChange={(e) => setForm({...form, serialNumber: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="ระบุ S/N" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ยืม <span className="text-red-500">*</span></label>
                <input required type="text" value={form.borrowerName} onChange={(e) => setForm({...form, borrowerName: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="ระบุชื่อลูกค้า/ผู้ติดต่อ" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เบอร์ติดต่อของผู้ยืม <span className="text-red-500">*</span></label>
                <input required type="text" value={form.borrowerContact} onChange={(e) => setForm({...form, borrowerContact: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="ระบุเบอร์โทรศัพท์" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ผู้รับผิดชอบ (ดึงจาก Login)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <UserCircle size={16} className="text-blue-500" />
                  </div>
                  <input type="text" readOnly value={currentUser?.username || ''} className="w-full pl-10 pr-4 py-2 border bg-blue-50 text-blue-800 font-bold rounded-lg outline-none cursor-not-allowed" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {form.id && (
              <button type="button" onClick={() => { setForm(initialForm); setSelectedBranchId(''); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                ยกเลิก
              </button>
            )}
            <button type="submit" disabled={isSaving || !selectedBranchId} className={`px-8 py-2.5 text-white rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50 ${form.id ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
              {form.id ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูลยืม'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <ClipboardList size={20} className="text-blue-600"/> รายการอุปกรณ์ที่ติดตาม
        </h2>

        {Object.keys(groupedRecords).length > 0 ? (
          Object.keys(groupedRecords).map(company => (
            <div key={company} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-slate-800 text-white px-4 py-3 font-bold text-lg flex items-center gap-2">
                <Building2 size={20}/> {company}
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 whitespace-nowrap border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-20">รูปภาพ</th>
                      <th className="px-4 py-3">ชื่ออุปกรณ์</th>
                      <th className="px-4 py-3 font-mono">Serial Number</th>
                      <th className="px-4 py-3">ชื่อผู้ยืม (เบอร์ติดต่อ)</th>
                      <th className="px-4 py-3">สาขา (หมายเลข)</th>
                      <th className="px-4 py-3 text-center">สถานะ</th>
                      <th className="px-4 py-3 text-center w-24">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {groupedRecords[company].map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-center">
                          {item.image ? (
                            <img src={item.image} className="w-12 h-12 object-cover rounded mx-auto border" alt="Equipment" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex justify-center items-center mx-auto text-gray-400">
                              <ImageIcon size={20}/>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{item.equipmentName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.serialNumber}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{item.borrowerName}</div>
                          <div className="text-xs text-gray-500">{item.borrowerContact}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{item.storeObj?.branch}</div>
                          <div className="text-xs text-gray-500">#{item.storeObj?.branchNumber}</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <select 
                            value={item.status} 
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border outline-none cursor-pointer text-center appearance-none ${
                              item.status === 'คงคลัง' ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
                            }`}
                          >
                            <option value="ลูกค้ากำลังยืมใช้งาน">กำลังยืมใช้งาน</option>
                            <option value="คงคลัง">คงคลัง</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded mx-1 transition-colors" title="แก้ไข">
                            <Edit size={16}/>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded mx-1 transition-colors" title="ลบ">
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-gray-400 border-2 border-dashed rounded-xl bg-gray-50">
            ยังไม่มีข้อมูลอุปกรณ์ที่ถูกยืมในขณะนี้
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// เมนู 5: Layout Menu (วาดจุดติดตั้งบนภาพแผนผัง)
// ==========================================
function LayoutMenu({ showAlert, showPrompt, showConfirm }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [konvaLoaded, setKonvaLoaded] = useState(!!window.Konva);
  const [imageObj, setImageObj] = useState(null);
  const [mode, setMode] = useState('view'); 
  const [markers, setMarkers] = useState([]);
  const [pixelsPerMeter, setPixelsPerMeter] = useState(null); 
  const [scaleStep, setScaleStep] = useState(0); 
  const [tempLine, setTempLine] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleModeChange = (newMode) => {
    if (newMode === 'point' && !pixelsPerMeter) {
        showAlert("Please set the layout scale first.\n(กรุณาวาดเส้นอ้างอิง Scale ก่อนวางจุดติดตั้ง)");
        setMode('scale');
        return;
    }
    if (mode === 'scale' && newMode !== 'scale') {
        setTempLine(null);
        setScaleStep(0);
    }
    setMode(newMode);
  };

  const stateRef = useRef({ mode, markers, pixelsPerMeter, tempLine, imageObj, scaleStep });
  useEffect(() => {
    stateRef.current = { mode, markers, pixelsPerMeter, tempLine, imageObj, scaleStep };
    drawKonva(); 
  }, [mode, markers, pixelsPerMeter, tempLine, imageObj, scaleStep]);

  useEffect(() => {
    if (!window.Konva) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/konva@9.3.6/konva.min.js';
      script.onload = () => setKonvaLoaded(true);
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!konvaLoaded || !containerRef.current || stageRef.current) return;
    
    const stage = new window.Konva.Stage({
      container: containerRef.current,
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
      draggable: true 
    });
    
    const layer = new window.Konva.Layer();
    stage.add(layer);
    stageRef.current = stage;
    layerRef.current = layer;

    stage.on('wheel', (e) => {
      e.evt.preventDefault();
      const scaleBy = 1.1;
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      stage.scale({ x: newScale, y: newScale });

      const newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stage.position(newPos);
      stage.batchDraw();
    });

    const ro = new ResizeObserver(() => {
      if(containerRef.current && stageRef.current) {
        stageRef.current.width(containerRef.current.offsetWidth);
        stageRef.current.height(containerRef.current.offsetHeight);
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      stage.destroy();
      stageRef.current = null;
    };
  }, [konvaLoaded]);

  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;

    const handleMouseMove = () => {
      const st = stateRef.current;
      if (st.mode === 'scale' && st.scaleStep === 1 && st.tempLine) {
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const pos = stage.getPointerPosition();
        if (pos) {
          const relPos = transform.point(pos);
          setTempLine(prev => ({ ...prev, x2: relPos.x, y2: relPos.y }));
        }
      }
    };

    stage.on('mousemove touchmove', handleMouseMove);
    return () => {
      stage.off('mousemove touchmove', handleMouseMove);
    };
  }, [konvaLoaded]);

  const drawKonva = () => {
    if (!layerRef.current || !window.Konva || !stageRef.current) return;
    const layer = layerRef.current;
    const stage = stageRef.current;
    layer.destroyChildren();

    const st = stateRef.current;
    
    stage.draggable(st.mode === 'view');

    // 1. วาดรูปภาพพื้นหลัง
    if (st.imageObj) {
      const imgNode = new window.Konva.Image({ image: st.imageObj, x: 0, y: 0 });
      imgNode.on('mousedown touchstart', (e) => {
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const pos = stage.getPointerPosition();
        if(!pos) return;
        const relPos = transform.point(pos);

        if (st.mode === 'point') {
          if (!st.pixelsPerMeter) {
            showAlert("Please set the layout scale first.\n(กรุณาวาดเส้นอ้างอิง Scale ก่อนวางจุดติดตั้ง)");
            setMode('scale');
            return;
          }
          const newId = `P${st.markers.length + 1}`;
          setMarkers(prev => [...prev, { id: newId, x: relPos.x, y: relPos.y }]);
        } else if (st.mode === 'scale') {
          if (st.scaleStep === 0) {
            setTempLine({ x1: relPos.x, y1: relPos.y, x2: relPos.x, y2: relPos.y });
            setScaleStep(1);
          } else if (st.scaleStep === 1) {
            const pxDist = Math.sqrt(Math.pow(relPos.x - st.tempLine.x1, 2) + Math.pow(relPos.y - st.tempLine.y1, 2));
            if (pxDist > 5) {
              showPrompt('Enter real-world distance (meters)\nระบุระยะทางจริงของเส้นนี้ (เมตร):', '12.30', (val) => {
                const meters = parseFloat(val);
                if (meters && meters > 0) {
                   setPixelsPerMeter(pxDist / meters);
                   showAlert('Scale คำนวณเรียบร้อยแล้ว!\nสามารถเริ่ม "วางจุดติดตั้ง" ได้เลย');
                   setMode('point'); 
                }
                setTempLine(null);
                setScaleStep(0);
              });
            } else {
              setTempLine(null);
              setScaleStep(0);
            }
          }
        }
      });
      layer.add(imgNode);
    }

    // 2. วาด Heatmap 
    st.markers.forEach((m, i) => {
      const radiusPx = st.pixelsPerMeter ? (20 * st.pixelsPerMeter) : 0;
      if (radiusPx > 0) {
        const heatmap = new window.Konva.Circle({
          x: m.x,
          y: m.y,
          radius: radiusPx,
          fill: '#3b82f6', 
          opacity: 0.70,
          listening: false 
        });
        layer.add(heatmap);
      }
    });

    // 3. วาดเส้นอ้างอิงตอนกำลังตั้งค่า Scale
    if (st.tempLine) {
      const line = new window.Konva.Line({
        points: [st.tempLine.x1, st.tempLine.y1, st.tempLine.x2, st.tempLine.y2],
        stroke: '#ef4444', 
        strokeWidth: 4,
        dash: [5, 5],
        listening: false 
      });
      layer.add(line);
    }

    // 4. วาดเส้นและระยะทางระหว่างจุด
    for (let i = 1; i < st.markers.length; i++) {
      const m1 = st.markers[i - 1];
      const m2 = st.markers[i];
      
      const line = new window.Konva.Line({
        points: [m1.x, m1.y, m2.x, m2.y],
        stroke: '#f59e0b', 
        strokeWidth: 4,
        dash: [8, 5],
        listening: false
      });
      layer.add(line);

      const distPx = Math.sqrt(Math.pow(m2.x - m1.x, 2) + Math.pow(m2.y - m1.y, 2));
      const distM = st.pixelsPerMeter ? (distPx / st.pixelsPerMeter).toFixed(2) : '-';

      const label = new window.Konva.Label({ x: (m1.x + m2.x) / 2, y: (m1.y + m2.y) / 2, listening: false });
      label.add(new window.Konva.Tag({ fill: '#111827', cornerRadius: 6, opacity: 0.95 })); 
      label.add(new window.Konva.Text({ text: `${distM} m`, padding: 6, fill: '#facc15', fontSize: 14, fontStyle: 'bold' })); 
      layer.add(label);
    }

    // 5. วาดจุดกึ่งกลาง (Center Dot) และป้ายชื่อ (ID Label) 
    st.markers.forEach((m, i) => {
      const group = new window.Konva.Group({
        x: m.x, y: m.y,
        draggable: true 
      });

      group.on('mousedown touchstart', (e) => {
        e.cancelBubble = true; 
      });

      group.on('mouseenter', () => { document.body.style.cursor = 'pointer'; });
      group.on('mouseleave', () => { document.body.style.cursor = 'default'; });

      group.on('dragmove', (e) => {
        const newX = e.target.x();
        const newY = e.target.y();
        setMarkers(prev => {
          const next = [...prev];
          next[i] = { ...next[i], x: newX, y: newY };
          return next;
        });
      });

      const centerDot = new window.Konva.Circle({
        radius: 6,
        fill: '#dc2626', 
        stroke: 'white',
        strokeWidth: 2
      });

      const idLabel = new window.Konva.Label({ x: 12, y: -20 });
      idLabel.add(new window.Konva.Tag({ fill: 'white', cornerRadius: 4, stroke: '#dc2626', strokeWidth: 1 }));
      idLabel.add(new window.Konva.Text({ text: m.id, padding: 4, fill: '#dc2626', fontSize: 12, fontStyle: 'bold' }));

      const hitArea = new window.Konva.Circle({
         radius: 20, 
         fill: 'transparent'
      });

      group.add(hitArea, centerDot, idLabel);
      layer.add(group);
    });

    layer.batchDraw();
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.crossOrigin = "Anonymous"; 
      img.src = ev.target.result;
      img.onload = () => {
        setImageObj(img);
        setMarkers([]); 
        setPixelsPerMeter(null); 
        setMode('scale'); 
        if (stageRef.current) {
           stageRef.current.position({x:0, y:0});
           stageRef.current.scale({x:1, y:1});
           stageRef.current.draw();
        }
      };
    };
    reader.readAsDataURL(file);
    e.target.value = null; 
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    
    try {
      const stage = stageRef.current;
      if (!stage) throw new Error("Canvas stage not found.");
      
      const oldScaleX = stage.scaleX();
      const oldScaleY = stage.scaleY();
      const oldPos = stage.position();
      const oldWidth = stage.width();
      const oldHeight = stage.height();
      
      const captureWidth = imageObj ? imageObj.width : stage.width();
      const captureHeight = imageObj ? imageObj.height : stage.height();

      stage.width(captureWidth);
      stage.height(captureHeight);
      stage.scale({ x: 1, y: 1 });
      stage.position({ x: 0, y: 0 });
      stage.draw();

      await new Promise(resolve => setTimeout(resolve, 100));

      let safePixelRatio = 2; 
      if (captureWidth > 2500 || captureHeight > 2500) safePixelRatio = 1; 

      const dataUrl = stage.toDataURL({ 
        pixelRatio: safePixelRatio,
        x: 0,
        y: 0,
        width: captureWidth,
        height: captureHeight
      });

      stage.width(oldWidth);
      stage.height(oldHeight);
      stage.scale({ x: oldScaleX, y: oldScaleY });
      stage.position(oldPos);
      stage.draw();

      if (!dataUrl || dataUrl.length < 100) {
          throw new Error("Canvas export failed (Empty DataURL).");
      }

      if (!window.jspdf) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
      if (!window.jspdf.jsPDF.API.autoTable) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "landscape", format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.setFontSize(16);
      pdf.text("Layout & Installation Points", 14, 15);
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Exported: ${new Date().toLocaleString('th-TH')}`, 14, 22);

      const imgMaxW = pdfWidth - 28;
      const imgMaxH = pdfHeight - 35;
      const imgRatio = captureWidth / captureHeight;
      const boxRatio = imgMaxW / imgMaxH;
      
      let finalW, finalH;
      if (imgRatio > boxRatio) {
          finalW = imgMaxW;
          finalH = finalW / imgRatio;
      } else {
          finalH = imgMaxH;
          finalW = finalH * imgRatio;
      }

      const xOffset = (pdfWidth - finalW) / 2; 
      pdf.addImage(dataUrl, "PNG", xOffset, 28, finalW, finalH);

      pdf.addPage();
      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text("Installation Points List", 14, 15);

      const tableBody = markers.map((m, index) => {
          return [m.id, getDistanceText(index)];
      });

      pdf.autoTable({
          startY: 25,
          head: [['Point ID', 'Distance from previous point (m)']],
          body: tableBody.length > 0 ? tableBody : [['-', 'No markers placed']],
          theme: 'grid',
          headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0] },
          styles: { fontSize: 12 }
      });

      pdf.save(`Layout_Export_${Date.now()}.pdf`);
      setIsExporting(false);

    } catch (error) {
      console.error("Export Error:", error);
      showAlert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF: ' + error.message);
      setIsExporting(false);
    }
  };

  const getDistanceText = (index) => {
    if (index === 0) return "-";
    if (!pixelsPerMeter) return "-";
    const m1 = markers[index - 1];
    const m2 = markers[index];
    const pxDist = Math.sqrt(Math.pow(m2.x - m1.x, 2) + Math.pow(m2.y - m1.y, 2));
    return (pxDist / pixelsPerMeter).toFixed(2);
  };
  
  return (
    <div id="layout-menu-root" className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col gap-4">
      {/* ส่วนหัวเครื่องมือ */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          <button onClick={() => fileInputRef.current.click()} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors">
            <Upload size={16}/> 1. อัปโหลด Layout
          </button>
          
          <div className="h-8 w-px bg-gray-300 mx-2"></div>

          <button disabled={!imageObj} onClick={() => handleModeChange('scale')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 ${mode === 'scale' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Crosshair size={16}/> 2. Set Scale
          </button>
          <button disabled={!imageObj} onClick={() => handleModeChange('point')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 ${mode === 'point' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <MapIcon size={16}/> 3. Place Points
          </button>

          <div className="h-8 w-px bg-gray-300 mx-2"></div>

          <button onClick={() => handleModeChange('view')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${mode === 'view' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <Move size={16}/> ลาก/แพนกล้อง
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg font-mono">
            Scale: <span className="font-bold">1 meter = {pixelsPerMeter ? pixelsPerMeter.toFixed(2) : '-'} pixels</span>
          </div>
          <button onClick={handleExportPDF} disabled={!imageObj || isExporting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {isExporting ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16}/>} Export PDF
          </button>
        </div>
      </div>

      {/* ส่วนพื้นที่ทำงานและตาราง (บนหน้าจอ) */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        {/* Canvas Area */}
        <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden relative bg-gray-50" style={{ cursor: mode === 'view' ? (stageRef.current?.isDragging() ? 'grabbing' : 'grab') : 'crosshair' }}>
          {!imageObj && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <ImageIcon size={48} className="opacity-50 mb-2" />
              <p>อัปโหลดรูปภาพเพื่อเริ่มต้นใช้งาน</p>
            </div>
          )}
          {imageObj && mode === 'scale' && scaleStep === 1 && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg pointer-events-none z-10 animate-pulse">
              คลิกที่จุดสิ้นสุดเพื่อสร้างเส้น
            </div>
          )}
          <div ref={containerRef} className="w-full h-full" />
        </div>

        {/* Markers Table Area */}
        <div className="w-full md:w-80 flex flex-col border border-gray-200 rounded-xl overflow-hidden shrink-0 bg-white">
          <div className="bg-slate-800 text-white p-3 font-bold flex items-center gap-2">
            <ClipboardList size={18}/> รายการจุดติดตั้ง
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 w-16">ID</th>
                  <th className="px-3 py-2">ระยะทาง (m)</th>
                  <th className="px-3 py-2 text-center w-12 no-print">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {markers.length > 0 ? markers.map((m, index) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-bold text-blue-700">{m.id}</td>
                    <td className="px-3 py-2 font-mono text-gray-700">{getDistanceText(index)}</td>
                    <td className="px-3 py-2 text-center no-print">
                      <button onClick={() => setMarkers(markers.filter(item => item.id !== m.id))} className="text-red-500 hover:bg-red-100 p-1 rounded">
                        <Trash2 size={16}/>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="px-3 py-8 text-center text-gray-400 border-b">ยังไม่มีจุดติดตั้ง</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// เมนู 4: Prepare Menu (จัดเตรียมตั้งค่าอุปกรณ์)
// ==========================================
function PrepareMenu({ equipments, stores, executeApi, prepareGateways, setPrepareGateways, showAlert, showConfirm }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PrepareGatewayTab 
        equipments={equipments} stores={stores} executeApi={executeApi} 
        prepareGateways={prepareGateways} setPrepareGateways={setPrepareGateways} 
        showAlert={showAlert} showConfirm={showConfirm}
      />
    </div>
  );
}

// ------------------------------------------
// Prepare -> แท็บย่อย Gateway (เปลี่ยนเป็น Pre-Configuration)
// ------------------------------------------
function PrepareGatewayTab({ equipments, stores, executeApi, prepareGateways, setPrepareGateways, showAlert, showConfirm }) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  
  const currentBranch = stores.find(s => s.id === selectedBranchId);
  const branchNumber = currentBranch ? currentBranch.branchNumber : '';
  const uniqueCompanies = [...new Set(stores.map(s => s.company))];
  const filteredBranches = stores.filter(s => s.company === selectedCompany);

  // เช็คว่าเป็นบริษัท Lotus's หรือไม่
  const isLotus = selectedCompany.toLowerCase().includes('lotus');

  const initialForm = {
    id: '', equipmentId: '', serialNumber: '', itAssetTag: '', assetName: '', deviceName: '',
    macAddress: '', ipAddress: '', subnetMask: '', gateway: '', dns1: '', dns2: ''
  };
  
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingTag, setIsFetchingTag] = useState(false);

  // ฟังก์ชันช่วยเหลือสำหรับสร้าง Asset Name
  const getCompanyCode = (comp) => {
    if (!comp) return 'XX';
    const c = comp.toLowerCase();
    if (c.includes('makro')) return 'MK';
    if (c.includes('lotus')) return 'LT';
    if (c.includes('lopia')) return 'LP';
    if (c.includes('bigc') || c.includes('big c')) return 'BC';
    if (c.includes('the mall') || c.includes('themall')) return 'TM';
    return comp.substring(0, 2).toUpperCase();
  };

  const getEqCode = (eqName) => {
    if (!eqName) return 'XX';
    const n = eqName.toLowerCase();
    if (n.includes('gateway')) return 'GW';
    if (n.includes('pc server') || n.includes('hp pro')) return 'PC';
    if (n.includes('lcd')) return 'LCD';
    if (n.includes('switch') || n.includes('hub')) return 'SW';
    return 'EQ';
  };

  // Effect สำหรับอัปเดต Device Name และ Asset Name อัตโนมัติ
  useEffect(() => {
    const eqInfo = equipments.find(eq => eq.id === form.equipmentId);
    let newDeviceName = form.deviceName;
    let newAssetName = form.assetName;

    if (eqInfo) {
      newDeviceName = eqInfo.name;
    } else {
      newDeviceName = '';
    }

    if (selectedCompany && currentBranch && eqInfo) {
      const compCode = getCompanyCode(selectedCompany);
      const branchCode = (currentBranch.branchNumber || '').toString().padStart(4, '0');
      const eqCode = getEqCode(eqInfo.name);
      const prefix = `${compCode}-${branchCode}-${eqCode}-`;

      if (!form.id || !newAssetName.startsWith(prefix)) {
        let maxRun = 0;
        prepareGateways.forEach(item => {
          if (item.storeId === selectedBranchId && item.assetName && item.assetName.startsWith(prefix)) {
            const parts = item.assetName.split('-');
            const numStr = parts[parts.length - 1];
            const num = parseInt(numStr, 10);
            if (!isNaN(num) && num > maxRun) {
              maxRun = num;
            }
          }
        });
        const nextRun = (maxRun + 1).toString().padStart(3, '0');
        newAssetName = `${prefix}${nextRun}`;
      }
    } else {
      if (!form.id) newAssetName = '';
    }

    if (newDeviceName !== form.deviceName || newAssetName !== form.assetName) {
      setForm(prev => ({ ...prev, deviceName: newDeviceName, assetName: newAssetName }));
    }
  }, [form.equipmentId, selectedCompany, selectedBranchId, equipments]); 

  const selectedEqInfo = equipments.find(eq => eq.id === form.equipmentId);

  const fetchLatestTag = async () => {
    setIsFetchingTag(true);
    try {
      const response = await fetch(`${SCRIPT_URL}?action=getNextAssetTag`);
      const result = await response.json();
      if(result.status === 'success') {
        setForm({...form, itAssetTag: result.nextTag});
      } else {
        showAlert("ไม่สามารถดึงเลขได้: " + (result.message || 'ไม่พบคำสั่ง getNextAssetTag โปรดตรวจสอบว่าได้ Deploy สคริปต์ Google เป็นเวอร์ชันใหม่แล้วรึยัง'));
      }
    } catch(err) {
      showAlert(`เกิดข้อผิดพลาดในการเชื่อมต่อ:\n${err.message}`);
    }
    setIsFetchingTag(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedBranchId || !form.equipmentId || !form.serialNumber) {
      showAlert('กรุณาเลือกสาขา, อุปกรณ์ และกรอก Serial Number ให้ครบถ้วน');
      return;
    }
    
    setIsSaving(true);
    const eqInfo = equipments.find(eq => eq.id === form.equipmentId);
    const payload = {
      ...form,
      storeId: selectedBranchId,
      companyName: selectedCompany, 
      branchName: currentBranch?.branch,
      branchNumber: currentBranch?.branchNumber,
      equipmentName: eqInfo?.name,
      lastUpdated: new Date().toISOString()
    };

    const result = await executeApi('savePrepareGateway', payload);
    
    if (result && result.status === 'success') {
      const finalTag = result.assignedTag || (isLotus ? form.itAssetTag : '-');
      const newData = { ...payload, itAssetTag: finalTag };
      
      if(form.id) {
        setPrepareGateways(prepareGateways.map(item => item.id === form.id ? newData : item));
      } else {
        newData.id = 'PG-' + Date.now(); 
        setPrepareGateways([...prepareGateways, newData]);
      }
      setForm(initialForm);
      
      if (isLotus) {
        showAlert(`บันทึกข้อมูลเรียบร้อย!\n\nรหัสทรัพย์สิน (IT Asset Tag) ที่ได้คือ:\n${finalTag}`);
      } else {
        showAlert(`บันทึกข้อมูลเรียบร้อย!\n(ข้ามการออกเลข IT Asset Tag เนื่องจากไม่ใช่สาขา Lotus's)`);
      }
    } else {
      showAlert('ไม่สามารถบันทึกข้อมูลได้: ' + (result?.message || 'ไม่พบคำสั่งใน Google Script โปรดตรวจสอบว่า Deploy เป็น New Version หรือยังครับ'));
    }
    setIsSaving(false);
  };

  const handleEdit = (item) => {
    const store = stores.find(s => s.id === item.storeId);
    if(store) setSelectedCompany(store.company);
    setSelectedBranchId(item.storeId);
    setForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    showConfirm('ต้องการลบข้อมูลตั้งค่านี้ใช่หรือไม่?\n(ข้อมูลในชีต Asset_Lotus จะยังคงอยู่เพื่อรักษาลำดับ Running Number ไว้)', async () => {
      const result = await executeApi('deletePrepareGateway', { id });
      if(result && result.status === 'success') {
        setPrepareGateways(prepareGateways.filter(item => item.id !== id));
      } else {
        showAlert('ลบไม่สำเร็จ: ' + (result?.message || 'Unknown Error'));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ฟอร์มกรอกข้อมูล */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Settings size={20} className="text-blue-600"/> Pre-Configuration 
          {form.id && <span className="text-amber-500 text-sm font-normal">(โหมดแก้ไข)</span>}
        </h2>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">บริษัท</label>
              <select className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:border-blue-500" value={selectedCompany} onChange={(e) => { setSelectedCompany(e.target.value); setSelectedBranchId(''); }}>
                <option value="">-- ระบุบริษัท --</option>
                {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">สาขา <span className="text-red-500">*</span></label>
              <select required className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:border-blue-500" value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} disabled={!selectedCompany}>
                <option value="">-- ระบุสาขา --</option>
                {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.branch}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมายเลขสาขา</label>
              <input type="text" readOnly value={branchNumber} className="w-full px-4 py-2 border bg-gray-100 text-gray-500 rounded-lg outline-none cursor-not-allowed" placeholder="แสดงอัตโนมัติ" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">ข้อมูลอุปกรณ์ (Hardware)</h3>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">รุ่นอุปกรณ์ (Model) <span className="text-red-500">*</span></label>
                  <select required value={form.equipmentId} onChange={(e) => setForm({...form, equipmentId: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white">
                    <option value="">-- เลือกรุ่น Gateway --</option>
                    {equipments.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                  </select>
                </div>
                
                <div className="w-full sm:w-28 h-20 border rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 shrink-0 sm:mt-6">
                  {selectedEqInfo?.image ? (
                    <img src={selectedEqInfo.image} className="w-full h-full object-contain p-1" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon size={20} />
                      <span className="text-[10px] mt-1">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number <span className="text-red-500">*</span></label>
                <input required type="text" value={form.serialNumber} onChange={(e) => setForm({...form, serialNumber: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" placeholder="S/N ของเครื่อง" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IT Asset Tag <span className="text-red-500 text-xs">({isLotus ? 'ดึงจากส่วนกลาง' : 'เฉพาะ Lotus\'s'})</span></label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={isLotus ? form.itAssetTag : '-'} 
                    className={`flex-1 px-4 py-2 border font-mono font-bold rounded-lg outline-none cursor-not-allowed ${isLotus ? 'bg-amber-50 text-amber-800' : 'bg-gray-100 text-gray-400'}`} 
                    placeholder={isLotus ? "กดปุ่มเพื่อดึงเลขล่าสุด" : "ไม่ต้องระบุ"} 
                  />
                  <button 
                    type="button" 
                    onClick={fetchLatestTag} 
                    disabled={!isLotus || isFetchingTag || form.id !== ''} 
                    className={`px-4 py-2 text-white rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50 ${isLotus ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-400'}`}
                  >
                    <RefreshCw size={16} className={isFetchingTag ? "animate-spin" : ""} /> {form.id ? 'แก้ไขไม่ได้' : 'ดึงเลข'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name <span className="text-red-500 text-xs">(อัตโนมัติ)</span></label>
                  <input type="text" readOnly value={form.assetName} className="w-full px-4 py-2 border bg-gray-100 text-gray-600 rounded-lg outline-none cursor-not-allowed font-medium" placeholder="ระบบคำนวณให้อัตโนมัติ" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Device Name <span className="text-red-500 text-xs">(อัตโนมัติ)</span></label>
                  <input type="text" readOnly value={form.deviceName} className="w-full px-4 py-2 border bg-gray-100 text-gray-600 rounded-lg outline-none cursor-not-allowed font-medium" placeholder="ชื่อตามรุ่นอุปกรณ์" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-700 border-b pb-2">การตั้งค่าเครือข่าย (Network)</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MAC Address</label>
                <input type="text" value={form.macAddress} onChange={(e) => setForm({...form, macAddress: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 font-mono uppercase" placeholder="00:1A:2B:3C:4D:5E" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <input type="text" value={form.ipAddress} onChange={(e) => setForm({...form, ipAddress: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 font-mono" placeholder="192.168.1.100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subnet Mask</label>
                  <input type="text" value={form.subnetMask} onChange={(e) => setForm({...form, subnetMask: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 font-mono" placeholder="255.255.255.0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Gateway</label>
                <input type="text" value={form.gateway} onChange={(e) => setForm({...form, gateway: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 font-mono" placeholder="192.168.1.1" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary DNS</label>
                  <input type="text" value={form.dns1} onChange={(e) => setForm({...form, dns1: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 font-mono" placeholder="8.8.8.8" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary DNS</label>
                  <input type="text" value={form.dns2} onChange={(e) => setForm({...form, dns2: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 font-mono" placeholder="8.8.4.4" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {form.id && (
              <button type="button" onClick={() => setForm(initialForm)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                ยกเลิก
              </button>
            )}
            <button type="submit" disabled={isSaving || !selectedBranchId} className={`px-8 py-2.5 text-white rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50 ${form.id ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
              {form.id ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>

      {/* ตารางแสดงข้อมูลที่บันทึกแล้ว */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ClipboardList size={20} className="text-blue-600"/> รายการที่ตั้งค่าเตรียมพร้อมแล้ว
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b text-gray-700 whitespace-nowrap">
              <tr>
                <th className="px-4 py-3">สาขา</th>
                <th className="px-4 py-3">IT Asset Tag</th>
                <th className="px-4 py-3">S/N</th>
                <th className="px-4 py-3">IP / MAC</th>
                <th className="px-4 py-3">Asset / Device Name</th>
                <th className="px-4 py-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {prepareGateways.length > 0 ? prepareGateways.map((item) => {
                const store = stores.find(s => s.id === item.storeId);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-blue-700">{store?.branchNumber}</div>
                      <div className="text-xs text-gray-500">{store?.branch}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-700">{item.itAssetTag}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.serialNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-green-700">{item.ipAddress || '-'}</div>
                      <div className="font-mono text-xs text-gray-400">{item.macAddress || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{item.assetName || '-'}</div>
                      <div className="text-xs text-gray-500">{item.deviceName || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded mx-1"><Edit size={16}/></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded mx-1"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td col colSpan="6" className="px-4 py-10 text-center text-gray-400">ยังไม่มีรายการที่ตั้งค่าไว้</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// เมนู 2: Site Survey 
// ==========================================
function SiteSurveyMenu({ equipments, stores, showAlert, showConfirm }) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const currentBranch = stores.find(s => s.id === selectedBranchId);
  const branchNumber = currentBranch ? currentBranch.branchNumber : '';
  const uniqueCompanies = [...new Set(stores.map(s => s.company))];
  const filteredBranches = stores.filter(s => s.company === selectedCompany);

  const [surveyItems, setSurveyItems] = useState([]);
  const [selectedEqId, setSelectedEqId] = useState('');
  const [qty, setQty] = useState('');
  const [length, setLength] = useState('');
  
  const [editingItemId, setEditingItemId] = useState(null);

  const handleSaveItem = (e) => {
    e.preventDefault();
    if (!selectedEqId || !qty) return;
    
    const eq = (equipments || []).find(e => e.id === selectedEqId);
    
    if (editingItemId) {
      setSurveyItems(surveyItems.map(item => 
        item.id === editingItemId ? {
          ...item,
          equipmentId: selectedEqId,
          serialNumber: eq?.serialNumber,
          name: eq?.name,
          image: eq?.image,
          length: length || '-',
          qty: parseInt(qty)
        } : item
      ));
      setEditingItemId(null);
    } else {
      setSurveyItems([...surveyItems, {
        id: Date.now().toString() + Math.random(),
        equipmentId: selectedEqId,
        serialNumber: eq?.serialNumber,
        name: eq?.name,
        image: eq?.image,
        length: length || '-',
        qty: parseInt(qty)
      }]);
    }
    
    setSelectedEqId('');
    setQty('');
    setLength('');
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setSelectedEqId(item.equipmentId);
    setLength(item.length === '-' ? '' : item.length);
    setQty(item.qty.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setSelectedEqId('');
    setQty('');
    setLength('');
  };

  const handleDeleteItem = (id) => {
    showConfirm('ลบรายการนี้ใช่หรือไม่?', () => {
      setSurveyItems(surveyItems.filter(item => item.id !== id));
      if (editingItemId === id) cancelEdit();
    });
  };

  const exportCSV = () => {
    if (surveyItems.length === 0) return showAlert('ไม่มีข้อมูลสำหรับ Export');
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Serial Number,Name,ความยาว/ขนาด,จำนวนที่ต้องใช้\n";
    
    surveyItems.forEach(item => {
      const serial = item.serialNumber ? item.serialNumber.replace(/"/g, '""') : '';
      const name = item.name ? item.name.replace(/"/g, '""') : '';
      const len = item.length ? item.length.toString().replace(/"/g, '""') : '';
      const q = item.qty;
      csvContent += `"${serial}","${name}","${len}","${q}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    
    const companyName = selectedCompany || 'Company';
    const branchName = currentBranch?.branch || 'Branch';
    const date = new Date().toISOString().slice(0,10);
    link.setAttribute("download", `SiteSurvey_${companyName}_${branchName}_${date}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 size={20} className="text-blue-600"/> ข้อมูลสถานที่
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">1. บริษัท</label>
            <select className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white" value={selectedCompany} onChange={(e) => { setSelectedCompany(e.target.value); setSelectedBranchId(''); }}>
              <option value="">-- ระบุบริษัท --</option>
              {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">2. สาขา</label>
            <select className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white" value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} disabled={!selectedCompany}>
              <option value="">-- ระบุสาขา --</option>
              {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.branch}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 font-medium text-gray-700">3. หมายเลขสาขา</label>
            <input type="text" readOnly value={branchNumber} className="w-full px-4 py-2 border bg-gray-50 rounded-lg outline-none text-gray-500 cursor-not-allowed" placeholder="แสดงอัตโนมัติ" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          {editingItemId ? <Edit size={20} className="text-amber-500"/> : <Plus size={20} className="text-blue-600"/>}
          {editingItemId ? 'แก้ไขรายการอุปกรณ์' : 'เพิ่มรายการอุปกรณ์ที่ต้องใช้'}
        </h2>
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0">
              <label className="block text-sm mb-1 font-medium text-gray-700 hidden md:block opacity-0">พรีวิว</label>
              <div className="w-full md:w-32 h-32 bg-gray-50 border rounded-lg flex items-center justify-center overflow-hidden">
                {(equipments || []).find(e => e.id === selectedEqId)?.image ? (
                  <img src={(equipments || []).find(e => e.id === selectedEqId).image} className="w-full h-full object-contain p-2" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <ImageIcon size={28} />
                    <span className="text-xs mt-1">ไม่มีรูปภาพ</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="md:col-span-1">
                <label className="block text-sm mb-1 font-medium text-gray-700">4. รายการอุปกรณ์ (จาก DB)</label>
                <select required value={selectedEqId} onChange={(e) => setSelectedEqId(e.target.value)} className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500 bg-white">
                  <option value="">-- เลือกอุปกรณ์ --</option>
                  {(equipments || []).map(eq => <option key={eq.id} value={eq.id}>{eq.name} (SN: {eq.serialNumber})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">5. ขนาด/ความยาว</label>
                <input type="text" value={length} onChange={(e) => setLength(e.target.value)} placeholder="เช่น 10 เมตร" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">6. จำนวนที่ต้องการ</label>
                <input type="number" min="1" required value={qty} onChange={(e) => setQty(e.target.value)} placeholder="ระบุจำนวน" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-dashed">
            {editingItemId && (
              <button type="button" onClick={cancelEdit} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                ยกเลิก
              </button>
            )}
            <button type="submit" disabled={!selectedBranchId} className={`px-6 py-2.5 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors ${editingItemId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {editingItemId ? <><Save size={18}/> บันทึกการแก้ไข</> : <><Plus size={18}/> เพิ่มลงตาราง</>}
            </button>
          </div>
        </form>
        {!selectedBranchId && <p className="text-xs text-red-500 text-right mt-2">* กรุณาเลือกสาขาก่อนดำเนินการ</p>}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
            <ClipboardList size={20} className="text-blue-600"/> สรุปรายการอุปกรณ์ที่ต้องใช้
          </h2>
          <button onClick={exportCSV} disabled={surveyItems.length === 0} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 transition-colors">
            <Upload size={16}/> Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b text-gray-700">
              <tr>
                <th className="px-4 py-3 text-center w-24">Picture</th>
                <th className="px-4 py-3 font-mono">Serial Number</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-center">ความยาว/ขนาด</th>
                <th className="px-4 py-3 text-center">จำนวนที่ต้องใช้</th>
                <th className="px-4 py-3 text-center w-28">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {surveyItems.length > 0 ? surveyItems.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${editingItemId === item.id ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    {item.image ? (
                      <img src={item.image} className="w-10 h-10 object-cover rounded mx-auto shadow-sm" alt="อุปกรณ์" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded flex justify-center items-center mx-auto">
                         <ImageIcon size={16} className="text-gray-400"/>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.serialNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{item.length}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600">{item.qty}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleEditItem(item)} className="text-blue-500 hover:bg-blue-50 p-1.5 rounded transition-colors" title="แก้ไขรายการ">
                        <Edit size={16}/>
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="ลบรายการ">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400 border-dashed border-2 m-2">
                    ยังไม่มีรายการอุปกรณ์ กรุณาเลือกและกดเพิ่มลงตาราง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InventoryMenu({ equipments, stores, inventories, setInventories, currentUser, executeApi, showAlert }) {
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const operatorName = currentUser?.username || 'Unknown'; 
  
  const currentBranch = stores.find(s => s.id === selectedBranchId);
  const branchNumber = currentBranch ? currentBranch.branchNumber : '';
  const uniqueCompanies = [...new Set(stores.map(s => s.company))];
  const filteredBranches = stores.filter(s => s.company === selectedCompany);

  const [branchItems, setBranchItems] = useState([]);
  const [usageInputs, setUsageInputs] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const [layoutImage, setLayoutImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentRect, setCurrentRect] = useState(null);
  const [areas, setAreas] = useState([]);
  const imageContainerRef = useRef(null);

  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterEqId, setMasterEqId] = useState('');
  const [masterQty, setMasterQty] = useState('');
  
  const [showPrintFallback, setShowPrintFallback] = useState(false);

  useEffect(() => {
    if (selectedBranchId) {
      const data = inventories[selectedBranchId] || { items: [], layoutImage: null, areas: [] };
      setBranchItems(data.items || []);
      setLayoutImage(data.layoutImage || null);
      setAreas(data.areas || []);
      setUsageInputs({});
    } else {
      setBranchItems([]); 
      setLayoutImage(null); 
      setAreas([]); 
      setUsageInputs({});
    }
  }, [selectedBranchId, inventories]);

  const handleAddMasterData = async (e) => {
    e.preventDefault();
    if (!masterEqId || !masterQty) return;
    
    setIsSaving(true);
    const newItem = { 
      id: 'INV-' + Date.now() + Math.floor(Math.random() * 1000),
      storeId: selectedBranchId,
      equipmentId: masterEqId, 
      deliveredQty: parseInt(masterQty), 
      currentBalance: parseInt(masterQty),
      lastUpdated: new Date().toISOString()
    };
    
    const success = await executeApi('saveMasterInventory', newItem);
    if(success) {
      const newItems = [...branchItems, newItem];
      setBranchItems(newItems);
      setInventories(prev => ({ ...prev, [selectedBranchId]: { ...(prev[selectedBranchId] || {}), items: newItems } }));
      setShowMasterModal(false); 
      setMasterEqId(''); 
      setMasterQty('');
    }
    setIsSaving(false);
  };

  const handleSaveToSheet = async () => {
    if (!selectedBranchId) return;
    setIsSaving(true);
    
    const timestamp = new Date().toISOString();
    
    const updatedItems = branchItems.map(item => ({ 
      ...item, 
      currentBalance: item.currentBalance - parseInt(usageInputs[item.id] || 0),
      lastUpdated: timestamp
    }));

    const updateSuccess = await executeApi('updateInventoryBalance', updatedItems);
    
    const transactions = [];
    branchItems.forEach(item => {
      const used = parseInt(usageInputs[item.id] || 0);
      if(used > 0) {
        transactions.push({
          timestamp,
          username: operatorName,
          storeId: selectedBranchId,
          equipmentId: item.equipmentId,
          usedQty: used,
          balanceAfter: item.currentBalance - used
        });
      }
    });

    if(transactions.length > 0 && updateSuccess) {
      await executeApi('saveTransaction', transactions);
    }

    if(updateSuccess) {
      setBranchItems(updatedItems); 
      setUsageInputs({});
      setInventories(prev => ({ ...prev, [selectedBranchId]: { ...(prev[selectedBranchId] || {}), items: updatedItems } }));
      showAlert('บันทึกตัดยอดลง Google Sheet เรียบร้อยแล้ว!');
    }
    setIsSaving(false);
  };

  const syncLayoutToSheet = async (img, newAreas) => {
    await executeApi('saveLayout', {
      storeId: selectedBranchId,
      layoutImage: img || layoutImage,
      areasJson: JSON.stringify(newAreas || areas)
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) { 
      compressImage(file, (compressedDataUrl) => {
        setLayoutImage(compressedDataUrl); 
        setInventories(prev => ({ ...prev, [selectedBranchId]: { ...(prev[selectedBranchId] || {}), layoutImage: compressedDataUrl } })); 
        syncLayoutToSheet(compressedDataUrl, areas); 
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getCoordinates = (e) => {
    if (!imageContainerRef.current) return null;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    return { 
      x: Math.max(0, Math.min(100, ((clientX - rect.left)/rect.width)*100)), 
      y: Math.max(0, Math.min(100, ((clientY - rect.top)/rect.height)*100)) 
    };
  };

  const handlePointerDown = (e) => { 
    if (!isDrawingMode || !layoutImage) return; 
    const pos = getCoordinates(e); 
    if (pos) { 
      setIsDrawing(true); 
      setStartPos(pos); 
      setCurrentRect({ x: pos.x, y: pos.y, w: 0, h: 0 }); 
    } 
  };

  const handlePointerMove = (e) => { 
    if (!isDrawing) return; 
    const pos = getCoordinates(e); 
    if (pos) {
      setCurrentRect({ 
        x: Math.min(startPos.x, pos.x), 
        y: Math.min(startPos.y, pos.y), 
        w: Math.abs(pos.x - startPos.x), 
        h: Math.abs(pos.y - startPos.y) 
      });
    } 
  };

  const handlePointerUp = () => {
    if (!isDrawing) return; 
    setIsDrawing(false);
    if (currentRect && currentRect.w > 1 && currentRect.h > 1) {
      const newAreas = [...areas, { id: Date.now().toString(), name: '', rect: currentRect }];
      setAreas(newAreas); 
      setInventories(prev => ({ ...prev, [selectedBranchId]: { ...(prev[selectedBranchId] || {}), areas: newAreas } }));
      syncLayoutToSheet(layoutImage, newAreas); 
    }
    setCurrentRect(null);
  };

  const handlePrint = () => { 
    setIsExportingPdf(true);
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => executePDFExport();
      document.body.appendChild(script);
    } else {
      executePDFExport();
    }
  };

  const executePDFExport = () => {
    const element = document.getElementById('inventory-report-content');
    if (!element) {
      setIsExportingPdf(false);
      return;
    }

    const noPrintElements = document.querySelectorAll('.no-print');
    const pdfPrintOnlyElements = document.querySelectorAll('.pdf-print-only');
    
    noPrintElements.forEach(el => {
      el.setAttribute('data-original-display', el.style.display || '');
      el.style.display = 'none';
    });
    pdfPrintOnlyElements.forEach(el => {
      el.setAttribute('data-original-display', el.style.display || '');
      el.style.display = 'block';
    });

    const opt = {
      margin:       [0.4, 0.4, 0.4, 0.4],
      filename:     `Inventory_Report_${selectedBranchId || 'All'}.pdf`,
      image:        { type: 'jpeg', quality: 1.0 },
      html2canvas:  { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        letterRendering: false, 
        scrollY: 0,
        scrollX: 0 
      },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' },
      pagebreak:    { mode: ['css', 'legacy'], avoid: ['tr', 'td', '.avoid-break'] }
    };

    setTimeout(() => {
      window.html2pdf().set(opt).from(element).save().then(() => {
        noPrintElements.forEach(el => el.style.display = el.getAttribute('data-original-display') || '');
        pdfPrintOnlyElements.forEach(el => el.style.display = el.getAttribute('data-original-display') || 'none');
        setIsExportingPdf(false);
      }).catch(err => {
        console.error(err);
        noPrintElements.forEach(el => el.style.display = el.getAttribute('data-original-display') || '');
        pdfPrintOnlyElements.forEach(el => el.style.display = el.getAttribute('data-original-display') || 'none');
        setIsExportingPdf(false);
        showAlert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF: ' + err.message);
      });
    }, 100);
  };
  
  const currentTimestamp = new Date().toLocaleString('th-TH');

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div id="inventory-report-content" className="space-y-6 relative bg-gray-50 pb-10">
        {showPrintFallback && (
          <div className="fixed top-4 right-4 bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg shadow-lg z-50 no-print flex items-center gap-3">
            <span>เนื่องจากข้อจำกัดของเบราว์เซอร์<br/>กรุณากด <b>Ctrl + P</b> (หรือ Cmd + P บน Mac) เพื่อ Export เป็น PDF ครับ</span>
            <button onClick={() => setShowPrintFallback(false)} className="p-1 hover:bg-amber-200 rounded"><X size={16} /></button>
          </div>
        )}

        <div className="pdf-print-only mb-6" style={{ display: 'none' }}>
          <div className="text-center border-b pb-4 mb-4">
            <h1 className="text-2xl font-bold">รายงานตัดสต๊อกและสรุปพื้นที่</h1>
            <p className="text-gray-600 mt-2">พิมพ์เมื่อ: {currentTimestamp}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm font-medium">
            <div><span className="text-gray-500">บริษัท:</span> {selectedCompany || '-'}</div>
            <div><span className="text-gray-500">สาขา:</span> {currentBranch?.branch || '-'}</div>
            <div><span className="text-gray-500">หมายเลขสาขา:</span> {branchNumber || '-'}</div>
            <div><span className="text-gray-500">ผู้ทำรายการ:</span> {operatorName}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 no-print">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-blue-600"/> ข้อมูลสถานที่และผู้ทำรายการ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1. บริษัท</label>
              <select 
                className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" 
                value={selectedCompany} 
                onChange={(e) => { setSelectedCompany(e.target.value); setSelectedBranchId(''); }}
              >
                <option value="">-- ระบุบริษัท --</option>
                {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2. สาขา</label>
              <select 
                className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" 
                value={selectedBranchId} 
                onChange={(e) => setSelectedBranchId(e.target.value)} 
                disabled={!selectedCompany}
              >
                <option value="">-- ระบุสาขา --</option>
                {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.branch}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">3. หมายเลขสาขา</label>
              <input 
                type="text" 
                readOnly 
                value={branchNumber} 
                className="w-full px-4 py-2 border bg-gray-50 rounded-lg outline-none cursor-not-allowed" 
                placeholder="อัตโนมัติ" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-1">ชื่อผู้ทำรายการ</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <UserCircle size={18} className="text-blue-400" />
                </div>
                <input 
                  type="text" 
                  readOnly 
                  value={operatorName} 
                  className="w-full pl-10 pr-4 py-2 border border-blue-200 bg-blue-50 text-blue-800 rounded-lg outline-none cursor-not-allowed font-medium" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 break-inside-avoid">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <PackageSearch size={20} className="text-blue-600"/> 4. ตารางรายการสินค้าคงคลัง
            </h2>
            <div className="flex flex-wrap gap-2 no-print">
              {selectedBranchId && (
                <button onClick={() => setShowMasterModal(true)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Plus size={16}/> 5. เพิ่มรายการสินค้า
                </button>
              )}
              <button onClick={handleSaveToSheet} disabled={!selectedBranchId || isSaving || Object.keys(usageInputs).length === 0} className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-medium flex items-center gap-2">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>} บันทึกตัดยอด
              </button>
              <button onClick={handlePrint} disabled={!selectedBranchId || isExportingPdf} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 flex items-center gap-2 disabled:opacity-50">
                {isExportingPdf ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16}/>} 
                {isExportingPdf ? 'กำลังเตรียมไฟล์ PDF...' : '8. Export PDF'}
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm text-left print-table table-auto">
              <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-center w-[12%] min-w-[80px]">Picture</th>
                  <th className="px-3 py-3 font-mono w-[20%] min-w-[120px] break-words">Serial Number</th>
                  <th className="px-3 py-3 w-[25%] min-w-[150px] break-words">Name</th>
                  <th className="px-3 py-3 text-right text-gray-500 w-[15%] min-w-[100px] whitespace-nowrap">จำนวนจัดส่ง</th>
                  <th className="px-3 py-3 text-right text-blue-700 w-[15%] min-w-[100px] whitespace-nowrap">ยอดคงเหลือ</th>
                  <th className="px-3 py-3 text-center text-red-600 bg-red-50/50 w-[13%] min-w-[100px] whitespace-nowrap">จำนวนใช้งาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {branchItems.length > 0 ? branchItems.map((item) => {
                  const eq = (equipments || []).find(e => e.id === item.equipmentId);
                  const used = parseInt(usageInputs[item.id] || 0);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <td className="px-3 py-3 text-center">
                        {eq?.image ? (
                          <img src={eq.image} className="w-10 h-10 object-cover rounded mx-auto" alt="Equipment" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex justify-center items-center mx-auto">
                            <ImageIcon size={16} className="text-gray-400"/>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-gray-600 break-words">{eq?.serialNumber}</td>
                      <td className="px-3 py-3 font-medium break-words">{eq?.name}</td>
                      <td className="px-3 py-3 text-right text-gray-500 whitespace-nowrap">{item.deliveredQty.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right font-bold text-blue-700 whitespace-nowrap">{(item.currentBalance - used).toLocaleString()}</td>
                      <td className="px-3 py-2 text-center bg-red-50/20 whitespace-nowrap">
                        <input 
                          type="number" 
                          min="0" 
                          max={item.currentBalance} 
                          value={usageInputs[item.id] || ''} 
                          onChange={(e) => { 
                            let val = e.target.value; 
                            if(parseInt(val) > item.currentBalance) val = item.currentBalance; 
                            setUsageInputs({...usageInputs, [item.id]: val}); 
                          }} 
                          className="w-full text-center py-1.5 border border-red-200 rounded outline-none focus:border-red-500 font-bold text-red-600 no-print" 
                          placeholder="0" 
                        />
                        <span className="pdf-print-only font-bold text-red-600 text-base" style={{ display: 'none' }}>
                          {usageInputs[item.id] || 0}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="6" className="px-3 py-8 text-center text-gray-400">กรุณาเลือกสาขา หรือ เพิ่ม Master Data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 html2pdf__page-break" style={{ pageBreakBefore: 'always', marginTop: '20px' }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Map size={20} className="text-blue-600"/> Layout & พื้นที่ติดตั้ง
            </h2>
            {selectedBranchId && (
              <div className="flex gap-2 no-print">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Upload size={16}/> 6. อัพโหลด
                </button>
                <button 
                  disabled={!layoutImage}
                  onClick={() => setIsDrawingMode(!isDrawingMode)} 
                  className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${!layoutImage ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-600' : isDrawingMode ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}
                >
                  {isDrawingMode ? <><MousePointer2 size={16}/> ลากบนรูปได้เลย</> : <><Plus size={16}/> 7. ลากพื้นที่</>}
                </button>
              </div>
            )}
          </div>
          
          <div 
            className={`relative border-2 rounded-lg overflow-hidden bg-gray-100 min-h-[300px] flex items-center justify-center select-none ${isDrawingMode ? 'cursor-crosshair border-green-500' : 'border-gray-200'}`} 
            style={{ touchAction: isDrawingMode ? 'none' : 'auto' }} 
            ref={imageContainerRef} 
            onMouseDown={handlePointerDown} 
            onMouseMove={handlePointerMove} 
            onMouseUp={handlePointerUp} 
            onMouseLeave={handlePointerUp} 
            onTouchStart={handlePointerDown} 
            onTouchMove={handlePointerMove} 
            onTouchEnd={handlePointerUp}
          >
            {layoutImage ? (
              <>
                <img 
                  src={layoutImage} 
                  alt="Layout" 
                  className="w-full h-auto object-contain pointer-events-none" 
                  style={{ display: 'block' }} 
                />
                {areas.map((area) => (
                  <div 
                    key={area.id} 
                    className="absolute bg-green-500/60 border-2 border-green-700" 
                    style={{ 
                      left: `${area.rect.x}%`, 
                      top: `${area.rect.y}%`, 
                      width: `${area.rect.w}%`, 
                      height: `${area.rect.h}%`,
                      boxSizing: 'border-box' 
                    }}
                  />
                ))}
                {currentRect && (
                  <div 
                    className="absolute bg-green-500/40 border-2 border-green-500 border-dashed pointer-events-none" 
                    style={{ 
                      left: `${currentRect.x}%`, 
                      top: `${currentRect.y}%`, 
                      width: `${currentRect.w}%`, 
                      height: `${currentRect.h}%`,
                      boxSizing: 'border-box'
                    }} 
                  />
                )}
              </>
            ) : (
              <div className="text-gray-400 text-center py-10">
                <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p>อัพโหลดรูปภาพ Layout</p>
              </div>
            )}
          </div>
        </div>

        {showMasterModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="text-xl font-bold mb-4">เพิ่ม Master Data</h3>
              <form onSubmit={handleAddMasterData} className="space-y-4">
                <select required value={masterEqId} onChange={(e) => setMasterEqId(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">-- เลือกอุปกรณ์ --</option>
                  {(equipments || []).map(eq => <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialNumber})</option>)}
                </select>
                <input type="number" min="1" required value={masterQty} onChange={(e) => setMasterQty(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="จำนวนที่จัดส่งตั้งต้น" />
                <div className="flex gap-2">
                  <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg flex justify-center">
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'เพิ่มลงตาราง'}
                  </button>
                  <button type="button" onClick={() => setShowMasterModal(false)} className="px-4 py-2 bg-gray-100 rounded-lg">ยกเลิก</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DatabaseMenu({ equipments, setEquipments, stores, setStores, executeApi, showAlert, showConfirm }) {
  const [activeTab, setActiveTab] = useState('equipment'); 
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setActiveTab('equipment')} className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'equipment' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Equipment</button>
        <button onClick={() => setActiveTab('store')} className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'store' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}>Store</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'equipment' && <EquipmentManager equipments={equipments} setEquipments={setEquipments} executeApi={executeApi} showConfirm={showConfirm} />}
        {activeTab === 'store' && <StoreManager stores={stores} setStores={setStores} executeApi={executeApi} showConfirm={showConfirm} />}
      </div>
    </div>
  );
}

function EquipmentManager({ equipments, setEquipments, executeApi, showConfirm }) {
  const [form, setForm] = useState({ id: '', serialNumber: '', name: '', image: null });
  const [isSaving, setIsSaving] = useState(false); 
  const fileRef = useRef();
  
  const handleImage = (e) => { 
    const file = e.target.files[0]; 
    if (file) { 
      compressImage(file, (compressedDataUrl) => { 
        setForm({...form, image: compressedDataUrl}); 
      }); 
    } 
    if (fileRef.current) fileRef.current.value = '';
  };
  
  const save = async (e) => { 
    e.preventDefault(); 
    setIsSaving(true); 
    const data = { ...form, id: form.id || 'EQ-' + Date.now() }; 
    const success = await executeApi('saveEquipment', data); 
    if (success) { 
      if (form.id) {
        setEquipments((equipments || []).map(eq => eq.id === data.id ? data : eq)); 
      } else {
        setEquipments([...(equipments || []), data]); 
      }
      setForm({ id: '', serialNumber: '', name: '', image: null }); 
    } 
    setIsSaving(false); 
  };

  const del = (id) => { 
    showConfirm('ลบ?', async () => {
      const success = await executeApi('deleteEquipment', { id }); 
      if(success) setEquipments((equipments || []).filter(e => e.id !== id)); 
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 border p-5 rounded-xl bg-slate-50">
        <h3 className="font-bold mb-4">{form.id ? 'แก้ไข' : 'เพิ่ม'}อุปกรณ์</h3>
        <form onSubmit={save} className="space-y-4">
          <input type="file" ref={fileRef} onChange={handleImage} className="hidden" />
          <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed p-4 text-center cursor-pointer bg-white rounded-lg">
            {form.image ? (
              <img src={form.image} className="h-32 object-contain mx-auto" alt="preview" />
            ) : (
              <div className="py-4 text-sm text-blue-600">อัพโหลดรูป</div>
            )}
          </div>
          <input 
            required 
            placeholder="Serial Number" 
            value={form.serialNumber} 
            onChange={e => setForm({...form, serialNumber: e.target.value})} 
            className="w-full border p-2.5 rounded-lg" 
          />
          <input 
            required 
            placeholder="Name" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            className="w-full border p-2.5 rounded-lg" 
          />
          <div className="flex gap-2">
            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white py-2.5 rounded-lg w-full flex justify-center">
              {isSaving ? <Loader2 className="animate-spin" /> : 'บันทึก'}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm({id:'', serialNumber:'', name:'', image:null})} className="bg-gray-200 py-2.5 px-4 rounded-lg">ยกเลิก</button>
            )}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(equipments || []).map(eq => (
          <div key={eq.id} className="border rounded-xl p-3 flex flex-col justify-between hover:shadow-md bg-white">
            <div>
              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                {eq.image ? <img src={eq.image} className="h-full object-contain" alt="item" /> : <ImageIcon className="text-gray-300" size={40}/>}
              </div>
              <p className="text-xs font-mono text-gray-500">{eq.serialNumber}</p>
              <p className="font-bold line-clamp-1">{eq.name}</p>
            </div>
            <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
              <button onClick={()=>setForm(eq)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm">แก้ไข</button>
              <button onClick={()=>del(eq.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm">ลบ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreManager({ stores, setStores, executeApi, showConfirm }) {
  const companies = [...new Set((stores || []).map(s => s.company))];
  const [form, setForm] = useState({ id: '', company: '', newCompany: '', branchNumber: '', branch: '' });
  const [isSaving, setIsSaving] = useState(false);

  const save = async (e) => { 
    e.preventDefault(); 
    setIsSaving(true); 
    const finalCompany = form.company === 'NEW' ? form.newCompany : form.company; 
    const data = { id: form.id || 'ST-' + Date.now(), company: finalCompany, branchNumber: form.branchNumber, branch: form.branch }; 
    const success = await executeApi('saveStore', data); 
    if (success) { 
      if(form.id) {
        setStores((stores || []).map(s => s.id === data.id ? data : s)); 
      } else {
        setStores([...(stores || []), data]); 
      }
      setForm({ id: '', company: '', newCompany: '', branchNumber: '', branch: '' }); 
    } 
    setIsSaving(false); 
  };

  const del = (id) => { 
    showConfirm('ลบ?', async () => {
      const success = await executeApi('deleteStore', { id }); 
      if(success) setStores((stores || []).filter(s => s.id !== id)); 
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 border p-5 rounded-xl bg-slate-50">
        <h3 className="font-bold mb-4">{form.id ? 'แก้ไข' : 'เพิ่ม'}สาขา</h3>
        <form onSubmit={save} className="space-y-4">
          <select required value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full border p-2.5 rounded-lg">
            <option value="">-- เลือกบริษัท --</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="NEW">+ เพิ่มบริษัทใหม่</option>
          </select>
          {form.company === 'NEW' && (
            <input required placeholder="ชื่อบริษัทใหม่" value={form.newCompany} onChange={e => setForm({...form, newCompany: e.target.value})} className="w-full border p-2.5 rounded-lg" />
          )}
          <input required placeholder="หมายเลขสาขา (เช่น 0001)" value={form.branchNumber} onChange={e => setForm({...form, branchNumber: e.target.value})} className="w-full border p-2.5 rounded-lg" />
          <input required placeholder="ชื่อสาขา" value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="w-full border p-2.5 rounded-lg" />
          <div className="flex gap-2">
            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white py-2.5 rounded-lg w-full flex justify-center">
              {isSaving ? <Loader2 className="animate-spin" /> : 'บันทึก'}
            </button>
            {form.id && (
              <button type="button" onClick={() => setForm({id: '', company: '', newCompany: '', branchNumber: '', branch: ''})} className="bg-gray-200 py-2.5 px-4 rounded-lg">ยกเลิก</button>
            )}
          </div>
        </form>
      </div>
      
      <div className="lg:col-span-2 flex flex-col gap-3">
        {(stores || []).map(st => (
          <div key={st.id} className="border p-4 rounded-xl flex justify-between items-center bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Store size={20}/></div>
              <div>
                <p className="font-bold text-gray-800">{st.company}</p>
                <p className="text-sm text-gray-500">{st.branchNumber} | {st.branch}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setForm(st)} className="p-2 bg-slate-100 rounded"><Edit size={16}/></button>
              <button onClick={() => del(st.id)} className="p-2 bg-red-50 text-red-600 rounded"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}