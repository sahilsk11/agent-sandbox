# Miniature Stirling Engine

Design and simulation package for a beta-configuration Stirling engine
with sintered metal regenerator.

## Hardware Specifications
- **Configuration**: Beta-type (single cylinder, displacer + power piston)
- **Swept Volume**: ~5 mL (compact desktop scale)
- **Operating Temperature**: 227°C hot / 27°C cold (achievable with tea light)
- **Working Gas**: Helium (optimal) or air
- **Power Output**: ~0.01-0.1 W (enough to drive a small flywheel with LED)

## Key Components

### 1. Regenerator (Materials Science Flex 💪)
The regenerator is the heart of a Stirling engine — it stores heat from
the working gas as it flows from hot to cold, then returns it on the
return stroke. Without a good regenerator, efficiency drops dramatically.

**Sintered Metal Regenerator Design:**
- Material: Stainless steel 316L powder (~100-150 μm particle size)
- Target porosity: 0.30-0.40
- Process: Pack powder into cylindrical mold → cold isostatic press → sinter
  at 1200-1300°C in controlled atmosphere
- Dimensions: Ø15mm × 15mm length
- Surface area: ~100-400 cm² depending on particle size

**Why sintered metal vs. wire mesh:**
- Higher surface area per volume
- Better thermal contact between particles
- More uniform flow distribution
- Tunable porosity via sintering parameters

### 2. Piston & Displacer
- Displacer: Lightweight (carbon fiber or 3D-printed hollow plastic)
- Power piston: Machined aluminum or brass in precision-bored cylinder
- Seal: Labyrinth seal or PTFE ring (traditional piston rings won't scale well)
- Target clearance: 0.02-0.05mm between piston and cylinder wall

### 3. Flywheel & Bearings
- Flywheel: 3D-printed PLA with embedded steel washers for inertia
- Bearings: Miniature ball bearings (e.g., 623ZZ, 3×10×4mm)
- Crankshaft: Precision-machined steel rod

### 4. Heat Exchangers
- Hot end: Copper or aluminum heat cap with finned exterior
- Cold end: Aluminum cooling fins or air-cooled body
- Thermal insulation: Ceramic fiber or aerogel between hot and cold zones

## Simulation
Run the optimization script to find optimal regenerator parameters:
```bash
python Simulation/stirling_engine.py
```

This performs Schmidt analysis and sweeps:
- Particle diameters: 50μm to 500μm
- Porosity: 0.25 to 0.50
- Working gases: helium, hydrogen, air
- Output: optimal configuration for power and efficiency

## Build Order
1. **Sinter the regenerator** (longest lead time — requires furnace access)
2. **Bore the cylinder** (precision machining or 3D print + ream)
3. **Machine the pistons** (tight clearances critical)
4. **3D print** the housing, flywheel, and mounting brackets
5. **Assemble** with proper alignment and minimal friction
6. **Test and iterate** — measure RPM vs. temperature differential
