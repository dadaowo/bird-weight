import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { 
  Plus, Trash2, Edit2, Scale, Calendar, FileDown, TrendingUp, Search, UserPlus, Bird, AlertCircle
} from 'lucide-react';
import Layout from './components/Layout';
import { Modal, ConfirmModal } from './components/Modals';
import { exportPetsToExcel } from './services/excelService';
import { generateId, getTodayStr, getRandomColor, formatGram, formatDateDisplay, BUDGIE_COLORS } from './utils';
import { Pet, WeightRecord, ViewMode } from './types';

// Initial Demo Data
const INITIAL_PETS: Pet[] = [
  { id: 'p1', name: '皮皮', species: '虎皮鸚鵡', color: BUDGIE_COLORS[0], createdAt: Date.now() },
  { id: 'p2', name: '藍寶', species: '虎皮鸚鵡', color: BUDGIE_COLORS[1], createdAt: Date.now() }
];

const INITIAL_LOGS: WeightRecord[] = [
  { id: 'l1', petId: 'p1', weight: 32, date: '2023-10-01', timestamp: 1696118400000 },
  { id: 'l2', petId: 'p1', weight: 33, date: '2023-10-08', timestamp: 1696723200000 },
  { id: 'l3', petId: 'p1', weight: 32.5, date: '2023-10-15', timestamp: 1697328000000 },
  { id: 'l4', petId: 'p2', weight: 38, date: '2023-10-01', timestamp: 1696118400000 },
  { id: 'l5', petId: 'p2', weight: 37, date: '2023-10-08', timestamp: 1696723200000 },
];

function App() {
  // --- State ---
  const [pets, setPets] = useState<Pet[]>(() => {
    const saved = localStorage.getItem('budgieFit_pets');
    return saved ? JSON.parse(saved) : INITIAL_PETS;
  });
  
  const [logs, setLogs] = useState<WeightRecord[]>(() => {
    const saved = localStorage.getItem('budgieFit_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [view, setView] = useState<ViewMode>('dashboard');
  
  // Modals state
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [isEditPetOpen, setIsEditPetOpen] = useState(false);
  const [isEditLogOpen, setIsEditLogOpen] = useState(false);
  
  // Selection / Editing state
  const [selectedPetId, setSelectedPetId] = useState<string | 'all'>('all');
  const [targetPet, setTargetPet] = useState<Pet | null>(null);
  const [targetLog, setTargetLog] = useState<WeightRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'pet' | 'log', id: string } | null>(null);

  // Form states
  const [petForm, setPetForm] = useState({ name: '', species: '虎皮鸚鵡' });
  const [logForm, setLogForm] = useState({ petId: '', weight: '', date: getTodayStr(), notes: '' });

  // Chart Config
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('budgieFit_pets', JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem('budgieFit_logs', JSON.stringify(logs));
  }, [logs]);

  // --- Handlers ---

  const handleAddPet = () => {
    if (!petForm.name.trim()) return;
    const newPet: Pet = {
      id: generateId(),
      name: petForm.name,
      species: petForm.species,
      color: getRandomColor(pets.length),
      createdAt: Date.now()
    };
    setPets([...pets, newPet]);
    setPetForm({ name: '', species: '虎皮鸚鵡' });
    setIsAddPetOpen(false);
  };

  const handleUpdatePet = () => {
    if (!targetPet || !petForm.name.trim()) return;
    setPets(pets.map(p => p.id === targetPet.id ? { ...p, name: petForm.name, species: petForm.species } : p));
    setIsEditPetOpen(false);
    setTargetPet(null);
  };

  const handleDeletePet = () => {
    if (!deleteConfirm || deleteConfirm.type !== 'pet') return;
    const id = deleteConfirm.id;
    setPets(pets.filter(p => p.id !== id));
    setLogs(logs.filter(l => l.petId !== id)); // Cascade delete logs
    if (selectedPetId === id) setSelectedPetId('all');
    setDeleteConfirm(null);
  };

  const handleAddLog = () => {
    if (!logForm.petId || !logForm.weight || !logForm.date) return;
    const newLog: WeightRecord = {
      id: generateId(),
      petId: logForm.petId,
      weight: parseFloat(logForm.weight),
      date: logForm.date,
      notes: logForm.notes,
      timestamp: new Date(logForm.date).getTime()
    };
    setLogs([...logs, newLog]);
    setLogForm({ ...logForm, weight: '', notes: '' });
    setIsAddLogOpen(false);
  };

  const handleUpdateLog = () => {
    if (!targetLog || !logForm.weight || !logForm.date) return;
    const updatedLog: WeightRecord = {
      ...targetLog,
      weight: parseFloat(logForm.weight),
      date: logForm.date,
      notes: logForm.notes,
      timestamp: new Date(logForm.date).getTime()
    };
    setLogs(logs.map(l => l.id === targetLog.id ? updatedLog : l));
    setIsEditLogOpen(false);
    setTargetLog(null);
  };

  const handleDeleteLog = () => {
    if (!deleteConfirm || deleteConfirm.type !== 'log') return;
    setLogs(logs.filter(l => l.id !== deleteConfirm.id));
    setDeleteConfirm(null);
  };

  const openAddLog = (preSelectedPetId?: string) => {
    setLogForm({
      petId: preSelectedPetId || (pets.length > 0 ? pets[0].id : ''),
      weight: '',
      date: getTodayStr(),
      notes: ''
    });
    setIsAddLogOpen(true);
  };

  const openEditPet = (pet: Pet) => {
    setTargetPet(pet);
    setPetForm({ name: pet.name, species: pet.species });
    setIsEditPetOpen(true);
  };

  const openEditLog = (log: WeightRecord) => {
    setTargetLog(log);
    setLogForm({
      petId: log.petId,
      weight: log.weight.toString(),
      date: log.date,
      notes: log.notes || ''
    });
    setIsEditLogOpen(true);
  };

  // --- Data Processing ---
  
  const chartData = useMemo(() => {
    const allDates = Array.from(new Set(logs.map(l => l.date))).sort();
    return allDates.map(date => {
      const point: any = { date };
      pets.forEach(pet => {
        const entry = logs.filter(l => l.petId === pet.id && l.date === date)
          .sort((a,b) => b.timestamp - a.timestamp)[0]; // Get latest for that day
        if (entry) {
          point[pet.id] = entry.weight;
        }
      });
      return point;
    });
  }, [logs, pets]);

  const displayLogs = useMemo(() => {
    let filtered = logs;
    if (selectedPetId !== 'all') {
      filtered = filtered.filter(l => l.petId === selectedPetId);
    }
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, selectedPetId]);

  const getPetName = (id: string) => pets.find(p => p.id === id)?.name || '未知';

  return (
    <Layout currentView={view} onNavigate={setView}>
      {/* --- DASHBOARD VIEW --- */}
      {view === 'dashboard' && (
        <div className="space-y-8">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
                <TrendingUp className="text-emerald-500" />
                體重總覽
              </h2>
              <p className="text-stone-500">管理您所有鳥寶的健康數據</p>
            </div>
            <div className="flex gap-3">
               <button 
                onClick={() => exportPetsToExcel(pets, logs)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
              >
                <FileDown className="w-4 h-4" />
                匯出 Excel
              </button>
              <button 
                onClick={() => setIsAddPetOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors shadow-lg shadow-stone-200 font-medium"
              >
                <UserPlus className="w-4 h-4" />
                新增鳥寶
              </button>
            </div>
          </div>

          {/* Pet Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map(pet => {
              const petLogs = logs.filter(l => l.petId === pet.id).sort((a,b) => b.timestamp - a.timestamp);
              const latestLog = petLogs[0];
              const prevLog = petLogs[1];
              const weightDiff = latestLog && prevLog ? (latestLog.weight - prevLog.weight).toFixed(1) : null;

              return (
                <div key={pet.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: pet.color }}>
                        {pet.name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-stone-800">{pet.name}</h3>
                        <p className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full inline-block">{pet.species}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditPet(pet)} className="p-2 text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm({type: 'pet', id: pet.id})} className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-stone-500 text-sm">最新體重</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold text-stone-800">
                          {latestLog ? latestLog.weight : '--'}
                        </span>
                        <span className="text-stone-400 ml-1">g</span>
                      </div>
                    </div>

                    {latestLog && (
                       <div className="flex items-center justify-between text-sm">
                         <span className="text-stone-400">{formatDateDisplay(latestLog.date)}</span>
                         {weightDiff && (
                           <span className={`flex items-center ${parseFloat(weightDiff) > 0 ? 'text-amber-500' : parseFloat(weightDiff) < 0 ? 'text-emerald-500' : 'text-stone-400'}`}>
                             {parseFloat(weightDiff) > 0 ? '+' : ''}{weightDiff}g
                           </span>
                         )}
                       </div>
                    )}
                  </div>

                  <button 
                    onClick={() => openAddLog(pet.id)}
                    className="w-full mt-6 py-2.5 border border-dashed border-stone-300 rounded-xl text-stone-500 hover:bg-stone-50 hover:border-emerald-300 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    紀錄體重
                  </button>
                </div>
              );
            })}
            
            {/* Add Pet Card (Empty State) */}
            {pets.length === 0 && (
               <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-stone-300">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bird className="w-8 h-8 text-stone-400" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-700">還沒有鳥寶資料</h3>
                  <p className="text-stone-500 mb-6">開始新增您的第一隻鸚鵡吧！</p>
                  <button onClick={() => setIsAddPetOpen(true)} className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium">
                    新增鳥寶
                  </button>
               </div>
            )}
          </div>
        </div>
      )}

      {/* --- HISTORY VIEW --- */}
      {view === 'history' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Calendar className="text-emerald-500" />
              歷史紀錄
            </h2>
            <div className="flex gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-48">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                 <select 
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                 >
                   <option value="all">所有鳥寶</option>
                   {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
               </div>
               <button 
                  onClick={() => openAddLog()}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md shadow-emerald-200 flex items-center gap-2 shrink-0"
               >
                 <Plus className="w-4 h-4" /> 紀錄
               </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="px-6 py-4 text-left text-sm font-bold text-stone-600">日期</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-stone-600">鳥寶</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-stone-600">體重</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-stone-600">備註</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-stone-600">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {displayLogs.length > 0 ? displayLogs.map(log => {
                    const pet = pets.find(p => p.id === log.petId);
                    return (
                      <tr key={log.id} className="hover:bg-emerald-50/50 transition-colors group">
                        <td className="px-6 py-4 text-stone-600 font-medium whitespace-nowrap">
                          {log.date}
                        </td>
                        <td className="px-6 py-4">
                          {pet ? (
                             <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-stone-100 text-xs font-bold text-stone-600 border border-stone-200" style={{ borderLeftColor: pet.color, borderLeftWidth: 3 }}>
                               {pet.name}
                             </span>
                          ) : <span className="text-stone-400">已刪除</span>}
                        </td>
                        <td className="px-6 py-4 text-stone-800 font-bold">
                          {log.weight}g
                        </td>
                        <td className="px-6 py-4 text-stone-500 text-sm max-w-xs truncate">
                          {log.notes || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditLog(log)} className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm({type: 'log', id: log.id})} className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-100 rounded-md transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-stone-400">
                        尚無紀錄
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- CHARTS VIEW --- */}
      {view === 'charts' && (
        <div className="space-y-6 h-full flex flex-col">
          <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Scale className="text-emerald-500" />
              趨勢分析
            </h2>
            <div className="bg-white p-1 rounded-lg border border-stone-200 flex gap-1">
              <button 
                onClick={() => setChartType('line')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'line' ? 'bg-emerald-500 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                折線圖
              </button>
              <button 
                onClick={() => setChartType('bar')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${chartType === 'bar' ? 'bg-emerald-500 text-white shadow-sm' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                長條圖
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[400px] bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-stone-100">
             <ResponsiveContainer width="100%" height="100%">
               {chartType === 'line' ? (
                 <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{fontSize: 12}} tickMargin={10} />
                    <YAxis stroke="#9ca3af" tick={{fontSize: 12}} unit="g" domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <ReferenceLine y={30} label="Min (30g)" stroke="red" strokeDasharray="3 3" opacity={0.3} />
                    <ReferenceLine y={40} label="Max (40g)" stroke="red" strokeDasharray="3 3" opacity={0.3} />
                    {pets.map(pet => (
                      <Line 
                        key={pet.id}
                        type="monotone" 
                        dataKey={pet.id} 
                        name={pet.name}
                        stroke={pet.color} 
                        strokeWidth={3}
                        dot={{ r: 4, fill: pet.color, strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6 }}
                        connectNulls
                      />
                    ))}
                 </LineChart>
               ) : (
                 <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#9ca3af" tick={{fontSize: 12}} tickMargin={10} />
                    <YAxis stroke="#9ca3af" tick={{fontSize: 12}} unit="g" domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip 
                       cursor={{ fill: '#f3f4f6' }}
                       contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    {pets.map(pet => (
                      <Bar 
                        key={pet.id}
                        dataKey={pet.id} 
                        name={pet.name}
                        fill={pet.color}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                      />
                    ))}
                 </BarChart>
               )}
             </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* --- MODALS --- */}
      
      {/* Add Pet */}
      <Modal isOpen={isAddPetOpen} onClose={() => setIsAddPetOpen(false)} title="新增鳥寶">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">名字</label>
            <input 
              type="text" 
              value={petForm.name} 
              onChange={e => setPetForm({...petForm, name: e.target.value})}
              className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500" 
              placeholder="例如：皮皮" 
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">種類</label>
            <input 
              type="text" 
              value={petForm.species} 
              onChange={e => setPetForm({...petForm, species: e.target.value})}
              className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500" 
            />
          </div>
          <button 
            onClick={handleAddPet}
            className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 font-medium mt-4"
          >
            建立檔案
          </button>
        </div>
      </Modal>

      {/* Edit Pet */}
      <Modal isOpen={isEditPetOpen} onClose={() => setIsEditPetOpen(false)} title="編輯鳥寶資料">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">名字</label>
            <input 
              type="text" 
              value={petForm.name} 
              onChange={e => setPetForm({...petForm, name: e.target.value})}
              className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">種類</label>
            <input 
              type="text" 
              value={petForm.species} 
              onChange={e => setPetForm({...petForm, species: e.target.value})}
              className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500" 
            />
          </div>
          <button 
            onClick={handleUpdatePet}
            className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 font-medium mt-4"
          >
            儲存變更
          </button>
        </div>
      </Modal>

      {/* Add Log */}
      <Modal isOpen={isAddLogOpen} onClose={() => setIsAddLogOpen(false)} title="紀錄體重">
        <div className="space-y-4">
          <div>
             <label className="block text-sm font-medium text-stone-700 mb-1">選擇鳥寶</label>
             <select 
               value={logForm.petId}
               onChange={e => setLogForm({...logForm, petId: e.target.value})}
               className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
             >
               {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-stone-700 mb-1">日期</label>
               <input 
                 type="date"
                 value={logForm.date}
                 onChange={e => setLogForm({...logForm, date: e.target.value})}
                 className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-stone-700 mb-1">體重 (g)</label>
               <input 
                 type="number"
                 step="0.1"
                 value={logForm.weight}
                 onChange={e => setLogForm({...logForm, weight: e.target.value})}
                 className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
                 placeholder="35.0"
                 autoFocus
               />
             </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-stone-700 mb-1">備註 (選填)</label>
             <input 
               type="text"
               value={logForm.notes}
               onChange={e => setLogForm({...logForm, notes: e.target.value})}
               className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
               placeholder="例如：食慾不錯"
             />
          </div>
          <button 
            onClick={handleAddLog}
            className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 font-medium mt-4"
          >
            新增紀錄
          </button>
        </div>
      </Modal>

      {/* Edit Log */}
      <Modal isOpen={isEditLogOpen} onClose={() => setIsEditLogOpen(false)} title="修改紀錄">
        <div className="space-y-4">
          <div className="p-3 bg-stone-50 rounded-lg text-sm text-stone-600">
             正在修改 <strong>{targetLog && getPetName(targetLog.petId)}</strong> 的紀錄
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-stone-700 mb-1">日期</label>
               <input 
                 type="date"
                 value={logForm.date}
                 onChange={e => setLogForm({...logForm, date: e.target.value})}
                 className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-stone-700 mb-1">體重 (g)</label>
               <input 
                 type="number"
                 step="0.1"
                 value={logForm.weight}
                 onChange={e => setLogForm({...logForm, weight: e.target.value})}
                 className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
               />
             </div>
          </div>
          <div>
             <label className="block text-sm font-medium text-stone-700 mb-1">備註</label>
             <input 
               type="text"
               value={logForm.notes}
               onChange={e => setLogForm({...logForm, notes: e.target.value})}
               className="w-full rounded-lg border-stone-200 focus:border-emerald-500 focus:ring-emerald-500"
             />
          </div>
          <button 
            onClick={handleUpdateLog}
            className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 font-medium mt-4"
          >
            更新紀錄
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={deleteConfirm?.type === 'pet' ? handleDeletePet : handleDeleteLog}
        title={deleteConfirm?.type === 'pet' ? "刪除鳥寶資料" : "刪除紀錄"}
        message={deleteConfirm?.type === 'pet' 
          ? "確定要刪除這位鳥寶嗎？所有的體重歷史紀錄也會一併消失，且無法復原。" 
          : "確定要刪除這筆體重紀錄嗎？此動作無法復原。"
        }
        type="danger"
      />

    </Layout>
  );
}

export default App;