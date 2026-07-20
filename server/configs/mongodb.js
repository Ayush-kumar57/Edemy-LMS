import mongoose from "mongoose";

// connect to mongodb database

const connectDB = async () => {
    mongoose.connection.on('connected',()=>console.log('Database connected successfully'));

    await mongoose.connect(`${process.env.MONGODB_URI}/LMS`)
}

export default connectDB;