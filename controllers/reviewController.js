import Product from "../model/productModel.js";
import Review from "../model/review.model.js";
import User from "../model/userModel.js";

export const addReview = async (req, res) => {
  try {
    console.log("👉 Incoming Request Body:", req.body);
    console.log("👉 User ID:", req.userId);

    const { productId, rating, comment } = req.body;
    const userId = req.userId;

    // ❌ Validation
    if (!rating || !comment) {
      console.log("❌ Missing data");
      return res.status(400).json({ message: "Missing data" });
    }

    if (rating < 1 || rating > 5) {
      console.log("❌ Invalid rating:", rating);
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // 🔍 Check user
    const user = await User.findById(userId);
    console.log("👉 User found:", user);

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // 🔍 Check product
    const product = await Product.findById(productId);
    console.log("👉 Product found:", product?._id);

    if (!product) {
      console.log("❌ Product not found");
      return res.status(404).json({ message: "Product not found" });
    }

    // 🔍 Check duplicate review
    const existingReview = await Review.findOne({
      product: productId,
      author: userId
    });

    if (existingReview) {
      console.log("❌ Duplicate review detected");
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }

    // ✅ Create review
    const review = await Review.create({
      comment,
      rating,
      author: userId,
      authorName: user.name,
      product: productId
    });

    console.log("✅ Review created:", review._id);

    // 🔗 Link to product
    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: review._id }
    });

    console.log("✅ Review linked to product");

    return res.status(200).json({
      success: true,
      message: "Review added",
      review
    });

  } catch (err) {
    console.error("🔥 Add Review Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
};




export const getProductReview = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log("👉 Fetching reviews for:", productId);

    const reviews = await Review.find({ product: productId })
      .populate("author", "name")
      .sort({ createdAt: -1 });

    console.log("👉 Reviews found:", reviews.length);

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = reviews.length
      ? Number((totalRating / reviews.length).toFixed(1))
      : 0;

    console.log("👉 Average Rating:", averageRating);

    let ratingText = "Poor";
    if (averageRating >= 4.5) ratingText = "Excellent";
    else if (averageRating >= 4) ratingText = "Very Good";
    else if (averageRating >= 3) ratingText = "Good";
    else if (averageRating >= 2) ratingText = "Average";

    console.log("👉 Rating Text:", ratingText);

    return res.status(200).json({
      success: true,
      reviews,
      averageRating,
      totalReviews: reviews.length,
      ratingText
    });

  } catch (err) {
    console.error("🔥 Fetch Review Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: err.message
    });
  }
};

