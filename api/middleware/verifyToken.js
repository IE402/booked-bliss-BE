// import jwt from "jsonwebtoken"

// export const verifyToken = (req,res,next) => {
//     const token = req.cookies.token;

//     if (!token) return res.status(401).json({ message: "Not Authenticated!" });

//     jwt.verify(token, process.env.JWT_SECRET_KEY || "hvupham",, async (err, payload)=>{
//         if (err) return res.status(401).json({ message: "Token is not Valid!" });
//         req.userId = payload.id;

//         next();
//     });
// }

import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
    // Check both cookie and Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Not Authenticated!" });

    jwt.verify(token, process.env.JWT_SECRET_KEY || "hvupham",async (err, payload) => {
        if (err) return res.status(401).json({ message: "Token is not Valid!" });
        req.userId = payload.id;
        next();
    });
}