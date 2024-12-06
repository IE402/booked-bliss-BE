import jwt from "jsonwebtoken"

export const shouldBeLoggedIn = async (req, res) =>{
    console.log(req.userId) //Check the ID of this post if it equal to this ID that means we are owner of that post

    res.status(200).json({ message: "You are Authenticated" });
}

export const shouldBeAdmin = async (req, res) =>{
    const token = req.cookies.token;

    if (!token) return res.status(401).json({ message: "Not Authentiacted!" });

    jwt.verify(token, process.env.JWT_SECRET_KEY || "hvupham", async (err, payload)=>{
        if (err) return res.status(401).json({ message: "Token is not Valid!" });
        if (!payload.isAdmin) {
            return res.status(403).json({ message: "Not Authentiacted!" });
        }
    });

    res.status(200).json({ message: "You are Authenticated" });

}
