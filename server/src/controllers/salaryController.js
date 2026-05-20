const SalaryComponent = require('../models/SalaryComponent');
const SalaryStructure = require('../models/SalaryStructure');

// --- Components ---

const createComponent = async (req, res) => {
    const { name, type, calculationType, value, isTaxable } = req.body;
    const component = await SalaryComponent.create({
        organization: req.user.organization,
        name, type, calculationType, value, isTaxable
    });
    res.status(201).json(component);
};

const getComponents = async (req, res) => {
    const components = await SalaryComponent.find({ organization: req.user.organization });
    res.json(components);
};

// --- Structures ---

const createStructure = async (req, res) => {
    const { name, description, components } = req.body;
    const structure = await SalaryStructure.create({
        organization: req.user.organization,
        name, description, components
    });
    res.status(201).json(structure);
};

const getStructures = async (req, res) => {
    const structures = await SalaryStructure.find({ organization: req.user.organization })
        .populate('components.component');
    res.json(structures);
};

const getStructureById = async (req, res) => {
    const structure = await SalaryStructure.findById(req.params.id)
        .populate('components.component');
    res.json(structure);
};


module.exports = { createComponent, getComponents, createStructure, getStructures, getStructureById };
