import express from "express"
import { addReview, getProductReview } from "../controllers/reviewController.js";
import isAuth from "../middleware/isAuth.js";

const Reviewrouter = express.Router()

Reviewrouter.post("/add",isAuth, addReview);
Reviewrouter.get("/:productId", isAuth, getProductReview);

export default Reviewrouter