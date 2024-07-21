import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { caption } = req.body;
    let { image } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!caption && !image) {
      return res.status(400).json({
        error: "Caption or Image is required",
      });
    }

    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      caption,
      image,
    });

    await newPost.save();

    res.status(200).json({
      message: "Post created successfully",
    });
  } catch (error) {
    console.error(`Error in Create post ${error.message}`);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (post.image) {
      const img = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(img);
    }

    await Post.findByIdAndDelete(postId);
    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(`Error in Delete post ${error.message}`);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { comment } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    

    const post = await Post.findById(postId);

    if (!comment) {
      res.status(400).json({
        error: "Comment is required",
      });
    }

    if (!post) {
      res.status(404).json({
        error: "Post not found",
      });
    }

    const commenText = { user: userId, comment };
    post.comments.push(commenText);
    await post.save();

    res.status(200).json({
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error(`Error in Comment on post ${error.message}`);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const likeAndUnlike = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({
        error: "Post not found",
      });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({_id: userId}, {$pull:{likedPosts: postId}})
      res.status(200).json({
        message: "Post unliked",
      });
    } else {
      post.likes.push(userId);
      await User.updateOne({_id: userId}, {$push:{likedPosts: postId}})
      
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      })

      await notification.save()
      res.status(200).json({
        message: "Post liked",
      })
    }
  } catch (error) {
    console.error(`Error in Like and Unlike ${error.message}`);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getAllPosts = async (req, res) => {
    try {
        const post = await Post.find().sort({createdAt:-1}).populate({
          path:"user",
          select:"-password"
        }).populate({
          path:"comments.user",
          select:"-password"
        })

        if(post.length === 0 ){
            res.status(200).json(
                []
            )
        }

        res.status(200).json(
            post
        )

    } catch (error) {
        console.error(`Error in Get All Post controller ${error.message}`)
        res.status(500).json({
            error:'Internal server error'
        })
    }
}


export const getAllLikedPosts = async (req, res) => {
  try {
    const userId = req.params.id

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password"
      })
      .populate({
        path: "comments.user",
        select: "-password"
      });

    return res.status(200).json({
      likedPosts
    });

  } catch (error) {
    console.error(`Error in Get All Liked Posts controller: ${error.message}`);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};


export const getAllFollowingPosts = async(req, res) =>{
  try {
    
    const userId = req.user._id

    const user = await User.findById(userId)

    if(!user){
      return res.status(404).json({
        error: 'User not found'
      })
    }

    const following = user.following

    const followingPosts = await Post.find({user: {$in: following}}).sort({createdAt:-1}).populate({
      path:"user",
      select:"-password"
    }).populate({
      path:"comments.user",
      select:"-password"
    })

    res.status(200).json(followingPosts)

  } catch (error) {
    console.error(`Error in Get All Following Posts controller ${error.message}`)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
} 


export const userPosts = async(req, res) =>{
  try {
    
    const {userName} = req.params

    const user = await User.findOne({userName})

    if(!user){
      return res.status(404).json({
        error: 'User not found'
      })
    }

    const posts = await Post.find({user: user._id}).sort({createdAt:-1}).populate({
      path:"user",
      select:"-password"
    }).populate({
      path:"comments.user",
      select:"-password"
    })

    res.status(200).json(posts)

  } catch (error) {
    console.error(`Error in User Posts controller ${error.message}`)
    res.status(500).json({
      error: 'Internal server error'
    })
  }
}