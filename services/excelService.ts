import * as XLSX from 'xlsx';
import { Pet, WeightRecord } from '../types';

export const exportPetsToExcel = (pets: Pet[], logs: WeightRecord[]) => {
  const wb = XLSX.utils.book_new();

  // 1. Overview Sheet (Summary)
  const summaryData = pets.map(pet => {
    const petLogs = logs
      .filter(l => l.petId === pet.id)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return {
      '鳥寶名稱': pet.name,
      '種類': pet.species,
      '最新體重 (g)': petLogs.length > 0 ? petLogs[0].weight : '-',
      '最新紀錄日期': petLogs.length > 0 ? petLogs[0].date : '-',
      '紀錄筆數': petLogs.length
    };
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, "總覽");

  // 2. Individual Sheet for each Pet
  pets.forEach(pet => {
    const petLogs = logs
      .filter(l => l.petId === pet.id)
      .sort((a, b) => b.timestamp - a.timestamp) // Newest first for excel
      .map(log => ({
        '日期': log.date,
        '體重 (g)': log.weight,
        '備註': log.notes || ''
      }));

    if (petLogs.length > 0) {
      const ws = XLSX.utils.json_to_sheet(petLogs);
      // Excel sheet names notes: strict limits on length and characters, but simple names work
      const sheetName = pet.name.substring(0, 30); 
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
  });

  // Write file
  XLSX.writeFile(wb, `鳥寶體重紀錄_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
