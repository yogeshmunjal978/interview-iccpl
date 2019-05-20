const mongoose = require("mongoose");

const Schema = mongoose.Schema;


const masterSchema = new Schema({
    email:{ type:String, required:true, trim:true, unique:true},
    password:{ type:String, required:true},
    number: {type:Number},
    type: {type:String},
    name:{type:String}
});
module.exports.userModel = mongoose.model("user",masterSchema);
