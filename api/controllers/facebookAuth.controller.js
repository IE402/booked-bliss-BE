import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import jwt from 'jsonwebtoken';

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "http://localhost:8800/fb/auth/facebook/callback"
}, function (accessToken, refreshToken, profile, done) {
    try {
        // Tạo JWT token
        const token = jwt.sign({
            id: profile.id,
            displayName: profile.displayName,
            provider: 'facebook'
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        profile.token = token;
        return done(null, profile);
    } catch (err) {
        return done(err, null);
    }
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});
export const facebookAuth = passport.authenticate('facebook');
export const facebookAuthCallback = (req, res, next) => {
    passport.authenticate('facebook', (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user || !user.token) {
            return res.redirect('/fb/login');
        }

        res.cookie('token', user.token, { httpOnly: true, secure: false });
        res.redirect('/fb/protected');
    })(req, res, next);
};

export const logout = (req, res) => {
    req.logout(err => {
        if (err) {
            return res.status(500).send('Có lỗi xảy ra khi đăng xuất.');
        }
        res.clearCookie('token');  // Xóa token
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Có lỗi xảy ra khi hủy session.');
            }
            res.send('Đã đăng xuất và xóa token');
        });
    });
};

export default passport;
