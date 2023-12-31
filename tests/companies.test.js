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

describe('GET /companies/:id route', ()=>{
    test('returns one company with code "abc"',async ()=>{
        const resp = await request(app).get('/companies/abc')

        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({company: { code: 'abc', name: 'ABC', description: 'alphabet', invoices: {}}})
    })

    test('throws error not found with invalid company code', async ()=>{
        const resp = await request(app).get('/companies/acb')
        expect(resp.statusCode).toEqual(404)
        expect(resp.body).toEqual({"error": {"message": "Company code acb not found", "status": 404}})
    })
})

describe('POST /companies route', ()=>{
    test('inserts and returns company', async ()=>{
        const resp = await request(app).post('/companies').send({name:"IBM",code:"ibm",description:"We make stuff"})

        expect(resp.statusCode).toEqual(201)
        expect(resp.body).toEqual({company: {name:"IBM",code:"ibm",description:"We make stuff"}})
    })

    test('fails insert due to invalid request',async ()=>{
        // No handling for this error but tested for internal error
        const resp = await request(app).post('/companies').send({name:"IBM",description:"We make stuff"})
        expect(resp.statusCode).toEqual(500)
    })
})

describe('PUT /companies/:id', ()=>{
    test('updates company with code "abc"',async ()=>{
        const resp = await request(app).put('/companies/abc').send({name:'XYZ', description:"testtest"})

        expect(resp.statusCode).toEqual(200)
        expect(resp.body).toEqual({company: { code: 'abc', name: 'XYZ', description: 'testtest'}})
    })

    test('fails update due to invalid code', async ()=>{
        const resp = await request(app).put('/companies/acb').send({name:'XYZ', description:"testtest"})

        expect(resp.statusCode).toEqual(404)
        expect(resp.body).toEqual({"error": {"message": "Can't update company with id of acb", "status": 404}})
    })
})

describe('DELETE /companies/:id', ()=>{
    test('deletes company with id of abc',async ()=>{
        const resp1 = await request(app).delete('/companies/abc')
        expect(resp1.statusCode).toEqual(200)

        const resp2 = await request(app).get('/companies')

        expect(resp2.body).toEqual({"companies": []})
    })
})

afterAll(async ()=>{
    await db.end();
})