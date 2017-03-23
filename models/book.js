var db=require('../db');

module.exports=db.defineModel('book',{
    bookid:{
        type:db.INTEGER,
        autoIncrement:true,
        primaryKey:true
    },
    username:db.STRING(20),
    title:db.STRING(50),
    note:db.TEXT,
})