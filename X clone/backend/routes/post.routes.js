import express from 'express'
import { protectedRoute } from '../middleware/protectedRoute.js';
import { createPost,
     deletePost, 
     commentOnPost, 
     likeAndUnlike, 
     getAllPosts, 
     getAllLikedPosts,
     getAllFollowingPosts,
    userPosts } from '../controllers/post.controller.js';


const router = express.Router()

router.post('/create', protectedRoute, createPost)

router.post('/like/:id', protectedRoute, likeAndUnlike)

router.post('/comment/:id', protectedRoute, commentOnPost)

router.delete('/delete/:id', protectedRoute, deletePost)

router.get('/getposts', protectedRoute, getAllPosts)

router.post('/likes/:id', protectedRoute, getAllLikedPosts)

router.get('/followingPosts' ,protectedRoute, getAllFollowingPosts)

router.get('/userpost/:userName', protectedRoute, userPosts)

export default router;