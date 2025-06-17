import User from "../models/User.js"
import jwt from "jsonwebtoken"


//midle ware to protect routes
export const protectRoute = async (req,res,next) =>{
    try {
        const token = req.headers.token;
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select("-password")
        if(!user){
            res.json({success:false,message:"Không tìm thấy tài khoản"})
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error.message);
        
        res.json({success:false,message:error.message})

    }

    // controller to heck ì user í authenticated
}
export const checkAuth = (req,res) =>{
    res.json({success:true,user:req.user})
}

