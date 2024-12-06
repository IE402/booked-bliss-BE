import dotenv from 'dotenv';  // Import dotenv
dotenv.config();  // Nạp các biến môi trường từ tệp .env

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import jwt from 'jsonwebtoken';

// Log các biến môi trường
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
console.log('FACEBOOK_CLIENT_ID:', process.env.FACEBOOK_CLIENT_ID);
console.log('FACEBOOK_CLIENT_SECRET:', process.env.FACEBOOK_CLIENT_SECRET);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8800/gg/auth/google/callback",
    passReqToCallback: true,
}, (request, accessToken, refreshToken, profile, done) => {
    const token = jwt.sign({
        id: profile.id,
        email: profile.email,
        displayName: profile.displayName
    }, process.env.JWT_SECRET, { expiresIn: '1h' });

    profile.token = token;
    return done(null, profile);
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

export default passport;
