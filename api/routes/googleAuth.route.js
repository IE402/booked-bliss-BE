import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();


function isGoogleLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

router.get('/auth/google',
    passport.authenticate('google', { scope: ['email', 'profile'] })
);



router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/gg/auth/google/failure'
    }),
    (req, res) => {
        const token = req.user.token;
        res.cookie('token', token, { httpOnly: true, secure: false });
        res.redirect('/gg/protected');
    }
);

router.get('/protected', isGoogleLoggedIn, (req, res) => {
    const token = req.cookies.token;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.send(`Xin chào ${decoded.displayName}, bạn đã đăng nhập thành công!`);
    } catch (error) {
        res.status(401).send('Token không hợp lệ hoặc đã hết hạn');
    }
});

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Có lỗi xảy ra khi đăng xuất.');
        }
        res.clearCookie('token');
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Có lỗi xảy ra khi đăng xuất.');
            }
            res.send('Đã đăng xuất và xóa token');
        });
    });
});

router.get('/auth/google/failure', (req, res) => {
    res.send('Xác thực thất bại');
});


export default router;