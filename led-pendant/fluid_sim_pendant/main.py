"""
Fluid Simulation LED Pendant — ESP32-S3 MicroPython Code
=========================================================

Runs a 2D shallow-water fluid simulation on an LED matrix,
driven by MPU6050 IMU tilt input.

Hardware:
  - ESP32-S3 with MicroPython
  - WS2812B NeoPixel matrix (e.g. 16×16 = 256 LEDs, data on GPIO 18)
  - MPU6050 on I2C (SDA=GPIO 8, SCL=GPIO 9)
  - Optional button on GPIO 4 for mode cycling

Simulation:
  2D grid-based shallow water solver with:
  - Height field h(x,y)
  - Velocity fields u,v(x,y)
  - Gravity wave propagation + viscosity damping
  - IMU tilt mapped to body-force acceleration terms

The simulation state is rendered as an HSV colormap on the LED matrix.

Author: For Dr. Connors-chan 💕
"""

import time
import math
import struct
from machine import Pin, I2C, PWM
from neopixel import NeoPixel

# ─── Configuration ───────────────────────────────────────────────────
LED_PIN = 18
LED_COUNT = 256  # 16×16 grid
GRID_W = 16
GRID_H = 16
DT = 0.05               # Simulation time step
VISCOSITY = 0.02        # Damping coefficient
WAVE_SPEED = 1.0        # sqrt(g * h0) — controls wave propagation speed

# Color map: maps fluid height to (R, G, B) — deep blue → cyan → white
def height_to_color(h):
    """Map normalized height to RGB."""
    h = max(0.0, min(1.0, h))  # Clamp
    if h < 0.33:
        t = h / 0.33
        return (0, int(40 + 60 * t), int(180 + 75 * t))
    elif h < 0.66:
        t = (h - 0.33) / 0.33
        return (int(40 * t), int(100 + 100 * t), int(255 - 30 * t))
    else:
        t = (h - 0.66) / 0.34
        return (int(40 + 215 * t), int(200 + 55 * t), int(225 + 30 * t))

# ─── MPU6050 Driver ──────────────────────────────────────────────────
MPU_ADDR = 0x68

class MPU6050:
    def __init__(self, i2c):
        self.i2c = i2c
        # Wake up from sleep
        self.i2c.writeto_mem(MPU_ADDR, 0x6B, b'\x00')
        time.sleep_ms(100)
        self.gyro_offsets = [0, 0, 0]
        self.calibrate()

    def _read_reg(self, reg, length):
        return self.i2c.readfrom_mem(MPU_ADDR, reg, length)

    def calibrate(self, samples=200):
        """Calibrate gyro offsets (device must be stationary)."""
        gx_sum, gy_sum, gz_sum = 0, 0, 0
        for _ in range(samples):
            gx, gy, gz, _, _, _ = self.read_raw()
            gx_sum += gx
            gy_sum += gy
            gz_sum += gz
            time.sleep_ms(2)
        n = samples
        self.gyro_offsets = [gx_sum // n, gy_sum // n, gz_sum // n]

    def read_raw(self):
        data = self._read_reg(0x3B, 14)
        vals = struct.unpack('>hhhhhhh', data)
        ax, ay, az = vals[0], vals[1], vals[2]
        temp = vals[3]
        gx, gy, gz = vals[4], vals[5], vals[6]
        return gx, gy, gz, ax, ay, az, temp

    def get_accel_g(self):
        """Read accelerometer in g units (±2g range)."""
        _, _, _, ax, ay, az, _ = self.read_raw()
        # 16384 LSB/g for ±2g range
        return ax / 16384.0, ay / 16384.0, az / 16384.0

    def get_gyro_dps(self):
        """Read gyro in degrees/second (±250 dps range)."""
        gx, gy, gz, _, _, _, _ = self.read_raw()
        gx -= self.gyro_offsets[0]
        gy -= self.gyro_offsets[1]
        gz -= self.gyro_offsets[2]
        # 131 LSB/dps for ±250 dps range
        return gx / 131.0, gy / 131.0, gz / 131.0


# ─── Fluid Simulation ────────────────────────────────────────────────
class FluidSim:
    """
    2D shallow water simulation on a regular grid.
    Fields:
      h   — surface height deviation from equilibrium (h=0 flat)
      u   — x-velocity
      v   — y-velocity
    """
    def __init__(self, w, h_grid):
        self.w = w
        self.h = h_grid
        self.n = w * h_grid

        # Flatten to 1D arrays for performance on constrained MCU
        # Using lists of floats since MicroPython doesn't have numpy
        self.h_field = [1.0] * self.n       # Height (1.0 = equilibrium)
        self.h_new   = [1.0] * self.n
        self.u_field = [0.0] * self.n       # x-velocity
        self.u_new   = [0.0] * self.n
        self.v_field = [0.0] * self.n
        self.v_new   = [0.0] * self.n

    def _idx(self, x, y):
        return y * self.w + x

    def _get(self, field, x, y):
        """Get field value with boundary clamping."""
        x = max(0, min(self.w - 1, x))
        y = max(0, min(self.h - 1, y))
        return field[self._idx(x, y)]

    def step(self, dt, accel_x, accel_y):
        """Advance simulation by one timestep.
        accel_x/y: normalized acceleration from IMU (±1.0).
        """
        w, h = self.w, self.h
        c2 = WAVE_SPEED * WAVE_SPEED  # c² = g * h₀
        viscosity = VISCOSITY

        for y in range(h):
            for x in range(w):
                i = self._idx(x, y)

                # Height update: continuity equation
                # ∂h/∂t = -h₀ (∂u/∂x + ∂v/∂y)
                du_dx = (self._get(self.u_field, x + 1, y) - self._get(self.u_field, x - 1, y)) * 0.5
                dv_dy = (self._get(self.v_field, x, y + 1) - self._get(self.v_field, x, y - 1)) * 0.5
                self.h_new[i] = self.h_field[i] - dt * (du_dx + dv_dy)

                # X-velocity update: momentum equation
                # ∂u/∂t = -g ∂h/∂x + ax - ν u
                dh_dx = (self._get(self.h_field, x + 1, y) - self._get(self.h_field, x - 1, y)) * 0.5
                # Laplacian for diffusion
                lap_u = (self._get(self.u_field, x + 1, y) + self._get(self.u_field, x - 1, y) +
                         self._get(self.u_field, x, y + 1) + self._get(self.u_field, x, y - 1) -
                         4.0 * self.u_field[i])
                self.u_new[i] = (self.u_field[i] + dt * (
                    -c2 * dh_dx
                    + accel_x * 2.0    # Body force from tilt
                    + viscosity * lap_u
                ))

                # Y-velocity update
                dh_dy = (self._get(self.h_field, x, y + 1) - self._get(self.h_field, x, y - 1)) * 0.5
                lap_v = (self._get(self.v_field, x + 1, y) + self._get(self.v_field, x - 1, y) +
                         self._get(self.v_field, x, y + 1) + self._get(self.v_field, x, y - 1) -
                         4.0 * self.v_field[i])
                self.v_new[i] = (self.v_field[i] + dt * (
                    -c2 * dh_dy
                    + accel_y * 2.0    # Body force from tilt
                    + viscosity * lap_v
                ))

        # Swap buffers
        self.h_field, self.h_new = self.h_new, self.h_field
        self.u_field, self.u_new = self.u_new, self.u_field
        self.v_field, self.v_new = self.v_new, self.v_field

    def add_drop(self, cx, cy, radius=2, strength=0.5):
        """Add a water drop at center (cx, cy)."""
        for dy in range(-radius, radius + 1):
            for dx in range(-radius, radius + 1):
                dist = math.sqrt(dx * dx + dy * dy)
                if dist <= radius:
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < self.w and 0 <= ny < self.h:
                        factor = 1.0 - dist / radius
                        self.h_field[self._idx(nx, ny)] += strength * factor * factor

    def get_height_range(self):
        """Find min/max height for normalization."""
        mn = self.h_field[0]
        mx = self.h_field[0]
        for v in self.h_field:
            if v < mn: mn = v
            if v > mx: mx = v
        return mn, mx


# ─── Main Application ───────────────────────────────────────────────
def run():
    # Initialize LED matrix
    np = NeoPixel(Pin(LED_PIN), LED_COUNT)

    # Initialize I2C and MPU6050
    i2c = I2C(0, sda=Pin(8), scl=Pin(9), freq=400000)
    print(f"I2C devices: {[hex(i) for i in i2c.scan()]}")

    if MPU_ADDR not in i2c.scan():
        print(f"ERROR: MPU6050 not found at {hex(MPU_ADDR)}")
        print("Check wiring — SDA=GPIO8, SCL=GPIO9, 3.3V/GND")
        return

    mpu = MPU6050(i2c)
    print(f"Gyro offsets: {mpu.gyro_offsets}")

    # Initialize fluid simulation
    sim = FluidSim(GRID_W, GRID_H)

    # Add initial drops for visual effect
    sim.add_drop(4, 4, radius=3, strength=0.8)
    sim.add_drop(12, 12, radius=3, strength=0.8)

    # Button for interaction
    button = Pin(4, Pin.IN, Pin.PULL_UP)

    mode = 0
    modes = ['fluid', 'drop-on-press', 'random']
    print("Fluid Simulation Pendant — modes: " + ", ".join(modes))
    print("Press button to cycle modes")

    last_drop = 0
    last_mode_check = 0

    while True:
        # Read IMU
        accel_x, accel_y, accel_z = mpu.get_accel_g()
        gyro_x, gyro_y, _ = mpu.get_gyro_dps()

        # Normalize accel to ±1 range for simulation forcing
        ax = max(-1.0, min(1.0, accel_x))
        ay = max(-1.0, min(1.0, accel_y))

        # Mode cycling via button
        now = time.ticks_ms()
        if time.ticks_diff(now, last_mode_check) > 200:
            last_mode_check = now
            if button.value() == 0:  # Pressed (active low with pull-up)
                mode = (mode + 1) % len(modes)
                print(f"Mode: {modes[mode]}")
                time.sleep_ms(300)  # Debounce

        # Drop injection based on mode
        if time.ticks_diff(now, last_drop) > 500:
            last_drop = now
            if modes[mode] == 'random':
                import random
                cx = random.randint(2, GRID_W - 3)
                cy = random.randint(2, GRID_H - 3)
                sim.add_drop(cx, cy, radius=1, strength=0.3)
            elif modes[mode] == 'drop-on-press' and button.value() == 0:
                # Drop at center or based on dominant tilt direction
                cx = GRID_W // 2 + int(ax * 4)
                cy = GRID_H // 2 + int(ay * 4)
                cx = max(0, min(GRID_W - 1, cx))
                cy = max(0, min(GRID_H - 1, cy))
                sim.add_drop(cx, cy, radius=2, strength=0.6)
                time.sleep_ms(200)

        # Advance simulation (multiple substeps for stability)
        for _ in range(3):
            sim.step(DT * 0.33, ax, ay)

        # Normalize height and map to LEDs
        mn, mx = sim.get_height_range()
        range_h = mx - mn if mx != mn else 1.0

        for y in range(GRID_H):
            for x in range(GRID_W):
                i = sim._idx(x, y)
                # Normalize to 0-1
                norm = (sim.h_field[i] - mn) / range_h
                # Enhance contrast
                norm = norm ** 0.6

                r, g, b = height_to_color(norm)

                # Map 2D grid to NeoPixel index
                # Use serpentine (zigzag) layout: odd rows go right-to-left
                if y % 2 == 0:
                    led_idx = y * GRID_W + x
                else:
                    led_idx = y * GRID_W + (GRID_W - 1 - x)

                if led_idx < LED_COUNT:
                    np[led_idx] = (r, g, b)

        np.write()


if __name__ == '__main__':
    run()
