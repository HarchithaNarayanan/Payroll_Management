const Statutory = require('../models/Statutory');

// @desc    Get statutory config for auth user's org
// @route   GET /api/statutory
// @access  Private (Admin)
const getStatutoryConfig = async (req, res) => {
    try {
        const config = await Statutory.findOne({ organization: req.user.organization });

        const defaults = {
            pf: { enabled: true, employerContribution: 12, employeeContribution: 12, wageLimit: 15000, adminCharges: 0.5, edliCharges: 0.5 },
            esi: { enabled: true, employerContribution: 3.25, employeeContribution: 0.75, wageLimit: 21000 },
            professionalTax: { enabled: false, slabs: [] }
        };

        if (config) {
            // Merge defaults with existing config
            const mergedConfig = {
                ...defaults,
                ...config.toObject(),
                pf: { ...defaults.pf, ...(config.pf || {}) },
                esi: { ...defaults.esi, ...(config.esi || {}) },
                professionalTax: { ...defaults.professionalTax, ...(config.professionalTax || {}) }
            };
            res.json(mergedConfig);
        } else {
            res.json(defaults);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update statutory config
// @route   PUT /api/statutory
// @access  Private (Admin)
const updateStatutoryConfig = async (req, res) => {
    const { pf, esi, professionalTax } = req.body;

    let config = await Statutory.findOne({ organization: req.user.organization });

    if (config) {
        config.pf = pf || config.pf;
        config.esi = esi || config.esi;
        config.professionalTax = professionalTax || config.professionalTax;

        const updatedConfig = await config.save();
        res.json(updatedConfig);
    } else {
        const newConfig = await Statutory.create({
            organization: req.user.organization,
            pf,
            esi,
            professionalTax
        });
        res.status(201).json(newConfig);
    }
};

module.exports = { getStatutoryConfig, updateStatutoryConfig };
