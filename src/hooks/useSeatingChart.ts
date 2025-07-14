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

  // Helper function to find table by name
  const findTableByName = useCallback((tableName: string): string | undefined => {
    if (!tableName || tableName.toLowerCase() === 'unassigned') return undefined;
    
    // Try exact match first
    let table = tables.find(t => t.name.toLowerCase() === tableName.toLowerCase());
    
    // If not found, try partial match
    if (!table) {
      table = tables.find(t => 
        t.name.toLowerCase().includes(tableName.toLowerCase()) ||
        tableName.toLowerCase().includes(t.name.toLowerCase())
      );
    }
    
    return table?.id;
  }, [tables]);

  // Import CSV with enhanced parsing
  const importCSV = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) return;
      
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
      console.log('CSV Headers found:', headers);
      
      const newGuests: Guest[] = [];
      const guestsToAssign: { guest: Guest; tableName: string }[] = [];
      
      lines.slice(1).forEach((line, index) => {
        if (!line.trim()) return;
        
        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
        
        // Find column indices
        const nameIndex = headers.findIndex(h => 
          h.includes('name') || h === 'guest'
        );
        const sideIndex = headers.findIndex(h => 
          h.includes('side') || h.includes('party')
        );
        const tableIndex = headers.findIndex(h => 
          h.includes('table') || h.includes('seating')
        );
        const rsvpIndex = headers.findIndex(h => 
          h.includes('rsvp') || h.includes('accepted') || h.includes('attending') || h.includes('status')
        );
        const mealIndex = headers.findIndex(h => 
          h.includes('meal') || h.includes('food') || h.includes('dietary')
        );
        const notesIndex = headers.findIndex(h => 
          h.includes('notes') || h.includes('comment')
        );
        
        const name = values[nameIndex] || values[0] || '';
        if (!name) return;
        
        const sideValue = values[sideIndex] || 'both';
        const side = ['bride', 'groom', 'both'].includes(sideValue.toLowerCase()) 
          ? sideValue.toLowerCase() as 'bride' | 'groom' | 'both'
          : 'both';
        
        // Parse RSVP status
        const rsvpValue = values[rsvpIndex] || 'pending';
        let rsvpStatus: 'pending' | 'attending' | 'declined' = 'pending';
        
        const rsvpLower = rsvpValue.toLowerCase();
        if (rsvpLower.includes('yes') || rsvpLower.includes('accepted') || rsvpLower.includes('attending') || rsvpLower === 'true') {
          rsvpStatus = 'attending';
        } else if (rsvpLower.includes('no') || rsvpLower.includes('declined') || rsvpLower === 'false') {
          rsvpStatus = 'declined';
        }
        
        const newGuest: Guest = {
          id: `imported-${Date.now()}-${index}`,
          name,
          side,
          rsvpStatus,
          mealChoice: values[mealIndex] || undefined,
          notes: values[notesIndex] || undefined
        };
        
        newGuests.push(newGuest);
        
        // Handle table assignment
        const tableName = values[tableIndex];
        if (tableName && tableName.toLowerCase() !== 'unassigned') {
          guestsToAssign.push({ guest: newGuest, tableName });
        }
      });
      
      console.log(`Importing ${newGuests.length} guests`);
      
      // Add guests first
      setGuests(prev => [...prev, ...newGuests]);
      
      // Then assign tables
      setTimeout(() => {
        setTables(prevTables => {
          const updatedTables = [...prevTables];
          
          guestsToAssign.forEach(({ guest, tableName }) => {
            const tableId = findTableByName(tableName);
            if (tableId) {
              const tableIndex = updatedTables.findIndex(t => t.id === tableId);
              if (tableIndex !== -1 && updatedTables[tableIndex].guests.length < updatedTables[tableIndex].capacity) {
                updatedTables[tableIndex] = {
                  ...updatedTables[tableIndex],
                  guests: [...updatedTables[tableIndex].guests, { ...guest, tableId }]
                };
                
                // Update guest with tableId
                setGuests(prevGuests => 
                  prevGuests.map(g => 
                    g.id === guest.id ? { ...g, tableId } : g
                  )
                );
              }
            }
          });
          
          return updatedTables;
        });
      }, 100);
    };
    reader.readAsText(file);
  }, [tables, findTableByName]);

  // Save current seating chart to JSON file
  const saveSeatingChart = useCallback(() => {
    const seatingData = {
      tables,
      guests,
      metadata: {
        savedAt: new Date().toISOString(),
        totalGuests: guests.length,
        assignedGuests: guests.filter(g => g.tableId).length
      }
    };

    const dataStr = JSON.stringify(seatingData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wedding-seating-plan-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [tables, guests]);

  // Load seating chart from JSON file
  const loadSeatingChart = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const seatingData = JSON.parse(text);
        
        if (seatingData.tables && seatingData.guests) {
          console.log('Loading seating chart:', seatingData.metadata);
          setTables(seatingData.tables);
          setGuests(seatingData.guests);
        } else {
          console.error('Invalid seating chart file format');
        }
      } catch (error) {
        console.error('Error loading seating chart:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // Clear all data and reset to default
  const resetSeatingChart = useCallback(() => {
    setTables(generateDefaultTables());
    setGuests([]);
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
    importCSV,
    saveSeatingChart,
    loadSeatingChart,
    resetSeatingChart
  };
}
