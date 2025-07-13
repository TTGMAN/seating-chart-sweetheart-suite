import { useState, useCallback } from 'react';
import { Guest, Table, SeatingChartData } from '@/types/wedding';

// Generate default tables
const generateDefaultTables = (): Table[] => {
  const tables: Table[] = [];
  
  // Head table
  tables.push({
    id: 'head-table',
    name: 'Head Table',
    capacity: 10,
    guests: [],
    isHeadTable: true
  });
  
  // Regular tables 1-12
  for (let i = 1; i <= 12; i++) {
    tables.push({
      id: `table-${i}`,
      name: `Table ${i}`,
      capacity: 8,
      guests: [],
      isHeadTable: false
    });
  }
  
  return tables;
};

export function useSeatingChart() {
  const [tables, setTables] = useState<Table[]>(generateDefaultTables());
  const [guests, setGuests] = useState<Guest[]>([]);

  // Add a single guest
  const addGuest = useCallback((guestData: Omit<Guest, 'id'>) => {
    const newGuest: Guest = {
      ...guestData,
      id: `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setGuests(prev => [...prev, newGuest]);
  }, []);

  // Add multiple guests in bulk
  const bulkAddGuests = useCallback((names: string[], side: 'bride' | 'groom' | 'both') => {
    const newGuests: Guest[] = names.map((name, index) => ({
      id: `guest-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      side,
      rsvpStatus: 'pending' as const
    }));
    setGuests(prev => [...prev, ...newGuests]);
  }, []);

  // Update guest
  const updateGuest = useCallback((guestId: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(guest => 
      guest.id === guestId ? { ...guest, ...updates } : guest
    ));
    
    // If tableId is being updated, also update the tables
    if (updates.tableId !== undefined) {
      setTables(prevTables => {
        return prevTables.map(table => {
          // Remove guest from all tables first
          const filteredGuests = table.guests.filter(g => g.id !== guestId);
          
          // Add guest to new table if tableId matches
          if (table.id === updates.tableId) {
            const guest = guests.find(g => g.id === guestId);
            if (guest && filteredGuests.length < table.capacity) {
              return { ...table, guests: [...filteredGuests, { ...guest, ...updates }] };
            }
          }
          
          return { ...table, guests: filteredGuests };
        });
      });
    }
  }, [guests]);

  // Delete guest
  const deleteGuest = useCallback((guestId: string) => {
    setGuests(prev => prev.filter(guest => guest.id !== guestId));
    setTables(prev => prev.map(table => ({
      ...table,
      guests: table.guests.filter(guest => guest.id !== guestId)
    })));
  }, []);

  // Update table
  const updateTable = useCallback((tableId: string, updates: Partial<Table>) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, ...updates } : table
    ));
  }, []);

  // Remove guest from table
  const removeGuestFromTable = useCallback((guestId: string, tableId: string) => {
    setTables(prev => prev.map(table => 
      table.id === tableId 
        ? { ...table, guests: table.guests.filter(g => g.id !== guestId) }
        : table
    ));
    
    // Update guest to remove tableId
    setGuests(prev => prev.map(guest => 
      guest.id === guestId ? { ...guest, tableId: undefined } : guest
    ));
  }, []);

  // Get unassigned guests
  const unassignedGuests = guests.filter(guest => !guest.tableId);
  
  // Get assigned guests
  const assignedGuests = guests.filter(guest => guest.tableId);

  // Export CSV
  const exportCSV = useCallback(() => {
    const csvData = guests.map(guest => ({
      Name: guest.name,
      Side: guest.side,
      Table: guest.tableId ? tables.find(t => t.id === guest.tableId)?.name || 'Unassigned' : 'Unassigned',
      'RSVP Status': guest.rsvpStatus,
      'Meal Choice': guest.mealChoice || '',
      Notes: guest.notes || ''
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wedding-seating-chart-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [guests, tables]);

  // Import CSV
  const importCSV = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const newGuests: Guest[] = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const name = values[headers.indexOf('Name')] || values[0];
          const side = values[headers.indexOf('Side')] || 'both';
          
          return {
            id: `imported-${Date.now()}-${index}`,
            name,
            side: ['bride', 'groom', 'both'].includes(side) ? side as any : 'both',
            rsvpStatus: 'pending' as const,
            mealChoice: values[headers.indexOf('Meal Choice')] || undefined,
            notes: values[headers.indexOf('Notes')] || undefined
          };
        })
        .filter(guest => guest.name);
      
      setGuests(prev => [...prev, ...newGuests]);
    };
    reader.readAsText(file);
  }, []);

  return {
    tables,
    guests,
    unassignedGuests,
    assignedGuests,
    totalGuests: guests.length,
    assignedGuestsCount: assignedGuests.length,
    addGuest,
    bulkAddGuests,
    updateGuest,
    deleteGuest,
    updateTable,
    removeGuestFromTable,
    exportCSV,
    importCSV
  };
}