const mongoose=require('mongoose');
const quoteSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    content:{
        type:String,
        required:true,
        unique:true
    },
    author:{
        type:String,
        required:true,
    }
})
const Quote= new mongoose.model("Quote",quoteSchema);
module.exports=Quote;