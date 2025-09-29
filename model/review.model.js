import mongoose, { Schema } from "mongoose";

const reviewSchema = new mongoose.Schema({
     product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
},{timestamps:true})

const Review = mongoose.model("Review ", reviewSchema)

export default Review;