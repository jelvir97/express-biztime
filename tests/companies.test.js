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

afterAll(async ()=>{
    await db.end();
})

