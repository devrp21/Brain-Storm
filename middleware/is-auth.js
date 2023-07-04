import jwt from 'jsonwebtoken';

export const isAuth = (req, res, next) => {
    const authHeader = req.session.token;

    if (!authHeader) {
        const error = new Error('Not authenticated');
        res.status(401).redirect('/auth/login');
        return;
    }
    
    let decodedToken;
    try {
        decodedToken = jwt.verify(authHeader, 'secret');
    } catch (err) {
        return res.redirect('/');
    }

    if (!decodedToken) {
        const error = new Error('Not Authenticated.');
        res.status(401).redirect('/auth/login');
        return;
    }

    req.userId = decodedToken.userId;
    next();
};
