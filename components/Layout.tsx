import React, { useState } from 'react';
import { ViewMode } from '../types';
import { 
  LayoutDashboard, 
  History, 
  LineChart, 
  Menu, 
  X,
  Bird,
  Feather
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: '總覽與紀錄', icon: LayoutDashboard },
    { id: 'history', label: '詳細歷史列表', icon: History },
    { id: 'charts', label: '趨勢圖表分析', icon: LineChart },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-emerald-50 border-r border-emerald-100">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-emerald-500 p-2 rounded-xl shadow-lg">
          <Bird className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-emerald-900 tracking-tight">BudgieFit</h1>
          <p className="text-xs text-emerald-600 font-medium">鸚鵡體重管理</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onNavigate(item.id as ViewMode);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium ${
              currentView === item.id
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : 'text-emerald-500 group-hover:text-emerald-600'}`} />
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="p-4 m-4 bg-yellow-100/50 rounded-xl border border-yellow-200">
         <div className="flex items-start gap-2">
            <Feather className="w-4 h-4 text-yellow-600 mt-1" />
            <p className="text-xs text-yellow-800 leading-relaxed">
              虎皮鸚鵡的正常體重約為 30-40g。記得每週定期測量喔！
            </p>
         </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-stone-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 h-full shadow-xl z-10">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-stone-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
           <Bird className="w-6 h-6 text-emerald-500" />
           <span className="font-bold text-emerald-900">BudgieFit</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-stone-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-16 left-0 w-64 h-[calc(100%-4rem)] bg-white shadow-2xl transform transition-transform duration-300">
            <NavContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto pt-16 md:pt-0 scroll-smooth">
        <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
