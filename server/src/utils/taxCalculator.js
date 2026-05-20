// Module 8: Tax Management System - Tax Calculator Utility
const calculateTax = (annualGrossSalary, regime, declarations = {}) => {
    let taxableIncome = annualGrossSalary;

    // 1. Standard Deduction (Applicable to both in recent updates, typically 50k)
    const STANDARD_DEDUCTION = 50000;
    taxableIncome = Math.max(0, taxableIncome - STANDARD_DEDUCTION);

    if (regime === 'Old') {
        // --- Exemption Logic for Old Regime ---

        // HRA Exemption (Simplified)
        // Rule: Min(HRA Received, 50% Basic, Rent Paid - 10% Basic)
        // We need breakdown of Basic/HRA to do this accurately. 
        // For this utility, we'll assume the 'declarations.hraExemption' is passed pre-calculated 
        // OR we ignore complex HRA calc for this step and rely on declared "Exempt Amount".
        // Let's rely on declarations.totalExemptions being passed, or 80C/80D sums.

        let totalDeductions = 0;

        // 80C (Max 1.5L)
        const section80C = declarations.section80C || 0;
        totalDeductions += Math.min(section80C, 150000);

        // 80D (Max 25k/50k - simplified to actual amount declared for demo)
        const section80D = declarations.section80D || 0;
        totalDeductions += section80D;

        // Other Declarations
        totalDeductions += (declarations.other || 0);

        taxableIncome = Math.max(0, taxableIncome - totalDeductions);
    }

    // --- Tax Slabs ---
    let taxAmount = 0;

    if (regime === 'New') {
        // FY 2024-25 New Regime Slabs (Default)
        // 0-3L: Nil
        // 3-7L: 5% (Rebate u/s 87A makes it 0 if taxable <= 7L)
        // 7-10L: 10%
        // 10-12L: 15%
        // 12-15L: 20%
        // >15L: 30%

        if (taxableIncome <= 300000) {
            taxAmount = 0;
        } else if (taxableIncome <= 700000) {
            taxAmount = (taxableIncome - 300000) * 0.05;
            // Rebate u/s 87A: If income <= 7L, tax is 0. 
            // The 5% calculation is technically there but rebated. 
            // Effectively 0 for <= 7L.
            if (taxableIncome <= 700000) taxAmount = 0;
        } else {
            // Above 7L, the rebate is lost (simplified view)
            // 0-3L: 0
            // 3-6L: 3L * 5% = 15000
            // 6-9L: 3L * 10% = 30000 (Wait, slabs are 3,6,9,12,15 now?)
            // Let's use the explicit Interim Budget 2024 slabs usually cited:
            // 0-3: Nil
            // 3-6: 5%
            // 6-9: 10%
            // 9-12: 15%
            // 12-15: 20%
            // >15: 30%

            taxAmount += 0; // First 3L

            // 3L - 6L
            if (taxableIncome > 300000) {
                taxAmount += Math.min(taxableIncome - 300000, 300000) * 0.05;
            }
            // 6L - 9L
            if (taxableIncome > 600000) {
                taxAmount += Math.min(taxableIncome - 600000, 300000) * 0.10;
            }
            // 9L - 12L
            if (taxableIncome > 900000) {
                taxAmount += Math.min(taxableIncome - 900000, 300000) * 0.15;
            }
            // 12L - 15L
            if (taxableIncome > 1200000) {
                taxAmount += Math.min(taxableIncome - 1200000, 300000) * 0.20;
            }
            // > 15L
            if (taxableIncome > 1500000) {
                taxAmount += (taxableIncome - 1500000) * 0.30;
            }
        }

    } else {
        // Old Regime Slbes (Typical)
        // 0-2.5L: Nil
        // 2.5-5L: 5% (Rebate if <= 5L)
        // 5-10L: 20%
        // >10L: 30%

        if (taxableIncome <= 250000) {
            taxAmount = 0;
        } else if (taxableIncome <= 500000) {
            taxAmount = (taxableIncome - 250000) * 0.05;
            if (taxableIncome <= 500000) taxAmount = 0; // Rebate 87A
        } else {
            taxAmount += 12500; // 5% of 2.5L-5L

            // 5L - 10L
            if (taxableIncome > 500000) {
                taxAmount += Math.min(taxableIncome - 500000, 500000) * 0.20;
            }
            // > 10L
            if (taxableIncome > 1000000) {
                taxAmount += (taxableIncome - 1000000) * 0.30;
            }
        }
    }

    // Health and Education Cess (4%)
    taxAmount = taxAmount + (taxAmount * 0.04);

    return Math.round(taxAmount);
};

module.exports = { calculateTax };
