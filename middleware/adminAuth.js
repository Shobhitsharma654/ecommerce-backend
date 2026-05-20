import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Check admin credentials
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // Create token
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ADD COOKIE HERE
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      success: true,
      message: "Admin Login Successful",
    });

  } catch (error) {

    console.log(error.message);

    return res.status(500).json({
      message: "Admin Login Error",
    });
  }
};