const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/',async (req,res,next)=>{
    try{
        const results = await db.query(`SELECT i.code, i.industry,c.name FROM industries AS i
                                        LEFT JOIN ind_comp AS ic ON i.code = ic.ind_code
                                        LEFT JOIN companies AS c on ic.comp_code=c.code`)
        let obj = {};

        for(let r of results.rows){
            let key = r.industry
            if(key in obj){
                obj[key].companies.push(r.name)
            } else{
                obj[key] = {code: r.code, companies:[r.name]}
            }
        }
        return res.json({industries: obj})
    }catch(e){
        next(e)
    }
})

module.exports = router