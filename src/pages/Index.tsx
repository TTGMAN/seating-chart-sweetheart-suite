import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GuestSidebar } from '@/components/GuestSidebar';
import { TableView } from '@/components/TableView';
import { useSeatingChart } from '@/hooks/useSeatingChart';
import { Heart, Download, FileSpreadsheet } from 'lucide-react';

const Index = () => {
  const {
    tables,
    guests,
    unassignedGuests,
    totalGuests,
    assignedGuestsCount,
    addGuest,
    bulkAddGuests,
    updateGuest,
    deleteGuest,
    updateTable,
    removeGuestFromTable,
    exportCSV,
    importCSV
  } = useSeatingChart();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="bg-card border-b border-border/50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Wedding Seating Chart</h1>
                <p className="text-sm text-muted-foreground">Plan your perfect wedding seating arrangement</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-primary">{totalGuests}</div>
                  <div className="text-muted-foreground">Total Guests</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-accent">{assignedGuestsCount}</div>
                  <div className="text-muted-foreground">Assigned</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-secondary">{unassignedGuests.length}</div>
                  <div className="text-muted-foreground">Unassigned</div>
                </div>
              </div>
              
              <Button variant="secondary" onClick={exportCSV} className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* Guest Sidebar */}
          <div className="w-80 flex-shrink-0">
            <GuestSidebar
              guests={guests}
              unassignedGuests={unassignedGuests}
              onAddGuest={addGuest}
              onBulkAddGuests={bulkAddGuests}
              onUpdateGuest={updateGuest}
              onDeleteGuest={deleteGuest}
              onExportCSV={exportCSV}
              onImportCSV={importCSV}
              totalGuests={totalGuests}
              assignedGuests={assignedGuestsCount}
            />
          </div>

          {/* Tables Grid */}
          <div className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
              {tables.map((table) => (
                <TableView
                  key={table.id}
                  table={table}
                  onUpdateTable={updateTable}
                  onRemoveGuestFromTable={removeGuestFromTable}
                  onUpdateGuest={updateGuest}
                />
              ))}
            </div>
            
            {/* Empty State */}
            {tables.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <Card className="p-8 text-center bg-gradient-card border-border/50">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Tables Created</h3>
                  <p className="text-muted-foreground">
                    Your default tables will appear here once you start planning your seating chart.
                  </p>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
