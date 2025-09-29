import express from "express"
import isAuth from "../middleware/isAuth.js"
import { allOrders, PlaceOrder, PlaceOrderRazorpay, updateStatus, userOrders, verifyRazorpay } from "../controllers/orderController.js"
import adminAuth from "../middleware/adminAuth.js"

const orderRouter = express.Router()


// for User
orderRouter.post("/placeorder" , isAuth , PlaceOrder)
orderRouter.post("/razorpay" , isAuth , PlaceOrderRazorpay)
orderRouter.post("/userorder" , isAuth , userOrders)
orderRouter.post("/verifyrazorpay" , isAuth , verifyRazorpay)

// for Admin
orderRouter.post("/list" , adminAuth , allOrders)
orderRouter.post("/status" , adminAuth , updateStatus)


export default orderRouter