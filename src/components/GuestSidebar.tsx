import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Upload, Download, Users, Heart } from 'lucide-react';
import { Guest } from '@/types/wedding';

interface GuestSidebarProps {
  guests: Guest[];
  unassignedGuests: Guest[];
  onAddGuest: (guest: Omit<Guest, 'id'>) => void;
  onBulkAddGuests: (names: string[], side: 'bride' | 'groom' | 'both') => void;
  onUpdateGuest: (id: string, updates: Partial<Guest>) => void;
  onDeleteGuest: (id: string) => void;
  onExportCSV: () => void;
  onImportCSV: (file: File) => void;
  onSaveSeatingChart: () => void;
  onLoadSeatingChart: (file: File) => void;
  onResetSeatingChart: () => void;
  totalGuests: number;
  assignedGuests: number;
}

export function GuestSidebar({
  guests,
  unassignedGuests,
  onAddGuest,
  onBulkAddGuests,
  onUpdateGuest,
  onDeleteGuest,
  onExportCSV,
  onImportCSV,
  onSaveSeatingChart,
  onLoadSeatingChart,
  onResetSeatingChart,
  totalGuests,
  assignedGuests
}: GuestSidebarProps) {
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestSide, setNewGuestSide] = useState<'bride' | 'groom' | 'both'>('bride');
  const [bulkGuestText, setBulkGuestText] = useState('');
  const [bulkSide, setBulkSide] = useState<'bride' | 'groom' | 'both'>('bride');
  const [showBulkInput, setShowBulkInput] = useState(false);

  const handleAddGuest = () => {
    if (newGuestName.trim()) {
      onAddGuest({
        name: newGuestName.trim(),
        side: newGuestSide,
        rsvpStatus: 'pending'
      });
      setNewGuestName('');
    }
  };

  const handleBulkAdd = () => {
    if (bulkGuestText.trim()) {
      // Parse the text to extract names only (remove numbers, commas, etc.)
      const names = bulkGuestText
        .split(/[\n,;]/)
        .map(line => line.replace(/^\d+\.?\s*/, '').trim()) // Remove leading numbers
        .filter(name => name.length > 0);
      
      onBulkAddGuests(names, bulkSide);
      setBulkGuestText('');
      setShowBulkInput(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onImportCSV(file);
    }
    event.target.value = '';
  };

  const handlePlanUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      onLoadSeatingChart(file);
    }
    event.target.value = '';
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-card border-border/50 shadow-soft">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Heart className="w-5 h-5" />
          Guest Management
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            Total: {totalGuests}
          </div>
          <div>Assigned: {assignedGuests}</div>
          <div>Unassigned: {unassignedGuests.length}</div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Save/Load Plan Section */}
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
          <Label className="text-sm font-medium">Seating Plan</Label>
          <div className="flex gap-2">
            <Button onClick={onSaveSeatingChart} variant="secondary" className="flex-1 text-xs">
              <Download className="w-3 h-3 mr-1" />
              Save Plan
            </Button>
            <Label htmlFor="plan-upload" className="flex-1">
              <Button variant="secondary" className="w-full text-xs" asChild>
                <span>
                  <Upload className="w-3 h-3 mr-1" />
                  Load Plan
                </span>
              </Button>
            </Label>
            <input
              id="plan-upload"
              type="file"
              accept=".json"
              onChange={handlePlanUpload}
              className="hidden"
            />
          </div>
          <Button onClick={onResetSeatingChart} variant="outline" className="w-full text-xs">
            Reset Plan
          </Button>
        </div>

        <Separator />

        {/* Add Single Guest */}
        <div className="space-y-2">
          <Label>Add Guest</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Guest name"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGuest()}
              className="flex-1"
            />
            <Select value={newGuestSide} onValueChange={(value) => setNewGuestSide(value as any)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bride">Bride</SelectItem>
                <SelectItem value="groom">Groom</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddGuest} size="icon" variant="secondary">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Bulk Add Toggle */}
        <div className="space-y-2">
          <Button 
            variant="outline" 
            onClick={() => setShowBulkInput(!showBulkInput)}
            className="w-full"
          >
            {showBulkInput ? 'Hide' : 'Show'} Bulk Add
          </Button>
          
          {showBulkInput && (
            <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
              <Label>Bulk Add Guests</Label>
              <Textarea
                placeholder="Paste guest names here (one per line or comma-separated)&#10;Numbers and formatting will be removed automatically"
                value={bulkGuestText}
                onChange={(e) => setBulkGuestText(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Select value={bulkSide} onValueChange={(value) => setBulkSide(value as any)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bride">Bride Side</SelectItem>
                    <SelectItem value="groom">Groom Side</SelectItem>
                    <SelectItem value="both">Both Sides</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleBulkAdd} variant="secondary">
                  Add All
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Import/Export */}
        <div className="flex gap-2">
          <Label htmlFor="csv-upload" className="flex-1">
            <Button variant="outline" className="w-full" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </span>
            </Button>
          </Label>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button variant="outline" onClick={onExportCSV} className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <Separator />

        {/* Guest List */}
        <div className="flex-1">
          <Label className="text-sm font-medium">Unassigned Guests ({unassignedGuests.length})</Label>
          <ScrollArea className="h-64 mt-2">
            <div className="space-y-2">
              {unassignedGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="p-3 bg-card rounded-lg border border-border/50 cursor-move hover:bg-muted/50 transition-smooth"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', guest.id);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{guest.name}</span>
                    <Badge 
                      variant={guest.side === 'bride' ? 'default' : guest.side === 'groom' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {guest.side}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    RSVP: {guest.rsvpStatus}
                  </div>
                </div>
              ))}
              {unassignedGuests.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-4">
                  All guests have been assigned to tables
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
