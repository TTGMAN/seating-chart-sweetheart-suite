
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GuestSidebar } from '@/components/GuestSidebar';
import { TableView } from '@/components/TableView';
import { useSeatingChart } from '@/hooks/useSeatingChart';
import { Heart, Download, FileSpreadsheet, Crown } from 'lucide-react';

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

  // Separate head table from regular tables
  const headTable = tables.find(table => table.isHeadTable);
  const regularTables = tables.filter(table => !table.isHeadTable);

  return (
    <div className="h-screen bg-gradient-subtle flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-card border-b border-border/50 shadow-soft flex-shrink-0">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-elegant">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Wedding Seating Chart</h1>
                <p className="text-sm text-muted-foreground">Plan your perfect wedding seating arrangement</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex gap-6 text-sm">
                <div className="text-center px-3 py-2 bg-gradient-card rounded-lg shadow-soft">
                  <div className="text-xl font-bold text-primary">{totalGuests}</div>
                  <div className="text-xs text-muted-foreground font-medium">Total</div>
                </div>
                <div className="text-center px-3 py-2 bg-gradient-card rounded-lg shadow-soft">
                  <div className="text-xl font-bold text-accent">{assignedGuestsCount}</div>
                  <div className="text-xs text-muted-foreground font-medium">Assigned</div>
                </div>
                <div className="text-center px-3 py-2 bg-gradient-card rounded-lg shadow-soft">
                  <div className="text-xl font-bold text-secondary">{unassignedGuests.length}</div>
                  <div className="text-xs text-muted-foreground font-medium">Unassigned</div>
                </div>
              </div>
              
              <Button variant="secondary" onClick={exportCSV} className="gap-2 shadow-soft hover:shadow-elegant transition-smooth">
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Guest Sidebar */}
        <div className="w-80 flex-shrink-0 border-r border-border/50">
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

        {/* Tables Section */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Head Table Section */}
          {headTable && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-rose-gold" />
                <h2 className="text-xl font-bold text-primary">Head Table</h2>
                <Crown className="w-5 h-5 text-rose-gold" />
              </div>
              <div className="flex justify-center">
                <div className="transform scale-75">
                  <TableView
                    table={headTable}
                    onUpdateTable={updateTable}
                    onRemoveGuestFromTable={removeGuestFromTable}
                    onUpdateGuest={updateGuest}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Regular Tables Section */}
          <div className="flex-1">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-primary mb-1">Guest Tables</h2>
              <p className="text-sm text-muted-foreground">Drag guests from the sidebar to assign them to tables</p>
            </div>
            
            <div className="grid grid-cols-4 gap-4 h-full content-start">
              {regularTables.map((table) => (
                <div key={table.id} className="flex justify-center">
                  <div className="transform scale-90">
                    <TableView
                      table={table}
                      onUpdateTable={updateTable}
                      onRemoveGuestFromTable={removeGuestFromTable}
                      onUpdateGuest={updateGuest}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Empty State */}
            {regularTables.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <Card className="p-8 text-center bg-gradient-card border-border/50 shadow-elegant max-w-md">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">No Tables Created</h3>
                  <p className="text-sm text-muted-foreground">
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
