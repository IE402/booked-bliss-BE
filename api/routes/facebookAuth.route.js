import { Router } from 'express';
import jwt from "jsonwebtoken";
import { facebookAuth, facebookAuthCallback, logout } from '../controllers/facebookAuth.controller.js';

const router = Router();

router.get('/auth/facebook', facebookAuth);

router.get('/auth/facebook/callback', facebookAuthCallback);

router.get('/logout', logout);

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
      return res.redirect('fb/login');
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
  } catch (error) {
      res.clearCookie('token');
      return res.redirect('fb/login');
  }
}

  router.get('/protected', isLoggedIn, (req, res) => {
    res.send(`Xin chào ${req.user.displayName}, bạn đã đăng nhập qua Facebook thành công!`);
});
  
  // Route trang login
  router.get('/login', (req, res) => {
    res.send('Vui lòng đăng nhập');
  });

export default router;