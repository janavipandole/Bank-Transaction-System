const monoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new monoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required for creating a user"],
        unique: [true, "Email already exists"],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please fill a valid email address"],
    },
    name: {
        type: String,
        required: [true, "Name is required for creating a user"]
    },
    password: {
        type: String,
        required: [true, "Password is required for creating a user"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return;
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return;
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const User = monoose.model("User", userSchema);

module.exports = User;