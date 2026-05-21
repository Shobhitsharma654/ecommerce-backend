import Order from "../model/order.model.js";
import User from "../model/userModel.js";
import razorpay from "razorpay"
import dotenv from "dotenv"
dotenv.config()

const currency = "inr"
const razorpayInstance = new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET,
})


export const PlaceOrder = async(req ,res)=>{
    try {
        const {items , amount , address }= req.body;
        const userId = req.userId;

        // Check for duplicate orders within 10 seconds with exact matching
        const recentOrder = await Order.findOne({
            userId,
            paymentMethod: "Cash on Delivery",
            amount: amount,
            date: { $gte: new Date(Date.now() - 10000) }
        }).sort({ date: -1 });

        if (recentOrder) {
            // Check if items match exactly
            const itemsMatch = recentOrder.items.length === items.length && 
                recentOrder.items.every((item, idx) => 
                    item._id.toString() === items[idx]._id && 
                    item.quantity === items[idx].quantity && 
                    item.size === items[idx].size
                );

            if (itemsMatch && JSON.stringify(recentOrder.address) === JSON.stringify(address)) {
                return res.status(400).json({message: "This order was already placed. Please wait."})
            }
        }

        const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod:"Cash on Delivery",
            payment:false,
            date: Date.now()
        }

        
        const newOrder = new Order(orderData)
        await newOrder.save()

        await User.findByIdAndUpdate(userId ,{cartData:{}})

        return res.status(201).json({message:"Order Placed", orderId: newOrder._id})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Order placed error"})
    }
}


export const PlaceOrderRazorpay = async(req,res)=>{
    try {
        const {items , amount , address }= req.body;
        const userId = req.userId;

        // Check for duplicate orders within 10 seconds with exact matching
        const recentOrder = await Order.findOne({
            userId,
            paymentMethod: "Razorpay",
            amount: amount,
            payment: false,
            date: { $gte: new Date(Date.now() - 10000) }
        }).sort({ date: -1 });

        if (recentOrder) {
            // Check if items match exactly
            const itemsMatch = recentOrder.items.length === items.length && 
                recentOrder.items.every((item, idx) => 
                    item._id.toString() === items[idx]._id && 
                    item.quantity === items[idx].quantity && 
                    item.size === items[idx].size
                );

            if (itemsMatch && JSON.stringify(recentOrder.address) === JSON.stringify(address)) {
                return res.status(400).json({message: "Order already being processed. Please wait."})
            }
        }

        const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod:"Razorpay",
            payment:false,
            date: Date.now()
        }
        const newOrder = new Order(orderData)
        await newOrder.save()

        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString()
        }

        try {
            const order = await razorpayInstance.orders.create(options)
            return res.status(200).json(order)
        } catch (razorpayError) {
            console.log("Razorpay Error:", razorpayError)
            await Order.findByIdAndDelete(newOrder._id)
            return res.status(500).json({message: "Failed to create Razorpay order", error: razorpayError.message})
        }
    } catch (error) {
        console.log("PlaceOrderRazorpay Error:", error)
        return res.status(500).json({message: error.message})
    }
}



export const verifyRazorpay = async(req,res)=>{
    try {
        const userId = req.userId
        const {razorpay_order_id} = req.body

        if(!razorpay_order_id) {
            return res.status(400).json({message: "Order ID is required"})
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        
        if(orderInfo.status === "paid"){
            await Order.findByIdAndUpdate(orderInfo.receipt, {payment: true})
            await User.findByIdAndUpdate(userId, {cartData: {}})
            return res.status(200).json({success: true, message: "Payment Verified Successfully"})
        } else if(orderInfo.status === "created" || orderInfo.status === "attempted") {
            return res.status(400).json({success: false, message: "Payment not completed. Please try again"})
        } else {
            return res.status(400).json({success: false, message: "Payment Failed"})
        }
    } catch (error) {
        console.log("Verify Razorpay Error:", error)
        return res.status(500).json({success: false, message: "Error verifying payment", error: error.message})
    }
}


export const userOrders = async(req,res)=>{
    try {
        const userId = req.userId;
        const orders =await Order.find({userId})
        console.log({message:"order succesfully "})
        return res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"userOrders error"})
        
    }
}



export const allOrders = async(req,res)=>{
    try {
        const orders = await Order.find({})
        console.log({message:"user orders"})
        res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"AdminAllOrdersb error"})
    }
}

export const updateStatus = async(req,res)=>{
    try {
        const {orderId , status}= req.body;

        await Order.findByIdAndUpdate(orderId , {status})
        return res.status(201).json({message :"Status Updated"})
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}


export const cancelOrder = async(req,res)=>{
    try {
        const userId = req.userId;
        const {orderId} = req.body;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }

        if (order.userId.toString() !== userId.toString()) {
            return res.status(403).json({message: "Unauthorized - This order doesn't belong to you"});
        }

        if (order.status === "Delivered" || order.status === "Cancelled") {
            return res.status(400).json({message: `Order cannot be cancelled - Status: ${order.status}`});
        }


        if (order.paymentMethod === "Razorpay" && order.payment) {
            console.log("Razorpay refund needed for order:", orderId);
        }

        await Order.findByIdAndUpdate(orderId, {status: "Cancelled"});

        return res.status(200).json({success: true, message: "Order cancelled successfully"});

    } catch (error) {
        console.error("Cancel Order Error:", error);
        return res.status(500).json({message: "Error cancelling order", error: error.message});
    }
}