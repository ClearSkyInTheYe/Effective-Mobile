const jwt = require('jsonwebtoken')
const env = require('dotenv').config().parsed;

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({message: 'Access denied. No token provided'});
    try{
        const decoded = jwt.verify(token, env.SECRET_KEY);
        req.user = decoded
        next();
    } catch(err) {
        res.status(400).json({message: 'Invalid token'});
    }
}

const roleMiddleware = (requiredRole) => (req, res, next) => {
    if (req.user.role !== requiredRole) return res.status(403).json({message: 'Forbidden'});
    next();
}

const ensureUserOrAdmin = (req, res, next) => {
    const targetId = String(req.params.id);
    if (req.user.role == 'admin') return next();
    if (req.user && String(req.user.id) === targetId) return next();
    return res.status(403).json({ message: 'Forbidden' });
}

module.exports = { authMiddleware, roleMiddleware, ensureUserOrAdmin };