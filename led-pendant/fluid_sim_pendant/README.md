# Fluid Simulation LED Pendant

ESP32-S3 + IMU-driven 2D fluid simulation on an LED matrix.

## Hardware
- **MCU**: ESP32-S3 (with PSRAM recommended for >16×16 grids)
- **LED Matrix**: WS2812B NeoPixel grid (8×8, 16×16, or Charlieplexed)
- **IMU**: MPU6050 (6-axis gyro + accelerometer)
- **Power**: 400mAh LiPo + TP4056 charger

## Simulation
2D shallow water / Navier-Stokes-inspired solver on a grid.
Tilt from IMU drives acceleration terms in the fluid equations.
Velocity + height fields rendered as a heatmap on LEDs.

## Pinout
| Signal | ESP32-S3 Pin |
|--------|-------------|
| LED Data | GPIO 18 |
| I2C SDA  | GPIO 8   |
| I2C SCL  | GPIO 9   |
| Button   | GPIO 4   |

## Build
```bash
idf.py build
idf.py flash
```
