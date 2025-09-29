import jwt from "jsonwebtoken"

const adminAuth = async(req,res,next)=>{

    try {
        
        let {token}= req.cookies
         console.log("Cookies:", req.cookies);
        
        if(!token){
            return res.status(400).json({message:"Not Authorized login Again"})
    }

    let verifyToken =  jwt.verify(token, process.env.JWT_SECRET)

    if(!verifyToken){
        return res.status(400).json({message:"Not Authorized lOGIN aGAIN , Invalid token"})
    }
    req.adminEmail = process.env.ADMIN_EMAIL
    next()
    
        } catch (error) {
            console.log("Admin auth error")
            return res.status(500).json({message:"admin auth error"})
        }
}

export default adminAuth