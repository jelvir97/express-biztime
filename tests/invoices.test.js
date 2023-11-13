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