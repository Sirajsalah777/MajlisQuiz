const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Générer un token JWT
const generateToken = (id) => {
  console.log("JWT_SECRET (génération):", process.env.JWT_SECRET);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Login administrateur
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier les champs requis
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un nom d\'utilisateur et un mot de passe'
      });
    }

    // Trouver l'administrateur
    const admin = await Admin.findOne({ username });

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Nom d\'utilisateur ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Nom d\'utilisateur ou mot de passe incorrect'
      });
    }

    // Mettre à jour la dernière connexion
    await admin.updateLastLogin();

    // Générer le token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la connexion'
    });
  }
};

// Obtenir le profil de l'administrateur connecté
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    
    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du profil'
    });
  }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Vérifier les champs requis
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir l\'ancien et le nouveau mot de passe'
      });
    }

    const admin = await Admin.findById(req.admin._id);

    // Vérifier l'ancien mot de passe
    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'L\'ancien mot de passe est incorrect'
      });
    }

    // Mettre à jour le mot de passe
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors du changement de mot de passe'
    });
  }
};

module.exports = {
  login,
  getProfile,
  changePassword
}; 