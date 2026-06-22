import User from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        res.status(200).json(user);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { fullName } = req.body;
        if(!fullName){
            return res.status(400).json({message: "Enter your full name"})
        }
        const user = await User.findByIdAndUpdate(req.user.id, { fullName }, { new: true, runValidators: true }).select('-password');
        res.status(200).json(user);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateUserById = async (req, res) => {
    try {
        const { fullName, role } = req.body;
        const { id } = req.params;

        if (req.user.id === id) {
            return res.status(400).json({ message: "You cannot change your own role" });
        }

        const updateData = {};
        if (fullName){
            updateData.fullName = fullName;
        }

        if(role){
            const validRoles = ['admin', 'user'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: `Role must be one of: ${validRoles.join(", ")}` });
            }
            updateData.role = role;
        }

        const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: `User updated`,
            user
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteMe = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Your account has been deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
    try {
        if (req.user.id === req.params.id) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User has been deleted" });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}