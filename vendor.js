const mongoose=require('mongoose');
require('mongoose-type-email');
var pincode=require('pincode');
const Schema=mongoose.Schema;
const VendorSchema = new Schema({
    name :{
        type : String,
        required : [true, 'Name is required']
    },
    mobile :{
        type : Number,
        required : [true,'Number is Required'],
		unique : true
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
const Vendor=mongoose.model('vendor',VendorSchema);
module.exports=Vendor;