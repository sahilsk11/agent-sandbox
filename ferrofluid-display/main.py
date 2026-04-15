"""
Ferrofluid Electromagnetic Display — MicroPython Controller
============================================================

Drives a multi-coil electromagnetic array to manipulate ferrofluid
in a sealed glass cell based on IMU tilt input.

Hardware:
  - ESP32-S3 with MicroPython
  - MPU6050 IMU (I2C: SDA=GPIO 8, SCL=GPIO 9)
  - TB6612FNG or DRV8833 dual motor drivers (one per coil pair)
    OR L293D H-bridges for bidirectional coil current
  - 4-8 coils arranged hexagonally or in a grid
  - Sealed borosilicate glass cell with ferrofluid (EFH1 or similar)
  - 400mAh+ LiPo — coils draw significant current!

Theory:
  Each coil generates a magnetic field B ∝ N·I (turns × current).
  By controlling current magnitude and direction through coil pairs,
  we create a composite field vector that "pulls" the ferrofluid
  to any position within the cell.

  The ferrofluid responds to ∇(M·B) — it moves toward field maxima
  and forms characteristic spike patterns (Rosensweig instability)
  when field gradient exceeds a critical threshold.

Author: For Dr. Connors-chan 💕
"""

import time
import math
from machine import Pin, I2C, PWM
import struct


# ─── Configuration ───────────────────────────────────────────────────
IMU_SDA = 8
IMU_SCL = 9
BUTTON_PIN = 4

# Coil driver pins — PWM per coil for analog control
# Assumes 4 coils arranged N/S/E/W (cardinal configuration)
# Each coil pair shares one H-bridge for bidirectional current
# Coil directions: [North-South pair, East-West pair]
COIL_PWM_PINS = [
    # (PWM pin A, PWM pin B) per coil pair — A/B control direction
    (10, 11),   # Coil pair 0: North-South axis
    (12, 13),   # Coil pair 1: East-West axis
]

# Mode pin for direction control (digital HIGH/LOW selects which way current flows)
# If using PWM drivers like TB6612FNG with separate AIN/BIN, adjust accordingly
COIL_DIR_PINS = [14, 15]  # One dir pin per coil pair
COIL_ENABLE_PINS = [16, 17]  # Enable pins per coil pair

MAX_COIL_CURRENT = 1023  # Max PWM duty (10-bit for ESP32)
COIL_DEADZONE = 30  # Minimum PWM before coil engages (friction threshold)

# Field mapping parameters
# These map tilt angle → coil activation pattern
# Can be tuned for optimal ferrofluid response
FIELD_STRENGTH = 1.0  # Global multiplier (0.0 - 1.0)
FIELD_SMOOTHING = 0.3  # Temporal smoothing factor (0 = no smoothing, 1 = full)

# ─── MPU6050 Driver ──────────────────────────────────────────────────
MPU_ADDR = 0x68

class MPU6050:
    def __init__(self, i2c):
        self.i2c = i2c
        self.i2c.writeto_mem(MPU_ADDR, 0x6B, b'\x00')
        time.sleep_ms(100)
        self.gyro_offsets = [0, 0, 0]
        self.accel_offsets = [0, 0, 0]
        self.calibrate()

    def calibrate(self, samples=200):
        """Calibrate offsets (device must be stationary)."""
        gx_sum, gy_sum, gz_sum = 0, 0, 0
        ax_sum, ay_sum, az_sum = 0, 0, 0
        for _ in range(samples):
            gx, gy, gz, ax, ay, az, _ = self.read_raw()
            gx_sum += gx; gy_sum += gy; gz_sum += gz
            ax_sum += ax; ay_sum += ay; az_sum += az
            time.sleep_ms(2)
        n = samples
        self.gyro_offsets = [gx_sum // n, gy_sum // n, gz_sum // n]
        self.accel_offsets = [ax_sum // n, ay_sum // n, az_sum // n]

    def read_raw(self):
        data = self.i2c.readfrom_mem(MPU_ADDR, 0x3B, 14)
        vals = struct.unpack('>hhhhhhh', data)
        return vals[4], vals[5], vals[6], vals[0], vals[1], vals[2], vals[3]

    def get_accel_g(self):
        _, _, _, ax, ay, az, _ = self.read_raw()
        ax -= self.accel_offsets[0]
        ay -= self.accel_offsets[1]
        az -= self.accel_offsets[2]
        # 16384 LSB/g for ±2g range
        return ax / 16384.0, ay / 16384.0, az / 16384.0

    def get_tilt_angles(self):
        """Get tilt angles from accelerometer (pitch and roll in degrees)."""
        ax, ay, az = self.get_accel_g()
        roll = math.atan2(ay, az) * 180.0 / math.pi
        pitch = math.atan2(-ax, math.sqrt(ay * ay + az * az)) * 180.0 / math.pi
        return pitch, roll


# ─── Coil Driver ─────────────────────────────────────────────────────
class CoilDriver:
    """
    Manages bidirectional current through coil pairs using H-bridge drivers.

    Uses two PWM signals per coil pair:
    - Setting PWM_A high and PWM_B low drives current in one direction
    - Setting PWM_B high and PWM_A low drives current in the opposite direction
    - Both low = coil off (freewheeling)
    """
    def __init__(self):
        self.pwm_outputs = []
        self.prev_values = [0.0, 0.0]

        for pin_a, pin_b in COIL_PWM_PINS:
            pwm_a = PWM(Pin(pin_a), freq=20000)  # 20kHz PWM — above audio range
            pwm_b = PWM(Pin(pin_b), freq=20000)
            self.pwm_outputs.append((pwm_a, pwm_b))
            pwm_a.duty(0)
            pwm_b.duty(0)

        # Enable pins
        self.enables = [Pin(p, Pin.OUT) for p in COIL_ENABLE_PINS]
        for en in self.enables:
            en.value(1)  # Enable all drivers

    def set_coil(self, coil_idx, strength):
        """
        Set a coil pair's current.

        Args:
            coil_idx: 0 or 1
            strength: -1.0 to 1.0 (negative = reverse direction)
        """
        if coil_idx < 0 or coil_idx >= len(self.pwm_outputs):
            return

        strength = max(-1.0, min(1.0, strength))

        # Apply smoothing
        strength = (1.0 - FIELD_SMOOTHING) * strength + FIELD_SMOOTHING * self.prev_values[coil_idx]
        self.prev_values[coil_idx] = strength

        pwm_a, pwm_b = self.pwm_outputs[coil_idx]

        if abs(strength) * MAX_COIL_CURRENT < COIL_DEADZONE:
            # Below threshold — turn off both directions
            pwm_a.duty(0)
            pwm_b.duty(0)
        elif strength >= 0:
            # Positive direction
            pwm_a.duty(int(strength * MAX_COIL_CURRENT))
            pwm_b.duty(0)
        else:
            # Negative direction
            pwm_a.duty(0)
            pwm_b.duty(int(-strength * MAX_COIL_CURRENT))

    def set_field_vector(self, bx, by):
        """
        Set a magnetic field vector by driving coil pairs appropriately.

        Args:
            bx: X-component of desired field (-1.0 to 1.0)
            by: Y-component of desired field (-1.0 to 1.0)
        """
        # Map field components to coil currents
        # With N/S/E/W arrangement:
        #   bx → drives N-S coil pair (coil 0)
        #   by → drives E-W coil pair (coil 1)
        self.set_coil(0, bx * FIELD_STRENGTH)
        self.set_coil(1, by * FIELD_STRENGTH)

    def all_off(self):
        """De-energize all coils."""
        for i in range(len(self.pwm_outputs)):
            self.set_coil(i, 0.0)


# ─── Ferrofluid Display Controller ───────────────────────────────────
class FerrofluidDisplay:
    def __init__(self):
        # Initialize I2C and IMU
        self.i2c = I2C(0, sda=Pin(IMU_SDA), scl=Pin(IMU_SCL), freq=400000)
        print(f"I2C scan: {[hex(i) for i in self.i2c.scan()]}")

        if MPU_ADDR not in self.i2c.scan():
            print("ERROR: MPU6050 not found on I2C!")
            return None

        self.mpu = MPU6050(self.i2c)
        print("MPU6050 initialized and calibrated")

        # Initialize coil driver
        self.coils = CoilDriver()
        print("Coil driver initialized")

        # State machine for display modes
        self.mode = 0
        self.modes = ['gravity_follow', 'dance', 'spike_max', 'pendulum']
        self.mode_names = {
            'gravity_follow': 'Tilt-follow — ferrofluid tracks tilt',
            'dance': 'Dance — auto-oscillating pattern',
            'spike_max': 'Spike — maximize Rosensweig spikes',
            'pendulum': 'Pendulum — ferrofluid swings like a mass',
        }
        print("Modes: " + ", ".join(self.modes))

        # Pendulum state
        self.pendulum_angle = 0
        self.pendulum_velocity = 0

        # Button
        self.button = Pin(BUTTON_PIN, Pin.IN, Pin.PULL_UP)
        self.last_button = time.ticks_ms()

    def cycle_mode(self):
        if self.button.value() == 0:
            now = time.ticks_ms()
            if time.ticks_diff(now, self.last_button) > 500:
                self.last_button = now
                self.mode = (self.mode + 1) % len(self.modes)
                mode_name = self.modes[self.mode]
                print(f"\n>>> Mode: {mode_name}")
                print(f"    {self.mode_names[mode_name]}")
                # Small pause on mode change to avoid jerky transition
                self.coils.all_off()
                time.sleep_ms(200)
            return True
        return False

    def gravity_follow(self):
        """Ferrofluid follows the direction of gravity (tilt)."""
        pitch, roll = self.mpu.get_tilt_angles()
        # Normalize to ±1 (max tilt is ±90 degrees)
        bx = clamp(pitch / 45.0, -1.0, 1.0)
        by = clamp(roll / 45.0, -1.0, 1.0)
        self.coils.set_field_vector(bx, by)

    def dance(self):
        """Auto-oscillating figure-8 pattern."""
        t = time.ticks_ms() / 1000.0
        bx = math.sin(t * 1.5) * 0.7
        by = math.sin(t * 2.3) * math.cos(t * 1.5) * 0.5
        self.coils.set_field_vector(bx, by)

    def spike_max(self):
        """Maximize Rosensweig instability spikes by rapidly
        pulsing the field magnitude."""
        t = time.ticks_ms() / 100.0
        # Pulsate field strength while rotating direction
        magnitude = 0.5 + 0.5 * math.sin(t)
        angle = t * 2.0
        bx = magnitude * math.cos(angle)
        by = magnitude * math.sin(angle)
        self.coils.set_field_vector(bx, by)

    def pendulum(self):
        """Simulate a pendulum — the ferrofluid swings back and forth
        with damped oscillation, reset by tilting the device."""
        pitch, _ = self.mpu.get_tilt_angles()
        dt = 0.02  # Time step

        # Gravity torque
        torque = -0.5 * math.sin(math.radians(pitch))
        # Damping
        damping = -0.1 * self.pendulum_velocity
        # Update
        self.pendulum_velocity += (torque + damping) * dt
        self.pendulum_angle += self.pendulum_velocity * dt

        # Reset velocity when shaken
        ax, ay, az = self.mpu.get_accel_g()
        total_accel = math.sqrt(ax*ax + ay*ay + az*az)
        if abs(total_accel - 1.0) > 0.3:
            self.pendulum_velocity += (total_accel - 1.0) * 0.5

        # Map pendulum angle to field
        bx = math.sin(self.pendulum_angle) * 0.8
        by = 0
        self.coils.set_field_vector(bx, by)

    def run(self):
        print("\n" + "=" * 50)
        print("🧲 Ferrofluid Electromagnetic Display")
        print("=" * 50)
        print(f"Mode: {self.modes[self.mode]}")
        print("Press button to cycle modes")
        print("=" * 50)

        while True:
            self.cycle_mode()

            mode_name = self.modes[self.mode]
            if mode_name == 'gravity_follow':
                self.gravity_follow()
            elif mode_name == 'dance':
                self.dance()
            elif mode_name == 'spike_max':
                self.spike_max()
            elif mode_name == 'pendulum':
                self.pendulum()

            time.sleep_ms(20)  # ~50 Hz update rate


def clamp(x, lo, hi):
    return max(lo, min(hi, x))


if __name__ == '__main__':
    display = FerrofluidDisplay()
    if display:
        display.run()
