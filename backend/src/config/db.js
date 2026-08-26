import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
        console.log("Connected to Database Successfully");
        } catch (error) {
            console.error("Error connecting to Database:", error); 
                process.exit(1); // exit with error
        }
    };