import Product from "../model/productModel.js";
import Review from "../model/review.model.js";
import User from "../model/userModel.js";



export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.userId;

    if (!rating || !comment) return res.status(400).json({ message: "Missing data" });

     const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const review = await Review.create({
      comment,
      rating,
      author: userId,
      authorName: user.name,
      product: productId
    });
    console.log(review)

    // Optionally, add review reference to Product
    await Product.findByIdAndUpdate(productId, { $push: { reviews: review._id } });

    res.status(200).json({ message: "Review added", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




export const getProductReview = async(req,res)=>{
     try {
        const { productId } = req.params;
        const reviews = await Review.find({ product: productId }).populate("author", "name")
         .sort({ createdAt: -1 }); 
        

        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = reviews.length ? (totalRating / reviews.length).toFixed(1) : 0;

        let ratingText = "Poor";
        if (averageRating >= 4.5) ratingText = "Excellent";
        else if (averageRating >= 4) ratingText = "Very Good";
        else if (averageRating >= 3) ratingText = "Good";
        else if (averageRating >= 2) ratingText = "Average";

        return res.status(200).json({ reviews, averageRating, ratingText });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
}
