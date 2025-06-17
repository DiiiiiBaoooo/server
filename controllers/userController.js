import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"

// sigunup new ủe
export const signup = async (req,res) =>{
    const { fullName, email, password, bio} = req.body;
    try {
        if(!fullName || !email || !password || !bio)
        {
            return res.json({success:false,message:"Thiếu thông tin"})
        }

        const user = await User.findOne({email});
        if(user)
        {
            return res.json({success:false,message:"Email đã tồn tại"})

        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password,salt);
        const newUser = await User.create({
            fullName, email, password:hashedPassword,bio
        });
        const token = generateToken(newUser._id)

        res.json({success:true,userData: newUser, token, message:"Đăng ký tài khoản thành công!"})


    } catch (error) {
        console.log(error.message);
                res.json({success:false, message:error.message})

    }
}
// controller to login
export const login = async (req,res) =>{
    try {
        const {  email, password } = req.body;
        const userData = await User.findOne({email})
        const isPasswordCorrect = await bcrypt.compare(password,userData.password);
        if(!isPasswordCorrect){
            res.json({success:false, message:"Mật khẩu không đúng"})

        }
        const token = generateToken(userData._id)

        res.json({success:true,userData: userData, token, message:"Đăng nhập thành công!"})



    } catch (error) {
        console.log(error.message);
        res.json({success:false, message:error.message})
    }
}

// controller update user profile
export const updateProfile = async (req, res) => {
    try {
      const { profilePic, bio, fullName } = req.body; // Use object destructuring
      const userId = req.user._id;
      let updatedUser;
  
      if (!profilePic) {
        updatedUser = await User.findByIdAndUpdate(
          userId,
          { bio, fullName },
          { new: true }
        );
      } else {
        const upload = await cloudinary.uploader.upload(profilePic);
        updatedUser = await User.findByIdAndUpdate(
          userId,
          { profilePic: upload.secure_url, bio, fullName },
          { new: true }
        );
      }
  
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message });
    }
  };