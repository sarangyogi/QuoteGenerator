const mongoose=require('mongoose');
const UserSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
        // unique:true
    },
    password:{
        type:String,
        required:true,
    },
    islogin:{
        type:Boolean,
        required:true
    }
})
const User= new mongoose.model("User",UserSchema);
module.exports=User;