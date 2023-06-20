import bcrypt from 'bcryptjs'
import User from "../model/user.js";
import Post from "../model/post.js";

export const createUser = async (req, res, next) => {
    const username = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.find({ email: email });
    console.log(user);
    if (user[0].email===email) {
        res.send('Already Registered');
    }
    else{
        try {
            const hashedPw = await bcrypt.hash(password, 12);
            const user = new User({
                email: email,
                password: hashedPw,
                name: username
            });
            await user.save();
            res.status(201).json({ message: 'User Created!' })
        } catch (err) {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        }
    
    }

    
}