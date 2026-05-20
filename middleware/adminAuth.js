import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {

  try {

    const token = req.cookies.token;

    console.log("Cookies:", req.cookies);

    if (!token) {

      return res.status(401).json({
        message: "Not Authorized, Login Again",
      });

    }

    const verifyToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!verifyToken) {

      return res.status(401).json({
        message: "Invalid Token",
      });

    }

    req.adminEmail = process.env.ADMIN_EMAIL;

    next();

  } catch (error) {

    console.log(error.message);

    return res.status(500).json({
      message: "Admin Auth Error",
    });
  }
};

export default adminAuth;