import Cart from "../models/cart.model.js";
import Book from "../models/book.model.js"

export const addToCart = async (req, res) => {
    try {
        const { bookId, quantity = 1 } = req.body
        const userId = req.user.id

        const book = await Book.findById(bookId)
        
        if(!book){
            return res.status(400).json({message: "Book not found"})
        }

        let cart = await Cart.findOne({ user: userId })
        
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
            });
        }
        const itemExists = cart?.items.find(item => item.book.toString() === bookId)

        if(itemExists){
            itemExists.quantity += quantity
        }else{
            cart.items.push({book: bookId, quantity, price: book.price})
        }
        
        await cart.save()

        res.status(200).json({
            message: "Book added to cart", 
            data: cart,
            total: calculateTotal(cart.items) 
        })

    }catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({message: "Error adding to cart"})
    }
}

export const getCart = async (req, res) => {
    try {
        const userId = req.user.id
        const cart = await Cart.findOne({ user: userId }).populate("items.book")

        if(!cart){
            return res.status(200).json({
                message: "Cart is empty",
                data: { items: [] },
                total: 0
            })
        }

        res.status(200).json({
            message: "Cart fetched successfully", 
            data: cart,
            total: calculateTotal(cart.items) 
        })
    }catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({message: "Error fetching cart"})
    }
}

export const updateCart = async (req, res) => {
    try {
        const { bookId, quantity } = req.body;
        const userId = req.user.id;

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        const item = cart.items.find(
            item => item.book.toString() === bookId
        );

        if (!item) {
            return res.status(404).json({
                message: "Book not found in cart"
            });
        }

        if (quantity <= 0) {
            cart.items = cart.items.filter(
                item => item.book.toString() !== bookId
            );
        } else {
            item.quantity = quantity;
        }

        await cart.save();

        res.status(200).json({
            message: "Cart updated successfully",
            data: cart,
            total: calculateTotal(cart.items) 
        });

    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({
            message: "Error updating cart"
        });
    }
};

export const removeFromCart = async (req, res) => {
    try{
        const userId = req.user.id
        const { bookId } = req.body

        const cart = await Cart.findOne({ user: userId })

        if(!cart){
            return res.status(400).json({message: "Cart does not exist"})
        }

        cart.items = cart.items.filter((item)=>{
            return item.book.toString() !== bookId
        })

        await cart.save()

        res.status(200).json({
            message: "Item removed from cart",
            data: cart,
            total: calculateTotal(cart.items) 
        });

    }catch(error){
        console.error("Error removing an item from cart:", error);
        res.status(500).json({message: "Error removing an item from cart"})
    }
}

export const clearCart = async (req, res) => {
    try{
        const userId = req.user.id 
        const cart = await Cart.findOne({user: userId})

        if(!cart){
            return res.status(200).json({message: 'You have no item in cart'})
        }

        cart.items = []
        await cart.save()

        res.status(200).json({message: "Cart successfully cleared"})

    }catch(error){
        console.error("Error removing from cart:", error);
        res.status(500).json({message: "Error removing from cart"})
    }
}


const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};