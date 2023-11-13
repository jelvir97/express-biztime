const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");
const slugify = require('slugify')

router.get('/', async (req,res,next)=>{
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows })
      } catch (e) {
        return next(e);
      }
})

router.get('/:code',async (req,res,next)=>{
    try{
        const { code } = req.params
        const results = await db.query(`SELECT c.code, c.name, c.description, i.industry
                                        FROM companies AS c
                                        LEFT JOIN ind_comp ON c.code = ind_comp.comp_code
                                        LEFT JOIN industries AS i ON ind_comp.ind_code = i.code
                                        WHERE c.code=$1`,[code])

        if(results.rows.length == 0) throw new ExpressError(`Company code ${code} not found`,404)

        const invoices = await db.query(`SELECT * FROM invoices WHERE comp_code=$1`,[code])
        const industries = results.rows.map(r=>r.industry)
        const {name, description} = results.rows[0]
        return res.json({company: {code,name,description,industries, invoices:{...invoices.rows} }})
    }catch(e){
        return next(e)
    }
})

router.post('/', async (req,res,next) =>{
    try{
        const {name, description } = req.body;
        const code = slugify(name, {
          lower: true,
          strict: true
        })
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
        return res.status(201).json({ company: results.rows[0] })
    }catch(e){
        next(e)
    }
})

router.put('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { name, description } = req.body;
      const results = await db.query('UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description', [name, description, code])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't update company with id of ${code}`, 404)
      }
      return res.send({ company: results.rows[0] })
    } catch (e) {
      return next(e)
    }
  })

  router.delete('/:code', async (req, res, next) => {
    try {  
      const {code} = req.params
      const results = db.query('DELETE FROM companies WHERE code = $1', [code])
      return res.send({ status: "DELETED!" })
    } catch (e) {
      return next(e)
    }
  })

module.exports = router;
