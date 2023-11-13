const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/',async (req,res,next)=>{
    try{
        const results = await db.query('SELECT * FROM industries')
        return res.json({industries: results.rows})
    }catch(e){
        next(e)
    }
})

module.exports = router