import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log(token);

    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);
    req.adminEmail = verifyToken.email;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Admin Auth Error" });
  }
};

export default adminAuth;