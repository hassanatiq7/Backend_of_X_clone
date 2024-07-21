import mongoose from "mongoose";


const mongoConnection = async() =>{
    try {
        const conncetion = await mongoose.connect(process.env.MONGO_DB)
        console.log(`Connected to mongoDB: ${conncetion.connection.host}`)
        
    } catch (error) {
        console.error(`Error connection to mongoDB: ${error.message}`)
        process.exit(1)
    }
}

export default mongoConnection;