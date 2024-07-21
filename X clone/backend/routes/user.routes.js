import express from 'express'
import { protectedRoute } from '../middleware/protectedRoute.js';
import { getUserProfile, followAndUnfollow, getSuggestedUser, updateUser } from '../controllers/user.controller.js';

const router = express.Router()

router.get('/profile/:userName', protectedRoute,getUserProfile)

router.post('/follow/:id', protectedRoute, followAndUnfollow);

router.get('/suggest', protectedRoute, getSuggestedUser)

router.post('/update', protectedRoute, updateUser)


export default router;