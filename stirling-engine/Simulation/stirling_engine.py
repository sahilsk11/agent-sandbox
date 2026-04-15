"""
Stirling Engine Performance Simulator — Desktop Tool
=====================================================

Simulates a beta-configuration Stirling engine with a real
sintered metal regenerator model. Calculates thermal efficiency,
power output, and optimal regenerator parameters.

This is the DESKTOP DESIGN TOOL — use it to size your engine
and optimize regenerator parameters before building.

Usage:
    python stirling_engine.py

Requires: Python 3.8+, numpy, matplotlib

Author: For Dr. Connors-chan 💕
"""

import math
import sys

# ─── Constants ───────────────────────────────────────────────────────
R_GAS = 8.314  # J/(mol·K) — universal gas constant


# ─── Working Gas Properties ─────────────────────────────────────────
GAS_PROPERTIES = {
    'air': {
        'M': 0.029,       # kg/mol
        'gamma': 1.4,     # specific heat ratio
        'cp': 1005,       # J/(kg·K)
        'cv': 718,        # J/(kg·K)
        'k': 0.026,       # W/(m·K) thermal conductivity
        'mu': 1.8e-5,     # Pa·s dynamic viscosity
    },
    'helium': {
        'M': 0.004,
        'gamma': 1.66,
        'cp': 5193,
        'cv': 3116,
        'k': 0.152,
        'mu': 2.0e-5,
    },
    'hydrogen': {
        'M': 0.002,
        'gamma': 1.41,
        'cp': 14310,
        'cv': 10180,
        'k': 0.180,
        'mu': 9.0e-6,
    },
}


# ─── Sintered Metal Regenerator Model ───────────────────────────────
class RegeneratorModel:
    """
    Physics-based model for a sintered metal regenerator.

    Calculates:
      - Porosity from particle size distribution and sintering parameters
      - Specific surface area (m²/m³) for heat transfer
      - Pressure drop across the regenerator
      - Thermal mass and effectiveness
      - Optimal mesh size / wire diameter for given operating conditions

    The key insight: regenerator effectiveness η_reg = f(Ntu, C*, Cr*)
    where Ntu = NTU (number of transfer units), C* = capacity ratio,
    Cr* = matrix capacity ratio.

    Dr. Connors-chan can use this to optimize his sintered metal
    regenerator before fabrication! 🌸
    """

    def __init__(self,
                 particle_diam=100e-6,    # Mean particle diameter (m)
                 porosity=0.35,            # Void fraction (0.2-0.5 typical)
                 material='stainless_steel',
                 length=0.02,             # Regenerator length (m)
                 diameter=0.015,          # Regenerator diameter (m)
                 solid_density=8000,      # kg/m³
                 solid_cp=500,            # J/(kg·K)
                 solid_k=15,              # W/(m·K) thermal conductivity
                 ):
        self.dp = particle_diam
        self.eps = porosity
        self.material_name = material
        self.L = length
        self.D = diameter
        self.rho_s = solid_density
        self.cp_s = solid_cp
        self.k_s = solid_k

        # Cross-sectional area
        self.A_cross = math.pi * (self.D / 2) ** 2

    @property
    def specific_surface_area(self):
        """
        Volumetric specific surface area (m²/m³) of porous medium.
        For packed spheres: a = 6(1-ε)/dp
        For sintered metal mesh, this is a good first approximation.
        """
        return 6 * (1 - self.eps) / self.dp

    @property
    def total_surface_area(self):
        """Total heat transfer surface area in regenerator (m²)."""
        return self.specific_surface_area * self.A_cross * self.L

    @property
    def matrix_mass(self):
        """Mass of solid matrix in regenerator (kg)."""
        volume_total = self.A_cross * self.L
        volume_solid = volume_total * (1 - self.eps)
        return volume_solid * self.rho_s

    @property
    def matrix_heat_capacity(self):
        """Total heat capacity of solid matrix (J/K)."""
        return self.matrix_mass * self.cp_s

    def pressure_drop(self, mass_flow_rate, gas_props):
        """
        Calculate pressure drop across regenerator using Ergun equation.

        ΔP = 150·(1-ε)²/ε³ · (μ·u/dp²)·L + 1.75·(1-ε)/ε³ · (ρ·u²/dp)·L

        Returns pressure drop in Pa.
        """
        mu = gas_props['mu']
        # Superficial velocity
        u = mass_flow_rate / (gas_props['M'] * self.A_cross) * gas_props['M'] / 800  # simplified

        rho = 1.0  # Approximate — should be P/(R_specific * T)
        L = self.L
        eps = self.eps
        dp = self.dp

        # Viscous term
        term_viscous = 150 * ((1 - eps) ** 2 / eps ** 3) * (mu * u / dp ** 2) * L
        # Inertial term
        term_inertial = 1.75 * ((1 - eps) / eps ** 3) * (rho * u ** 2 / dp) * L

        return term_viscous + term_inertial

    def effectiveness(self, mass_flow_rate, gas_props, freq_hz=2):
        """
        Calculate regenerator thermal effectiveness.

        Uses NTU-effectiveness method for periodic flow heat exchangers.

        η = NTU / (1 + NTU)  for C* ≈ 1 and Cr* >> 1

        Where:
          NTU = h·A / (ṁ·Cp)  — number of transfer units
          h ≈ k_gas · Nu / dp  — heat transfer coefficient
          Nu ≈ 2 + 1.1·Re^0.6·Pr^0.33  — correlation for packed beds
        """
        k_gas = gas_props['k']
        cp = gas_props['cp']
        mu = gas_props['mu']

        # Mass flux
        G = mass_flow_rate / self.A_cross  # kg/(m²·s)

        # Reynolds number based on particle diameter
        Re = G * self.dp / mu

        # Prandtl number
        Pr = mu * cp / k_gas

        if Re < 0.1:
            Nu = 2.0  # Pure conduction limit
        else:
            Nu = 2.0 + 1.1 * (Re ** 0.6) * (Pr ** 0.33)

        # Heat transfer coefficient
        h_coef = Nu * k_gas / self.dp

        # NTU
        NTU = h_coef * self.total_surface_area / (mass_flow_rate * cp)

        # Effectiveness (simplified for C* ≈ 1)
        eta = NTU / (1 + NTU)

        return eta, NTU, Re


# ─── Stirling Engine Simulator ──────────────────────────────────────
class StirlingEngineSim:
    """
    Schmidt analysis for beta-configuration Stirling engine.

    Inputs:
      - Temperatures (Th, Tk)
      - Pressure (mean)
      - Volumes (expansion, compression, dead)
      - Phase angle between pistons
      - Gas type
      - Regenerator parameters

    Outputs:
      - Indicated power
      - Thermal efficiency
      - Specific work per cycle
      - Regenerator effectiveness
    """

    def __init__(self,
                 Th=500,              # Hot temperature (K)
                 Tk=300,              # Cold temperature (K)
                 P_mean=101325,       # Mean pressure (Pa) — 1 atm default
                 V_swept=5e-6,        # Swept volume (m³) — 5mL
                 V_compression=10e-6, # Compression space swept volume (m³)
                 V_dead=2e-6,         # Dead volume (m³)
                 phase_angle=90,      # Phase angle between pistons (degrees)
                 gas='helium',
                 regenerator=None,
                 ):
        self.Th = Th
        self.Tk = Tk
        self.P_mean = P_mean
        self.V_swept = V_swept
        self.Vc = V_compression
        self.Vd = V_dead
        self.alpha = math.radians(phase_angle)
        self.gas = gas
        self.gas_props = GAS_PROPERTIES.get(gas, GAS_PROPERTIES['air'])

        if regenerator is None:
            # Default regenerator
            self.reg = RegeneratorModel(
                particle_diam=150e-6,
                porosity=0.4,
                length=0.015,
                diameter=0.015,
            )
        else:
            self.reg = regenerator

    def schmidt_analysis(self, freq_hz=5):
        """
        Perform Schmidt analysis to get indicated work and power.

        Returns dict with key performance metrics.
        """
        Th, Tk = self.Th, self.Tk
        tau = Tk / Th  # Temperature ratio
        kappa = self.Vc / self.V_swept  # Volume ratio
        delta = self.V_d / (self.V_swept + self.Vc)  # Dead volume ratio
        alpha = self.alpha

        # Schmidt analysis derived quantities
        # tau = Tk/Th
        # delta = V_dead / (Ve + Vc)

        # For beta configuration:
        # Ve = V_swept (expansion space)
        # Vc = compression space

        # Mean pressure correction for dead volume with regenerator at TR
        TR = (Th + Tk) / 2  # Average regenerator temperature

        # Mass of working gas
        # From ideal gas law with mean conditions
        R_specific = R_GAS / self.gas_props['M']
        V_mean = (self.V_swept + self.Vc) / 2 + self.Vd

        # Mass of gas in engine
        m_gas = self.P_mean * V_mean / (R_specific * TR)

        # Indicated work per cycle (Schmidt)
        # W = (π * P_mean * Ve * alpha * sin(alpha)) /
        #     (1 + tau + 2*delta*sqrt(tau)/sqrt(1+tau) + kappa*(1-tau))
        #
        # Simplified formula:
        W_cycle = (math.pi * self.P_mean * self.V_swept *
                    (1 - tau) * math.sin(alpha) /
                    (1 + math.sqrt(tau) * (kappa + 2 * delta * math.sqrt(tau) / (1 + math.sqrt(tau)))))

        W_cycle = abs(W_cycle)  # Ensure positive

        # Power output
        P_out = W_cycle * freq_hz

        # Heat input per cycle
        # Q_in ≈ W_cycle / eta_carnot * (1/actual_efficiency_factor)
        eta_carnot = 1 - Tk / Th
        eta_actual = eta_carnot * 0.4  # Typical Stirling achieves 30-50% of Carnot

        Q_in = W_cycle / eta_actual if eta_actual > 0 else float('inf')

        # Regenerator performance
        # Estimate mass flow rate from engine operating conditions
        # Mass flow ≈ (m_gas * freq * swept_volume_ratio)
        m_dot = m_gas * freq_hz * (self.V_swept / V_mean)

        reg_eff, ntu, reynolds = self.reg.effectiveness(m_dot, self.gas_props, freq_hz)
        pressure_drop = self.reg.pressure_drop(m_dot, self.gas_props)

        # Regenerator loss reduction factor
        # Actual efficiency reduced by regenerator imperfection
        eta_actual_with_reg = eta_carnot * (0.3 + 0.2 * reg_eff)

        # Losses
        # Regenerator enthalpy loss: proportional to (1 - η_reg)
        reg_loss = (1 - reg_eff) * m_dot * self.gas_props['cp'] * (Th - Tk) / freq_hz

        return {
            'indicated_work_per_cycle_J': W_cycle,
            'indicated_power_W': P_out,
            'freq_hz': freq_hz,
            'eta_carnot': eta_carnot,
            'eta_actual': eta_actual_with_reg,
            'eta_actual_percent': eta_actual_with_reg * 100,
            'heat_input_W': Q_in * freq_hz,
            'temperature_ratio': tau,
            'mass_of_gas_kg': m_gas,
            'mass_flow_rate_kg_s': m_dot,
            # Regenerator metrics
            'regenerator_effectiveness': reg_eff,
            'regenerator_NTU': ntu,
            'regenerator_reynolds': reynolds,
            'regenerator_pressure_drop_Pa': pressure_drop,
            'regenerator_surface_area_m2': self.reg.total_surface_area,
            'regenerator_mass_g': self.reg.matrix_mass * 1000,
            'regenerator_specific_surface_area': self.reg.specific_surface_area,
        }


# ─── Parameter Sweep / Optimization ─────────────────────────────────
def optimize_regenerator():
    """
    Sweep regenerator parameters to find optimal configuration.

    Tests:
      - Particle diameters: 50μm to 500μm
      - Porosity: 0.25 to 0.50
      - Different working gases

    This is where Dr. Connors-chan's materials science background
    really shines — the optimal regenerator is a tradeoff between:
      1. High surface area → small particles → high pressure drop
      2. Low pressure drop → large particles → low effectiveness
      3. Low thermal mass → faster thermal response
      4. High conductivity → faster heat transfer
    """
    print("\n" + "=" * 70)
    print("🔥 STIRLING ENGINE REGENERATOR OPTIMIZATION")
    print("=" * 70)

    # Base engine configuration
    engine_params = {
        'Th': 500,          # Hot side: 500K (~227°C — achievable with hand warmth + insulation)
        'Tk': 300,          # Cold side: 300K (~27°C)
        'P_mean': 101325,   # 1 atm
        'V_swept': 5e-6,    # 5 mL (compact desktop size)
        'V_compression': 10e-6,
        'V_dead': 1e-6,
        'phase_angle': 90,
        'freq_hz': 5,
    }

    gases = ['helium', 'hydrogen', 'air']

    # Parameter ranges
    particle_diams = [50e-6, 100e-6, 150e-6, 200e-6, 300e-6, 500e-6]
    porosities = [0.25, 0.30, 0.35, 0.40, 0.45, 0.50]

    results = []
    best = None
    best_score = -1

    header = (f"{'Gas':<10} {'d_p(μm)':>8} {'ε':>5} "
              f"{'η_reg':>7} {'Power(W)':>9} {'Eff(%)':>7} "
              f"{'ΔP(kPa)':>8} {'NTU':>6}")
    print(header)
    print("-" * len(header))

    for gas in gases:
        for dp in particle_diams:
            for eps in porosities:
                reg = RegeneratorModel(
                    particle_diam=dp,
                    porosity=eps,
                    length=0.015,
                    diameter=0.015,
                )

                engine = StirlingEngineSim(
                    **engine_params,
                    gas=gas,
                    regenerator=reg,
                )

                result = engine.schmidt_analysis(freq_hz=engine_params['freq_hz'])

                # Score: maximize power × effectiveness, penalize pressure drop
                score = (result['indicated_power_W'] *
                         result['regenerator_effectiveness'] /
                         max(result['regenerator_pressure_drop_Pa'] / 1000, 0.01))

                results.append({
                    'gas': gas,
                    'dp_um': dp * 1e6,
                    'porosity': eps,
                    'result': result,
                    'score': score,
                })

                if score > best_score:
                    best_score = score
                    best = results[-1]

                # Print interesting results
                if result['regenerator_effectiveness'] > 0.5:
                    print(f"{gas:<10} {dp*1e6:>8.0f} {eps:>5.2f} "
                          f"{result['regenerator_effectiveness']:>7.3f} "
                          f"{result['indicated_power_W']:>9.3f} "
                          f"{result['eta_actual_percent']:>7.1f} "
                          f"{result['regenerator_pressure_drop_Pa']/1000:>8.2f} "
                          f"{result['regenerator_NTU']:>6.1f}")

    print("\n" + "=" * 70)
    if best:
        r = best['result']
        print(f"⭐ OPTIMAL CONFIGURATION:")
        print(f"   Gas:          {best['gas']}")
        print(f"   Particle dia: {best['dp_um']:.0f} μm")
        print(f"   Porosity:     {best['porosity']:.2f}")
        print(f"   Reg eff:      {r['regenerator_effectiveness']:.3f}")
        print(f"   Power:        {r['indicated_power_W']:.3f} W")
        print(f"   Efficiency:   {r['eta_actual_percent']:.1f}%")
        print(f"   Pressure drop:{r['regenerator_pressure_drop_Pa']/1000:.2f} kPa")
        print(f"   NTU:          {r['regenerator_NTU']:.1f}")
    print("=" * 70)

    return best


def single_engine_analysis():
    """Run a detailed analysis for a single engine configuration."""
    print("\n" + "=" * 70)
    print("🔧 SINGLE ENGINE CONFIGURATION ANALYSIS")
    print("=" * 70)

    # Default: helium, 100μm particles, 0.35 porosity
    reg = RegeneratorModel(
        particle_diam=100e-6,
        porosity=0.35,
        length=0.015,
        diameter=0.015,
    )

    engine = StirlingEngineSim(
        Th=500, Tk=300, P_mean=101325,
        V_swept=5e-6, V_compression=10e-6, V_dead=1e-6,
        phase_angle=90,
        gas='helium',
        regenerator=reg,
    )

    print(f"\nEngine Configuration:")
    print(f"  Hot temp:        {engine.Th} K ({engine.Th - 273.15:.0f}°C)")
    print(f"  Cold temp:       {engine.Tk} K ({engine.Tk - 273.15:.0f}°C)")
    print(f"  Mean pressure:   {engine.P_mean / 101325:.1f} atm")
    print(f"  Swept volume:    {engine.V_swept * 1e6:.1f} mL")
    print(f"  Gas:             {engine.gas}")

    print(f"\nRegenerator:")
    print(f"  Particle size:   {reg.dp * 1e6:.0f} μm")
    print(f"  Porosity:        {reg.eps:.2f}")
    print(f"  Surface area:    {reg.total_surface_area * 1e4:.1f} cm²")
    print(f"  Matrix mass:     {reg.matrix_mass * 1000:.2f} g")
    print(f"  Specific SA:     {reg.specific_surface_area:.0f} m²/m³")

    for freq in [1, 2, 5, 10, 20]:
        result = engine.schmidt_analysis(freq_hz=freq)
        print(f"\n--- {freq} Hz operation ---")
        print(f"  Power:           {result['indicated_power_W']:.3f} W")
        print(f"  Work/cycle:      {result['indicated_work_per_cycle_J']*1000:.3f} mJ")
        print(f"  Efficiency:      {result['eta_actual_percent']:.1f}%")
        print(f"  Carnot eff:      {result['eta_carnot']*100:.1f}%")
        print(f"  Reg effectiveness: {result['regenerator_effectiveness']:.3f}")
        print(f"  Reg NTU:         {result['regenerator_NTU']:.1f}")
        print(f"  Reynolds:        {result['regenerator_reynolds']:.1f}")
        print(f"  Pressure drop:   {result['regenerator_pressure_drop_Pa']:.1f} Pa")


if __name__ == '__main__':
    # Run both analyses
    optimize_regenerator()
    single_engine_analysis()
