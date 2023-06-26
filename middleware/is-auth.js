import jwt from 'jsonwebtoken';

export const isAuth = (req, res, next) => {
<<<<<<< HEAD
    const authHeader = req.session.token
    
=======
    const authHeader = req.get('Authorization');
    console.log(authHeader);
>>>>>>> e16239878b8cc0b7e0f37f3aa02c7876eef757df
    if (!authHeader) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        res.redirect('/auth/login');
    }
    
    let decodedToken;
    try {
        // Here 'secret' will be which you have set it on the jwt token secret key
        decodedToken = jwt.verify(authHeader, 'secret');
    }
    catch (err) {
        err.statusCode = 500;
        res.redirect('/auth/login');
    }

    if (!decodedToken) {
        const error = new Error('Not Authenticated.');
        error.statusCode = 401;
         res.redirect('/auth/login');
    }

    req.userId = decodedToken.userId;
    next();
}