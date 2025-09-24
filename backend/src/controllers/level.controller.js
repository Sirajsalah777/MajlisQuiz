const Level = require('../models/Level'); // Import the Level model

// @desc    Get all levels
// @route   GET /api/levels
// @access  Public
const getLevels = async (req, res) => {
  try {
    const levels = await Level.find({}).sort('order'); // Fetch all levels, sorted by order
    res.status(200).json({
      success: true,
      count: levels.length,
      data: levels,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des niveaux',
      error: error.message,
    });
  }
};

// @desc    Create new level
// @route   POST /api/levels
// @access  Private (Admin)
const createLevel = async (req, res) => {
  try {
    const { name, key, description, order } = req.body;

    // Check if a level with the same key or order already exists (for uniqueness)
    const existingLevelByKey = await Level.findOne({ key });
    if (existingLevelByKey) {
      return res.status(400).json({
        success: false,
        message: 'Une clé de niveau similaire existe déjà.',
      });
    }

    const existingLevelByOrder = await Level.findOne({ order });
    if (existingLevelByOrder) {
      return res.status(400).json({
        success: false,
        message: 'Un niveau avec le même ordre existe déjà.',
      });
    }

    const level = await Level.create({ name, key, description, order });
    res.status(201).json({
      success: true,
      data: level,
    });
  } catch (error) {
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du niveau',
      error: error.message,
    });
  }
};

// @desc    Update level
// @route   PUT /api/levels/:id
// @access  Private (Admin)
const updateLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, key, description, order, isActive } = req.body;

    let level = await Level.findById(id);

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Niveau non trouvé',
      });
    }

    // Check for duplicate key or order if they are being changed
    if (key && key !== level.key) {
        const existingLevelByKey = await Level.findOne({ key });
        if (existingLevelByKey && String(existingLevelByKey._id) !== id) {
            return res.status(400).json({
                success: false,
                message: 'Une autre niveau avec cette clé existe déjà.',
            });
        }
    }

    if (order !== undefined && order !== level.order) {
        const existingLevelByOrder = await Level.findOne({ order });
        if (existingLevelByOrder && String(existingLevelByOrder._id) !== id) {
            return res.status(400).json({
                success: false,
                message: 'Un autre niveau avec cet ordre existe déjà.',
            });
        }
    }

    level = await Level.findByIdAndUpdate(
      id,
      { name, key, description, order, isActive },
      {
        new: true, // Return the updated document
        runValidators: true, // Run Mongoose validators
      }
    );

    res.status(200).json({
      success: true,
      data: level,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du niveau',
      error: error.message,
    });
  }
};

// @desc    Delete level
// @route   DELETE /api/levels/:id
// @access  Private (Admin)
const deleteLevel = async (req, res) => {
  try {
    const { id } = req.params;

    const level = await Level.findById(id);

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Niveau non trouvé',
      });
    }

    // Use the .remove() method which triggers the pre('remove') middleware
    await level.remove(); // This will also reorder other levels

    res.status(200).json({
      success: true,
      message: 'Niveau supprimé avec succès',
      data: {}, // No data needed on successful deletion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du niveau',
      error: error.message,
    });
  }
};

module.exports = {
  getLevels,
  createLevel,
  updateLevel,
  deleteLevel,
}; 