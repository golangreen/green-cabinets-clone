# Phase 26: Vanity3DPreview Decomposition Plan

## Status: IN PROGRESS

### Completed
- ✅ Extracted `MeasurementTools.tsx` (MeasurementLine, DimensionLabels)
- ✅ Extracted `MaterialUtils.tsx` (material helpers, texture generation)
- ✅ Extracted `types.ts` (Vanity3DPreviewProps interface)
- ✅ Created `hooks/useVanityDimensions.ts` for dimension calculations
- ✅ **Phase 26b Complete**: Extracted BathroomFixtures, VanitySink, MirrorCabinet to `fixtures/`
- ✅ **Phase 26c Complete**: Extracted VanityFaucet, VanityBacksplash, VanityLighting to `fixtures/`
- ✅ **Phase 26d Complete**: Extracted BathroomAccessories, Countertop to `fixtures/`
- ✅ **Phase 26e Complete**: Extracted BathroomRoom, Lighting to `room/`

### Components Identified for Extraction (from 3,517-line monolith)

#### High Priority - Large Components (500+ lines each)
1. **BathroomFixtures** (lines 743-976) - 234 lines
   - Toilet rendering (3 styles)
   - Shower rendering (3 styles)
   - Bathtub rendering (3 styles)
   - Positioning logic
   
2. **VanitySink** (lines 979-1163) - 185 lines
   - Undermount sinks
   - Vessel sinks
   - Integrated sinks
   - Multiple shapes (oval, rectangular, square)

3. **VanityBacksplash** (lines 1166-1330) - 165 lines
   - Material variations (subway-tile, marble-slab, glass-tile, stone)
   - Height options (4-inch, full-height)

4. **VanityLighting** (lines 1333-1547) - 215 lines
   - Sconce lights
   - LED strips
   - Pendant lights
   - Brightness/temperature control

5. **VanityFaucet** (lines 1550-1788) - 239 lines
   - Faucet styles (modern, traditional, waterfall)
   - Finishes (chrome, brushed-nickel, matte-black, gold)

6. **BathroomAccessories** (lines 1791-2010) - 220 lines
   - Towel bars
   - Toilet paper holder
   - Robe hooks
   - Shelving (floating, corner, ladder)

7. **MirrorCabinet** (lines 2013-2213) - 201 lines
   - Mirror shapes (rectangular, round, oval, arched)
   - Frame styles
   - Medicine cabinets

8. **Countertop** (lines 2216-2405) - 190 lines
   - Materials (marble, quartz, granite)
   - Edge profiles (straight, beveled, bullnose, waterfall)
   - Texture generation

#### Medium Priority - Room Components
9. **BathroomRoom** component
   - Floor rendering with tile/wood options
   - Wall rendering
   - Window/door placement
   - Lighting system

10. **VanityCabinet** component  
   - Cabinet body
   - Drawer system
   - Door styles
   - Handle hardware

### Extraction Strategy

#### Phase 26a (CURRENT)
- Create directory structure: `components/3d/fixtures/`
- Extract measurement and material utilities ✅

#### Phase 26b (NEXT)
- Extract BathroomFixtures → `fixtures/BathroomFixtures.tsx`
- Extract VanitySink → `fixtures/VanitySink.tsx`
- Extract MirrorCabinet → `fixtures/MirrorCabinet.tsx`

#### Phase 26c
- Extract VanityFaucet → `fixtures/VanityFaucet.tsx`
- Extract VanityBacksplash → `fixtures/VanityBacksplash.tsx`
- Extract VanityLighting → `fixtures/VanityLighting.tsx`

#### Phase 26d
- Extract BathroomAccessories → `fixtures/BathroomAccessories.tsx`
- Extract Countertop → `fixtures/Countertop.tsx`

#### Phase 26e
- Extract room rendering components
- Extract cabinet rendering components
- Simplify main Vanity3DPreview to orchestrator

### Target Architecture
```
src/features/vanity-designer/components/
├── 3d/
│   ├── fixtures/
│   │   ├── BathroomFixtures.tsx
│   │   ├── VanitySink.tsx
│   │   ├── VanityFaucet.tsx
│   │   ├── VanityBacksplash.tsx
│   │   ├── VanityLighting.tsx
│   │   ├── BathroomAccessories.tsx
│   │   ├── MirrorCabinet.tsx
│   │   └── Countertop.tsx
│   ├── room/
│   │   ├── BathroomRoom.tsx
│   │   └── Lighting.tsx
│   ├── cabinet/
│   │   ├── VanityCabinet.tsx
│   │   ├── Drawers.tsx
│   │   └── Doors.tsx
│   ├── MeasurementTools.tsx ✅
│   ├── MaterialUtils.tsx ✅
│   ├── types.ts ✅
│   └── index.ts
└── Vanity3DPreview.tsx (simplified orchestrator ~300 lines)
```

### Success Metrics
- [ ] Vanity3DPreview.tsx reduced from 3,517 lines to <500 lines
- [ ] All components <300 lines
- [ ] Each component has single responsibility
- [ ] Components are reusable and testable
- [ ] No duplicate code between components

### Notes
- Use shared SCALE_FACTOR from MaterialUtils
- Maintain consistent prop patterns
- Keep Three.js imports isolated to component files
- Use TypeScript interfaces from types.ts
