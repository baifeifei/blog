var db=require('../db');
module.exports=db.defineModel('user',{
    username:{
        type:db.STRING(20),
        primaryKey:true,
        unique:true
    },
    password:db.STRING(20),
    email:db.STRING(50),
    isvalidate:db.CHAR(1),
})