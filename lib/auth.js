const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'eee_uofk_jwt_secret_key_2024_secure_random_string';

export function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export function getTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}

export async function requireAuth(req) {
    const token = getTokenFromRequest(req);
    if (!token) {
        throw new Error('Unauthorized');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        throw new Error('Invalid token');
    }

    return decoded;
}
