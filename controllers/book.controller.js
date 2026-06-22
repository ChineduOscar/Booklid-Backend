import Book from "../models/book.model.js";

export const createBook = async (req, res) => {
    try {
        const { title, description, image, author, price, oldPrice, category } = req.body;
        
        const book = await Book.create({ title, description, image, author, price, oldPrice, category });
        res.status(201).json({
            message: 'Book created successfully',
            data: book
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Internal server error' });
    }
};

export const getBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json({
            message: 'Books retrieved successfully',
            data: books
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findById(id);
        if(!book) {
            res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({
            message: 'Book retrieved successfully',
            data: book
        });

    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        if(!body){
            return res.status(400).json({ message: 'Provide the necessary data to update the book' });
        }

        const book = await Book.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if(!book){
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({
            message: 'Book updated successfully',
            data: book
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await Book.findByIdAndDelete(id);
        if(!book){
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({
            message: 'Book deleted successfully',
            data: book
        });
    }catch(error){
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}