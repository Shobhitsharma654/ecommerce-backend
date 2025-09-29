import express from "express"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/authRoutes.js"
dotenv.config()
import cors from "cors";
import userRoutes from "./routes/userRoutes.js"
import ProductRouter from "./routes/productRoutes.js"
import cartRouter from "./routes/cartRoutes.js"
import orderRouter from "./routes/orderRoutes.js"
import Reviewrouter from "./routes/reviewRoutes.js"

const port=process.env.PORT || 4000
const app=express()
connectDB();

app.use(cors({
    origin:["http://localhost:5173" ,"http://localhost:5174"],
    credentials:true,
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",authRouter)
app.use("/api/user" , userRoutes)
app.use("/api/product" , ProductRouter)
app.use("/api/cart", cartRouter)
app.use("/api/order", orderRouter)
app.use("/api/review" , Reviewrouter)

app.get("/", (req, res) => {
    res.send("api is working")
})


app.listen(port , ()=>{
    console.log(`Server is live on port:${port}`)
})