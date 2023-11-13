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


router.post('/',async (req,res,next)=>{
    try{
        const {code,industry} = req.body
        console.log(req.body)
        const results = await db.query('INSERT INTO industries VALUES ( $1 , $2 ) RETURNING *',[code,industry])

        return res.json(results.rows[0])
    }catch(e){
        next(e)
    }
})

router.post('/:ind_code',async (req,res,next)=>{
    try{
        const {ind_code} = req.params
        const {comp_code} = req.body

        const results = await db.query('INSERT INTO ind_comp (ind_code, comp_code) VALUES ( $1, $2 ) RETURNING * ',[ind_code,comp_code])

        return res.json(results.rows[0])

    }catch(e){
        next(e)
    }
})

module.exports = router