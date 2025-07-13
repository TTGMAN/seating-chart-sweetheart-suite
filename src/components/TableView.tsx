import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Crown, Users, Settings, X } from 'lucide-react';
import { Table, Guest } from '@/types/wedding';

interface TableViewProps {
  table: Table;
  onUpdateTable: (tableId: string, updates: Partial<Table>) => void;
  onRemoveGuestFromTable: (guestId: string, tableId: string) => void;
  onUpdateGuest: (guestId: string, updates: Partial<Guest>) => void;
}

export function TableView({ table, onUpdateTable, onRemoveGuestFromTable, onUpdateGuest }: TableViewProps) {
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [newCapacity, setNewCapacity] = useState(table.capacity.toString());
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(table.name);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const guestId = e.dataTransfer.getData('text/plain');
    
    // Check if table has capacity
    if (table.guests.length >= table.capacity) {
      return;
    }
    
    // Move guest to this table by updating their tableId
    onUpdateGuest(guestId, { tableId: table.id });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const saveCapacity = () => {
    const capacity = parseInt(newCapacity);
    if (capacity > 0) {
      onUpdateTable(table.id, { capacity });
    }
    setEditingCapacity(false);
  };

  const saveName = () => {
    if (newName.trim()) {
      onUpdateTable(table.id, { name: newName.trim() });
    }
    setEditingName(false);
  };

  const brideGuests = table.guests.filter(g => g.side === 'bride');
  const groomGuests = table.guests.filter(g => g.side === 'groom');
  const bothGuests = table.guests.filter(g => g.side === 'both');

  return (
    <Card 
      className={`w-72 h-72 bg-gradient-card border-2 shadow-elegant hover:shadow-lg transition-smooth ${
        table.isHeadTable ? 'border-rose-gold bg-gradient-primary' : 'border-border/50'
      } ${table.guests.length >= table.capacity ? 'border-destructive/50' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <CardHeader className="pb-2 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {table.isHeadTable && <Crown className="w-3 h-3 text-rose-gold" />}
            {editingName ? (
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="text-xs font-semibold w-24 h-6"
                autoFocus
              />
            ) : (
              <CardTitle 
                className={`text-xs font-semibold cursor-pointer hover:text-primary ${
                  table.isHeadTable ? 'text-white' : 'text-foreground'
                }`}
                onClick={() => setEditingName(true)}
              >
                {table.name}
              </CardTitle>
            )}
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Settings className="w-2 h-2" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Table Settings</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Table Name</Label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Table name"
                  />
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    min="1"
                    max="20"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveName} variant="secondary" className="flex-1">
                    Save Name
                  </Button>
                  <Button onClick={saveCapacity} variant="secondary" className="flex-1">
                    Save Capacity
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className={`flex items-center gap-2 text-xs ${table.isHeadTable ? 'text-white/80' : 'text-muted-foreground'}`}>
          <Users className="w-2 h-2" />
          <span>{table.guests.length} / {table.capacity}</span>
          {editingCapacity ? (
            <div className="flex gap-1">
              <Input
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                onBlur={saveCapacity}
                onKeyDown={(e) => e.key === 'Enter' && saveCapacity()}
                className="w-12 h-5 text-xs"
                min="1"
                max="20"
                autoFocus
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-3 px-1 text-xs opacity-60 hover:opacity-100"
              onClick={() => setEditingCapacity(true)}
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-2">
        <div className="h-full flex flex-col space-y-1 overflow-auto">
          {/* Bride Side */}
          {brideGuests.length > 0 && (
            <div>
              <Badge variant="default" className="text-xs mb-1">Bride</Badge>
              {brideGuests.map((guest) => (
                <div
                  key={guest.id}
                  className={`flex items-center justify-between p-1 rounded text-xs ${
                    table.isHeadTable 
                      ? 'bg-white/20 text-white' 
                      : 'bg-blush/30 text-foreground'
                  } mb-1`}
                >
                  <span className="truncate flex-1">{guest.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 ml-1"
                    onClick={() => onRemoveGuestFromTable(guest.id, table.id)}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* Groom Side */}
          {groomGuests.length > 0 && (
            <div>
              <Badge variant="secondary" className="text-xs mb-1">Groom</Badge>
              {groomGuests.map((guest) => (
                <div
                  key={guest.id}
                  className={`flex items-center justify-between p-1 rounded text-xs ${
                    table.isHeadTable 
                      ? 'bg-white/20 text-white' 
                      : 'bg-secondary/50 text-foreground'
                  } mb-1`}
                >
                  <span className="truncate flex-1">{guest.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 ml-1"
                    onClick={() => onRemoveGuestFromTable(guest.id, table.id)}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* Both Sides */}
          {bothGuests.length > 0 && (
            <div>
              <Badge variant="outline" className="text-xs mb-1">Both</Badge>
              {bothGuests.map((guest) => (
                <div
                  key={guest.id}
                  className={`flex items-center justify-between p-1 rounded text-xs ${
                    table.isHeadTable 
                      ? 'bg-white/20 text-white' 
                      : 'bg-muted/50 text-foreground'
                  } mb-1`}
                >
                  <span className="truncate flex-1">{guest.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3 w-3 ml-1"
                    onClick={() => onRemoveGuestFromTable(guest.id, table.id)}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {table.guests.length === 0 && (
            <div className={`text-center p-3 border-2 border-dashed rounded-lg flex-1 flex items-center justify-center ${
              table.isHeadTable 
                ? 'border-white/30 text-white/60' 
                : 'border-border/30 text-muted-foreground'
            }`}>
              <div>
                <Users className="w-4 h-4 mx-auto mb-1 opacity-50" />
                <p className="text-xs">Drop guests here</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
