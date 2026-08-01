const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**  
* - user registration controller
* - POST /api/auth/register
*/

async function userRegisterController(req, res) {
    const { email, name, password } = req.body;

    const isUserExists = await userModel.findOne({ email });

    if (isUserExists) {
        return res.status(422).json({
            message: "User already exists",
            status: "failed"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
        email,
        name,
        password: hashedPassword
    });

    const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "3d" }
    );

    res.cookie("token", token);

    res.status(201).json({
        user: {
            _id: newUser._id,
            email: newUser.email,
            name: newUser.name
        },
        token
    });
}


module.exports = { userRegisterController }