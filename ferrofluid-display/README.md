# Ferrofluid Electromagnetic Display

ESP32-S3 controlled multi-coil electromagnetic array for manipulating ferrofluid
based on IMU tilt input.

## Hardware
- **MCU**: ESP32-S3 with MicroPython
- **IMU**: MPU6050 (I2C)
- **Coil Drivers**: TB6612FNG or DRV8833 dual H-bridge motor drivers (×2)
- **Coils**: 4 solenoids arranged N/S/E/W
- **Display Cell**: Borosilicate glass disc/rectangle with ferrofluid
- **Power**: 1000mAh+ LiPo (coils draw 500mA+ at full power)

## Pinout
| Signal | ESP32-S3 Pin |
|--------|-------------|
| I2C SDA  | GPIO 8   |
| I2C SCL  | GPIO 9   |
| Coil 0 PWM A/B | GPIO 10/11 |
| Coil 1 PWM A/B | GPIO 12/13 |
| Coil 0 Enable | GPIO 16 |
| Coil 1 Enable | GPIO 17 |
| Button | GPIO 4 |

## Coil Design
- Wire gauge: 28-32 AWG enamelled copper wire
- Turns: ~200-500 per coil (tradeoff: more turns = stronger field but higher resistance)
- Bobbin: 3D-printed PLA or PETG
- Target resistance: 5-15Ω per coil at 5V → 300-1000mA
- Core: Ferrite or soft iron rod for field concentration

## Build
Flash with `mpremote` or Thonny IDE.
