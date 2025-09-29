import User from "../model/userModel.js"

export const getCurrentUser = async(req,res) =>{
    try {
        const userId = req.userId
        let user = await User.findById(userId).select("-password")

        if(!user){
            return res.status(404).json({message:"user is not found"})
        }

        return res.status(200).json(user)
         
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({message:"getCurrent user error"})
    }
}

export const getAdmin = async(req,res)=>{
    try {
        let adminEmail = req.adminEmail;
        if(!adminEmail){
            return res.status(400).json({message:"Admin is not Found"})
        }
        return res.status(201).json({
            email:adminEmail,
            role:"admin"
        })
    } catch (error) {
         console.log(error.message)
        return res.status(500).json({message:"getadmin  error"})
    }
}