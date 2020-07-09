const mongoose=require('mongoose');
require('mongoose-type-email');
var pincode=require('pincode');
const Schema=mongoose.Schema;
const UserSchema = new Schema({
    name :{
        type : String,
        required : [true, 'Name is required']
    },
    mobilenumber :{
        type : Number,
        required : [true,'Number is Required'],
		unique : true
    },
    username :{
        type:String,
         required : [true,'Username is required']
    },
    pincode :{
        type:pincode,
		required:[true,'pincode is Required']
	},
	password:{
		type : String,
		required:[true,'password is Required']
    }
});
const User=mongoose.model('user',UserSchema);
module.exports=User;