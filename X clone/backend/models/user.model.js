import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
    },
    fullName: {
        type: String,
        required: true
    },
    gender:{
        type:String, 
        required: true,
        enum:['male', 'female']
    },
    followers:[{

        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:[]
    }
    ],
    following:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:[]
    }],
    profileImage:{
        type:String,
        default:''
    },
    coverImage:{
        type:String,
        default:''
    },
    bio:{
        type:String,
        default:''
    },
    links:{
        type:String,
        default:'',
    },
    likedPosts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        default:[]
    }]
},{timestamps: true})

const User = mongoose.model("User", userSchema)

export default User;