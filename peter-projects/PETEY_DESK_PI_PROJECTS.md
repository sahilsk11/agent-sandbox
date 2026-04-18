# Petey's Raspberry Pi Desk Projects

Simple Pi-powered desk gadgets with 3D printed parts and light mechanical elements.

---

## 1. Physical Pomodoro Countdown Timer
**Difficulty:** Beginner  
**3D Parts:** Base housing, rotating countdown dial (0-25 min), minute flag arm, knob  
**Pi Requirements:** Any Pi (even Pi Zero W), micro servo or stepper motor, optional small buzzer  
**Extra:** SG90 micro servo (or 28BYJ-48 stepper), a pushbutton

**What:** A physical knob you turn to set a countdown (like 25 min for Pomodoro). The dial rotates visibly to show remaining time as a colored wedge. When time's up, a flag pops up or the buzzer sounds.

**Build Notes:**
- SG90 servo drives the dial via a direct-coupled 3D printed gear or direct shaft mount
- One button: press to start/stop, double-press to reset
- Dial can be color-coded: green zone for work, red for break
- Pi runs a simple Python script with GPIO + servo PWM, no display needed
- Optional: add a small SSD1306 OLED for extra info (total sessions completed today)

**Why It's Cool:** Turns a digital concept into a physical, satisfying desk object. The visual countdown is hypnotic.

---

## 2. Mini Plotter / Drawing Machine
**Difficulty:** Intermediate  
**3D Parts:** Gantry frame, X/Y carriage plates, pen clamp, belt tensioners, base plate  
**Pi Requirements:** Any Pi, 2x stepper motors, motor driver board  
**Extra:** 2x NEMA 17 or 28BYJ-48 steppers, A4988 or DRV8825 drivers, 2M or GT2 timing belts, linear rods or 3D printed slide rails

**What:** A desktop XY plotter small enough to draw on a 10x10cm area. Feed it an SVG or GCode and it draws with a real pen.

**Build Notes:**
- CoreXY or H-bot belt configuration — both work well at this scale
- Pen clamp uses a micro servo to lift/lower the pen
- Pi runs GRBL or a custom Python plotter (matplotlib → GCode → stepper pulses)
- Linear motion: 3D printed carriages on smooth rods, or fully printed rails with PTFE tape for low friction
- Start with 28BYJ-48 + ULN2003 for cheap/quiet, upgrade to NEMA 17 for speed

**Why It's Cool:** It draws. On paper. With a real pen. Watch it go. Also a great intro to CNC/printer kinematics.

---

## 3. Mechanical Email/Notification Flag Box
**Difficulty:** Beginner  
**3D Parts:** Hinged flag housing, flag paddle, base enclosure, hinge pin  
**Pi Requirements:** Pi Zero W or any Pi with WiFi  
**Extra:** SG90 micro servo, 3D printed flag (or a small piece of colored plastic)

**What:** A little mailbox-style box with a red flag. Flag goes UP when you have unread emails/messages, goes DOWN when you clear them. Sits on your desk and judges you.

**Build Notes:**
- Pi polls an API (Gmail, email via IMAP, or GitHub notifications) on a timer
- Flag mechanism: simple servo arm that pivots the flag up to 90°
- Add a small pushbutton to manually trigger a re-check (or dismiss)
- Can add a tiny magnet + reed switch to detect flag position for feedback
- House LEDs inside the flag for a glow effect at night
- Use Pi's WiFi to check status without being tethered

**Why It's Cool:** Tactile notifications. Look at your desk → red flag up → you've got mail. Satisfying to knock it back down.

---

## 4. Stepper-Driven Orbital Weather Display
**Difficulty:** Intermediate  
**3D Parts:** Globe sphere (two halves), inner ring, orbital track, planet markers, base, display stand  
**Pi Requirements:** Pi Zero 2 W or Pi 4, stepper motor, optional small LED strip  
**Extra:** 28BYJ-48 or NEMA 14 stepper, WS2812B LED ring (optional), BMP280 or environmental sensor

**What:** A small desk globe (or abstract sphere) mounted on a rotating platform. The sphere slowly orbits and changes color or rotation speed based on real-time weather data (temperature, wind, UV index).

**Build Notes:**
- Stepper or DC motor drives the globe rotation (slow, continuous)
- Pi pulls weather data from OpenWeatherMap API for your location
- Color mapping: blue = cold, red = hot, pulsing speed = wind intensity
- Optional: ring of WS2812B LEDs under the globe for ambient color glow
- Add a BMP280 inside the base to show actual desk-room temp vs outside
- 3D print the globe from transparent PETG for the LED effect

**Why It's Cool:** Ambient, always-running desk art. No screen, no noise. Just a slowly rotating sphere telling the weather in color.

---

## 5. Analog Desktop Clock with Stepper-Driven Hands
**Difficulty:** Intermediate-Advanced  
**3D Parts:** Clock face, hour hand, minute hand, second hand (optional), gear train gears, motor mounts, back cover, stand  
**Pi Requirements:** Pi Zero W or any Pi, 2-3 stepper motors or servos  
**Extra:** 28BYJ-48 steppers (x2 or x3) or SG90 servos, optional NTP sync

**What:** A clean, minimalist wall/desk clock where the Pi drives real mechanical hands via stepper motors (servos). Syncs to NTP so it's always accurate.

**Build Notes:**
- Each hand driven by its own stepper through a 3D printed gear reduction (or direct drive with microstepping)
- Pi syncs time via NTP, calculates hand angles, pulses steppers at a smooth rate
- Gear train option: higher torque, smoother motion, more satisfying to watch
- Can add a "sweep" mode (smooth second hand) or "tick" mode (discrete steps) using stepper microstepping control
- 3D print with wood-fill or marble-fill PLA for a premium look
- Battery backup: add a small UPS HAT so the clock survives power blips

**Why It's Cool:** A real analog clock powered by a $5 Pi. The gear movement is mesmerizing. Great gateway to horology + stepper control.

---

## Quick Comparison

| Project | Cost | Time | Pi Required | 3D Print Volume |
|---|---|---|---|---|
| Pomodoro Timer | $10-15 | 1-2 days | Any Pi | Small (~1-2h) |
| Mini Plotter | $25-50 | 3-7 days | Any Pi | Medium (~6-10h) |
| Notification Flag | $8-12 | 1 day | Pi Zero W+ | Tiny (~30min) |
| Weather Orb | $15-30 | 2-4 days | Pi Zero 2 W+ | Medium (~4-6h) |
| Analog Clock | $15-35 | 3-5 days | Any Pi | Medium (~5-8h) |

---

## Common Parts Shopping List (All Projects)

| Part | Approx Cost | Used In |
|---|---|---|
| SG90 micro servo | $2-3 | Pomodoro, Flag, Plotter pen lift |
| 28BYJ-48 stepper + ULN2003 | $3-5 | Plotter, Weather Orb, Clock |
| A4988/DRV8825 driver | $2-3 | Plotter, Clock |
| Pushbutton (12mm) | $0.50 | Pomodoro, Flag |
| Dupont wires | $3 | All |
| MicroSD card | $5-8 | All (if not already have) |

All 3D models can be designed from scratch (OpenSCAD, Fusion 360) or adapted from Thingiverse/Printables. Petey probably has the CAD skills to dial these in himself.
