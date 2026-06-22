import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { email, fullName, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            fullName,
            password: hashedPassword
        });
        const token = jwt.sign({
                id: user._id,
                role: user.role,
                email: user.email,
                fullName: user.fullName
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.status(201).json({ 
            message: 'User registered successfully',
            data: {
                id: user._id,
                role: user.role,
                email: user.email,
                fullName: user.fullName,
            },
            token 
        });    
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const login = async (req, res) => {
    try { 
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({
                id: user._id,
                role: user.role,
                email: user.email,
                fullName: user.fullName
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ 
            message: 'Login successful',
            data: {
                id: user._id,
                email: user.email,
                role: user.role,
                fullName: user.fullName
            },
            token 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};