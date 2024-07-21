import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signUp = async (req, res) => {

try {

    const { userName, fullName, email, password, gender} = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!userName || !fullName || !email || !password || !gender) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    
    if(!emailRegex.test(email)){
        return res.status(400).json({
            error:'Invalid Email'
        })
    }

    const userExist = await User.findOne({userName});
    if(userExist){
        return res.status(400).json({
            error:'User already exist'
        })
    }


    const emailExist = await User.findOne({email})
    if(emailExist){
        return res.status(400).json({
            error:'Email already exists'
        })
    }

    if(password.length < 8){
        return res.status(400).json({
            error:'Password must be at least 8 characters'
        })
    }

    
    const salt = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hash(password, salt)
    
    const newUser = new User({
        userName,
        fullName,
        email,
        password:  hashedpassword,
        gender,
    })

    if(newUser){
        generateTokenAndSetCookie(newUser._id, res)
        await newUser.save()
        res.status(201).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            userName: newUser.userName,
            email: newUser.email,
            gender: newUser.gender,
            followers: newUser.followers,
            following: newUser.following,
            profileImage: newUser.profileImage,
            coverImage: newUser.coverImage,
            bio: newUser.bio,
            links: newUser.links,
        })
    }

    else{
        res.status(400).json({
            message:'Invalid Data',
            error: error.message
        })
    }

} catch (error) {

    console.error(`Error in sign Up controller ${error}`)
    res.status(500).json({
        error: 'Internal server error'
    })
    
}
}

export const signIn = async (req, res) => {

  try {

    const { userName, password} = req.body;
    const user = await User.findOne({ userName })
    const isPasswordValid = await bcrypt.compare(password, user?.password || "")
    
    if(!user || !isPasswordValid){
        return res.status(400).json({
            error:'Invalid Credentials'
        })
    }

    generateTokenAndSetCookie(user._id, res)

    res.status(200).json({
        _id: user._id,
        fullName: user.fullName,
        userName: user.userName,
        email: user.email,
        gender: user.gender,
        followers: user.followers,
        following: user.following,
        profileImage: user.profileImage,
        coverImage: user.coverImage,
        bio: user.bio,
        links: user.links,
    })
  } catch (error) {

    
    console.error(`Error in Sign in controller ${error}`)
    res.status(500).json({
        error: 'Internal server error'
    })
    
  }
}


export const logOut = async (req, res) => {

try {
    res.cookie("jwt", "",{maxAge:0})
    res.status(200).json({
        message: 'Logged out successfully'
    })
} catch (error) {

    console.error(`Error in Log out controller ${error}`)
    res.status(500).json({
        error: 'Internal server error'
    })
    
}

}


export const getme = async(req, res) =>{
    try {
        const userId = req.user._id
        const user = await User.findById(userId).select("-password")
        res.status(200).json({user})
            
    } catch (error) {
        console.error(`Error in getme controller ${error}`)
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}