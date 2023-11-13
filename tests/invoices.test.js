process.env.NODE_ENV === "test"

const request = require('supertest')
const app = require('../app')
const db = require('../db')

let test_comp;
let test_inv;

beforeEach(async ()=>{
    const result = await db.query(`INSERT INTO
                                    companies (code, name, description)
                                    VALUES ('abc', 'ABC', 'alphabet')
                                    RETURNING code, name, description`)

    test_comp = result.rows[0]

    const invoice = await db.query(`INSERT INTO
                                    invoices ( comp_code, amt )
                                    VALUES ('abc',4.50)
                                    RETURNING id, comp_code, amt `)

    test_inv = invoice.rows[0]

})

afterEach(async()=>{
    await db.query('DELETE FROM companies')
    await db.query('DELETE FROM invoices')
})

afterAll(async ()=>{
    await db.end();
})

describe('GET /invoices', ()=>{
    test('returns list of invoices', async ()=>{
        const resp = await request(app).get('/invoices')

        expect(resp.body).toEqual({invoices: [{id:test_inv.id,comp_code:'abc'}]})
        expect(resp.statusCode).toEqual(200)
    })
})

describe('GET /invoices/:id',()=>{
    test('returns single invoice based off of id', async ()=>{
        const resp = await request(app).get(`/invoices/${test_inv.id}`)

        expect(resp.statusCode).toEqual(200)
        expect(resp.body.amt).toEqual(test_inv.amt)
        expect(resp.body.comp_code).toEqual(test_inv.comp_code)
    })

    test('fails to return due to invalid id',async ()=>{
        const resp = await request(app).get('/invoices/999')

        expect(resp.statusCode).toEqual(404)
        expect(resp.body).toEqual({"error": {"message": "Could not find invoice with id of 999", "status": 404}})
    })
})

describe('POST /invoices', ()=>{
    test('returns created invoice',async ()=>{
        const resp = await request(app).post('/invoices').send({comp_code:'abc',amt:1.99})

        expect(resp.statusCode).toEqual(201)
        expect(resp.body.invoice.comp_code).toEqual('abc')
        expect(resp.body.invoice.amt).toEqual(1.99)
    })

    test('fails with invalid comp code',async ()=>{
        const resp = await request(app).post('/invoices').send({comp_code:'xyz',amt:1.99})
        expect(resp.statusCode).toEqual(500)
    })

    test('fails with no amt', async ()=>{
        const resp = await request(app).post('/invoices').send({comp_code:'abc'})
        expect(resp.statusCode).toEqual(500)
    })
})

describe('PUT /invoices/:id', ()=>{
    test('updates existing invoice',async ()=>{
        const resp = await request(app).put(`/invoices/${test_inv.id}`).send({amt: .5})

        expect(resp.statusCode).toEqual(200)
        expect(resp.body.invoice.amt).toEqual(.5)
        expect(resp.body.invoice.comp_code).toEqual('abc')
    })

    test('fails with invalid id', async ()=>{
        const resp = await request(app).put(`/invoices/999`).send({amt: .5})

        expect(resp.statusCode).toEqual(404)
        expect(resp.body).toEqual({error:{message:'Cannot update invoice of id 999',status:404}})
    })
})

describe('DELETE /invoices/:id',()=>{
    test('deletes invoice', async()=>{
        const resp = await request(app).delete(`/invoices/${test_inv.id}`)

        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({status:'Deleted.'})
    })
})

