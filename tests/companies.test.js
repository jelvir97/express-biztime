process.env.NODE_ENV === "test"

const request = require('supertest')
const app = require('../app')
const db = require('../db')

let test_comp;

beforeEach(async ()=>{
    const result = await db.query(`INSERT INTO
                                    companies (code, name, description)
                                    VALUES ('abc', 'ABC', 'alphabet')
                                    RETURNING code, name, description`)
    test_comp = result.rows[0]

})

afterEach(async()=>{
    await db.query('DELETE FROM companies')
})

describe('GET /companies route', ()=>{
    test('returns list of companies', async ()=>{
        const resp = await request(app).get('/companies')
        expect(resp.body).toEqual({companies: [ { code: 'abc', name: 'ABC', description: 'alphabet' } ]})
        expect(resp.statusCode).toEqual(200)
        expect(resp.body.companies.length).toEqual(1)
    })
})

afterAll(async ()=>{
    await db.end();
})