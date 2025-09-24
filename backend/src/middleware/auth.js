const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    // Vérifier le token dans les headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log("Auth middleware: Jeton reçu:", token ? "[Présent]" : "[Absent]");

    if (!token) {
      console.log("Auth middleware: Jeton absent.");
      throw new Error('Jeton d\'authentification manquant');
    }

    // Vérifier et décoder le token
    console.log("Auth middleware: JWT_SECRET pour vérification:", process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware: Jeton décodé:", decoded);

    // Trouver l'administrateur
    const admin = await Admin.findOne({
      _id: decoded.id,
      isActive: true
    });
    console.log("Auth middleware: Admin trouvé:", admin ? admin.username : "[Absent]");

    if (!admin) {
      console.log("Auth middleware: Administrateur non trouvé ou inactif.");
      throw new Error('Administrateur non trouvé ou inactif');
    }

    // Ajouter l'administrateur à la requête
    req.admin = admin;
    req.token = token;
    console.log("Auth middleware: Authentification réussie pour:", admin.username);

    next();
  } catch (error) {
    console.error("Auth middleware: Erreur d\'authentification:", error.message);
    res.status(401).json({
      success: false,
      message: 'Veuillez vous authentifier pour accéder à cette ressource'
    });
  }
};

module.exports = auth; 