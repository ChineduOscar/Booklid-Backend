import mongoose from 'mongoose';

const authSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }

}, {timestamps: true})
const User = mongoose.model('User', authSchema);

export default User;