const mongoose=require("mongoose");
require("dotenv").config();
mongoose.connect(process.env.dbURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    // useCreateIndex:true,
}).then(()=>{
    console.log("Connection successful!");
}).catch((e)=>{
    console.log("connection failed!",e);
});