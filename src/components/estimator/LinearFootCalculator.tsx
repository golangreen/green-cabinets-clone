import React, { useState, useCallback } from 'react';
import { Plus, Trash2, UtensilsCrossed, Bath, DoorOpen, Waves, ChevronDown, ChevronUp } from 'lucide-react';
import type { LinearFootRoom, LinearFootRoomType, Collection } from '@/lib/estimator/types';
import { fmt } from '@/lib/estimator/utils';

// Per-linear-foot rates (upper + lower combined) by room type and collection
const LF_RATES: Record<LinearFootRoomType, Record<Collection, { uppers: number; lowers: number }>> = {
  kitchen: {
    luxor: { uppers: 195, lowers: 340 },
    zuma:  { uppers: 230, lowers: 400 },
  },
  closet: {
    luxor: { uppers: 145, lowers: 210 },
    zuma:  { uppers: 170, lowers: 248 },
  },
  vanity: {
    luxor: { uppers: 0,   lowers: 280 },
    zuma:  { uppers: 0,   lowers: 330 },
  },
  laundry: {
    luxor: { uppers: 155, lowers: 230 },
    zuma:  { uppers: 183, lowers: 272 },
  },
};

// Height premium: wall cabinets taller than 30" get a surcharge per LF
const HEIGHT_PREMIUM_PER_LF: Record<Collection, Record<number, number>> = {
  luxor: { 30: 0, 36: 22, 42: 45 },
  zuma:  { 30: 0, 36: 26, 42: 53 },
};

function roomIcon(type: LinearFootRoomType) {
  switch (type) {
    case 'kitchen': return <UtensilsCrossed size={16} />;
    case 'closet':  return <DoorOpen size={16} />;
    case 'vanity':  return <Bath size={16} />;
    case 'laundry': return <Waves size={16} />;
  }
}

function roomLabel(type: LinearFootRoomType) {
  switch (type) {
    case 'kitchen': return 'Kitchen';
    case 'closet':  return 'Closet / Walk-in';
    case 'vanity':  return 'Bathroom Vanity';
    case 'laundry': return 'Laundry Room';
  }
}

function calcRoomPrice(room: LinearFootRoom): { uppers: number; lowers: number; heightPremium: number; total: number } {
  const rates = LF_RATES[room.roomType][room.collection];
  const heightKey = room.wallHeight >= 42 ? 42 : room.wallHeight >= 36 ? 36 : 30;
  const hPremium = HEIGHT_PREMIUM_PER_LF[room.collection][heightKey] ?? 0;

  const uppers   = room.includeUppers ? Math.round(rates.uppers * room.linearFeet) : 0;
  const lowers   = room.includeLowers ? Math.round(rates.lowers * room.linearFeet) : 0;
  const heightPremium = room.includeUppers ? Math.round(hPremium * room.linearFeet) : 0;
  return { uppers, lowers, heightPremium, total: uppers + lowers + heightPremium };
}

interface LinearFootCalculatorProps {
  collection: Collection;
}

export default function LinearFootCalculator({ collection }: LinearFootCalculatorProps) {
  const [rooms, setRooms] = useState<LinearFootRoom[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const addRoom = useCallback((type: LinearFootRoomType) => {
    const id = crypto.randomUUID();
    const hasUppers = type !== 'vanity';
    setRooms(prev => [...prev, {
      id,
      name: `${roomLabel(type)} ${prev.filter(r => r.roomType === type).length + 1}`,
      roomType: type,
      linearFeet: 10,
      wallHeight: 30,
      collection,
      includeUppers: hasUppers,
      includeLowers: true,
    }]);
    setExpanded(prev => ({ ...prev, [id]: true }));
  }, [collection]);

  const updateRoom = useCallback((id: string, patch: Partial<LinearFootRoom>) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }, []);

  const removeRoom = useCallback((id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    setExpanded(prev => { const next = { ...prev }; delete next[id]; return next; });
  }, []);

  const grandTotal = rooms.reduce((s, r) => s + calcRoomPrice(r).total, 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Quick Estimate by Linear Foot</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Estimate cabinet cost by room dimensions — perfect for early-stage budgeting
        </p>
      </div>

      {/* Add room buttons */}
      <div className="grid grid-cols-2 gap-2">
        {(['kitchen', 'closet', 'vanity', 'laundry'] as LinearFootRoomType[]).map(type => (
          <button
            key={type}
            onClick={() => addRoom(type)}
            className="flex items-center gap-2 border border-border rounded-xl px-3 py-3 text-sm text-foreground hover:border-primary/60 hover:bg-accent/50 transition-all active:scale-[0.98] text-left"
          >
            <span className="text-primary">{roomIcon(type)}</span>
            <span className="font-medium">+ {roomLabel(type)}</span>
          </button>
        ))}
      </div>

      {/* Room list */}
      {rooms.length > 0 && (
        <div className="space-y-2">
          {rooms.map(room => {
            const calc = calcRoomPrice(room);
            const isOpen = expanded[room.id] ?? false;

            return (
              <div key={room.id} className="border border-border rounded-xl overflow-hidden">
                {/* Header */}
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [room.id]: !prev[room.id] }))}
                  className="w-full flex items-center justify-between px-3 py-3 hover:bg-accent/40 transition-all text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-primary">{roomIcon(room.roomType)}</span>
                    <span className="text-sm font-semibold text-foreground truncate">{room.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {room.linearFeet} LF
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-primary">{fmt(calc.total)}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }}
                      className="text-destructive hover:bg-destructive/10 rounded p-1 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded controls */}
                {isOpen && (
                  <div className="px-3 pb-4 pt-1 border-t border-border space-y-3">
                    {/* Name */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Room name</label>
                      <input
                        type="text"
                        value={room.name}
                        onChange={e => updateRoom(room.id, { name: e.target.value })}
                        className="w-full text-sm bg-background border border-border rounded-lg px-2 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Linear Feet slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs text-muted-foreground">Linear Feet</label>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateRoom(room.id, { linearFeet: Math.max(1, room.linearFeet - 1) })} className="w-7 h-7 flex items-center justify-center rounded border border-border hover:bg-accent active:scale-95 text-sm font-bold">−</button>
                          <span className="text-sm font-semibold w-10 text-center">{room.linearFeet} ft</span>
                          <button onClick={() => updateRoom(room.id, { linearFeet: Math.min(200, room.linearFeet + 1) })} className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95 text-sm font-bold">+</button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1" max="100" value={room.linearFeet}
                        onChange={e => updateRoom(room.id, { linearFeet: Number(e.target.value) })}
                        className="w-full accent-primary"
                      />
                    </div>

                    {/* Wall height (upper cabinet height) */}
                    {room.includeUppers && (
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Upper cabinet height</label>
                        <div className="flex gap-2">
                          {[30, 36, 42].map(h => (
                            <button
                              key={h}
                              onClick={() => updateRoom(room.id, { wallHeight: h })}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                room.wallHeight === h
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
                              }`}
                            >
                              {h}"
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Uppers / Lowers toggles */}
                    <div className="flex gap-2">
                      {room.roomType !== 'vanity' && (
                        <button
                          onClick={() => updateRoom(room.id, { includeUppers: !room.includeUppers })}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                            room.includeUppers
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground hover:bg-accent'
                          }`}
                        >
                          Upper Cabinets {room.includeUppers ? '✓' : ''}
                        </button>
                      )}
                      <button
                        onClick={() => updateRoom(room.id, { includeLowers: !room.includeLowers })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          room.includeLowers
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-accent'
                        }`}
                      >
                        {room.roomType === 'vanity' ? 'Vanity Cabinets' : 'Lower Cabinets'} {room.includeLowers ? '✓' : ''}
                      </button>
                    </div>

                    {/* Price breakdown */}
                    <div className="bg-accent/50 rounded-lg p-3 space-y-1">
                      {room.includeUppers && calc.uppers > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Upper cabinets ({room.linearFeet} LF)</span>
                          <span className="font-medium">{fmt(calc.uppers)}</span>
                        </div>
                      )}
                      {room.includeLowers && calc.lowers > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {room.roomType === 'vanity' ? 'Vanity' : 'Lower'} cabinets ({room.linearFeet} LF)
                          </span>
                          <span className="font-medium">{fmt(calc.lowers)}</span>
                        </div>
                      )}
                      {calc.heightPremium > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Height premium ({room.wallHeight}" uppers)</span>
                          <span className="font-medium">{fmt(calc.heightPremium)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border">
                        <span>Room total</span>
                        <span className="text-primary">{fmt(calc.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {rooms.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          <Plus size={24} className="mx-auto mb-2 opacity-40" />
          <p>Add a room above to calculate a linear-foot estimate</p>
        </div>
      )}

      {/* Grand total */}
      {rooms.length > 1 && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">Combined Estimate</p>
            <p className="text-xs text-muted-foreground">{rooms.length} rooms · {rooms.reduce((s, r) => s + r.linearFeet, 0)} total LF</p>
          </div>
          <span className="text-2xl font-bold text-primary">{fmt(grandTotal)}</span>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        * Linear-foot estimates are for budgeting only. Final pricing is based on actual cabinet selection.
        Collection: <span className="font-medium capitalize">{collection}</span> pricing applied.
      </p>
    </div>
  );
}
