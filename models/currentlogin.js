const mongoose=require('mongoose');
const currentloginSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    IP:{
        type:String,
        required:true,
    }
},{timestamps:true})
const CurrentLogin= new mongoose.model("CurrentLogin",currentloginSchema);
module.exports=CurrentLogin;