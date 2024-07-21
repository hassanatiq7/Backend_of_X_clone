import express from 'express';
import { getme, signIn, signUp, logOut } from '../controllers/auth.controller.js';
import { protectedRoute } from '../middleware/protectedRoute.js';

const router = express.Router()

router.get('/me', protectedRoute, getme)

router.post('/signup', signUp)


router.post('/signin', signIn)


router.post('/logout', logOut)

export default router;