const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const ListSchema = new Schema({
    name :{
        type : String,
        required : [true, 'name is required']
    },
    description :{
        type : String
    },
    mrp :{
        type : Number,
        required : [true, 'MRP is required']
    }
});
const List = mongoose.model('list' , ListSchema);
module.exports = List;