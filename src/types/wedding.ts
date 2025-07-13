export interface Guest {
  id: string;
  name: string;
  side: 'bride' | 'groom' | 'both';
  tableId?: string;
  rsvpStatus: 'pending' | 'attending' | 'declined';
  mealChoice?: string;
  notes?: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  guests: Guest[];
  isHeadTable?: boolean;
}

export interface SeatingChartData {
  tables: Table[];
  guests: Guest[];
  totalCapacity: number;
}