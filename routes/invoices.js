const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req,res,next)=>{
    const results = await db.query(`SELECT id, comp_code FROM invoices`)
    return res.json({invoices: results.rows})
})

router.get('/:id', async (req,res,next)=>{
    try{
        const {id} = req.params
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`,[id])
        if(results.rows.length==0)throw new ExpressError(`Could not find invoice with id of ${id}`,404)
        return res.json(results.rows[0])
    }catch(e){
        next(e)
    }

})

router.post('/', async (req,res,next)=>{
    try{
        const { comp_code, amt } = req.body
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', [comp_code,amt])
        return res.status(201).json({invoice: results.rows[0]})
    }catch(e){
        next(e)
    }
})

router.put('/:id', async (req,res,next)=>{
    try{
        const {amt} = req.body
        const{id} = req.params
        let results
        if('paid' in req.body){
            console.log('inside if paid statment')
            const paid = req.body.paid
            console.log(paid)
            const paid_date = paid ? new Date() : null;
            console.log(paid_date)
            results = await db.query(`UPDATE invoices SET amt=$1, paid=$2, paid_date=$3 WHERE id=$4 RETURNING *`,[amt,paid,paid_date,id])
        }else{
            results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING *`,[amt,id])
        }
        console.log(results)
        if(results.rows.length == 0) throw new ExpressError(`Cannot update invoice of id ${id}`,404)
        return res.json({ invoice: results.rows[0]})
    }catch(e){
        next(e)
    }
})

router.delete('/:id', async (req,res,next)=>{
    try{
        const{id} = req.params
        const results = await db.query(`DELETE FROM invoices WHERE id=$1`,[id])
        return res.json({status:'Deleted.'})
    }catch(e){
        next(e)
    }
})



module.exports = router;