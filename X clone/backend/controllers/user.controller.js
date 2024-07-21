import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

import bcrypt from 'bcryptjs'
import {v2 as cloudinary} from 'cloudinary'

export const getUserProfile = async (req, res) => {
  const { userName } = req.params;

  try {
    const user = await User.findOne({ userName }).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(`Error in getUserProfile ${error}`);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const followAndUnfollow = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      res.status(400).json({
        error: "You cannot follow yourself",
      });
    }
    if (!userToModify || !currentUser) {
      res.status(400).json({
        error: "User not found",
      });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //Unfollow the User
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({
        message: "User is Unfollowed",
      });
    } else {
      //Follow the User
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });

      await newNotification.save();

      res.status(200).json({
        message: "User is Followed",
      });
    }
  } catch (error) {
    console.error(`Error in followAndUnfollow ${error}`);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const userFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: {
            $ne: userId,
          },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.error(`Error in getSuggestedUsers ${error}`);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};



export const updateUser = async (req, res) => {
  const { userName, fullName, email, newPassword, currentPassword, bio, links } = req.body;
  let { profileImage, coverImage } = req.body;
  const userId = req.user._id;

  console.log('Request body:', req.body); // Log request body for debugging
  console.log('User ID:', userId); // Log user ID for debugging

  if (!userId) {
    return res.status(400).json({
      error: 'User ID is required'
    });
  }

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    if ((currentPassword && !newPassword) || (newPassword && !currentPassword)) {
      return res.status(400).json({
        error: "Please provide both current password and new password"
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          error: "Current password is incorrect"
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          error: "New password should be at least 8 characters long"
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImage) {
      if (user.profileImage) {
        await cloudinary.uploader.destroy(user.profileImage.split('/').pop().split('.')[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImage);
      profileImage = uploadedResponse.secure_url;
    }

    if (coverImage) {
      if (user.coverImage) {
        await cloudinary.uploader.destroy(user.coverImage.split('/').pop().split('.')[0]);
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImage);
      coverImage = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.userName = userName || user.userName;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.links = links || user.links;
    user.profileImage = profileImage || user.profileImage;
    user.coverImage = coverImage || user.coverImage;

    await user.save();

    user.password = null;
    res.status(200).json({
      message: "User updated successfully",
      
    });

  } catch (error) {
    console.error(`Error in updateUser: ${error.message}`); // Log detailed error message
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
