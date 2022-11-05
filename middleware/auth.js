const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const token = req.header('Authorization');

    /**
     * check for auth token
     * if token not found return an unauth response
     * if found continue to the next function
     */

    if(!token) {
        return res.status(401).send("unauthenticated");
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        console.log(user);
        req.user = user;

        next();
    } catch(err) {
        res.status(403).send("invalid token");
    }
}