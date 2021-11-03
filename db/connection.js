const mongoose=require("mongoose");
require("dotenv").config();
// const dbURL="mongodb+srv://user:easypassword@nodecrash.x5lyq.mongodb.net/QuoteGenerator?retryWrites=true&w=majority";
mongoose.connect(process.env.dbURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    // useCreateIndex:true,
}).then(()=>{
    console.log("Connection successful!");
}).catch((e)=>{
    console.log("connection failed!",e);
});