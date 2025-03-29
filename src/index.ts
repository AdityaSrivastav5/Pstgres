import { Client } from "pg";
import express from "express";

const app = express();

// Add this line to parse JSON request bodies
app.use(express.json());

const pgClient = new Client({
    user: 'neondb_owner',
    password: 'npg_Rni4mbdhS0MA',
    port: 5432,
    host: 'ep-crimson-bird-a5n5fgta-pooler.us-east-2.aws.neon.tech',
    database: 'neondb',
    ssl: true,
});

pgClient.connect();

//Insert Data in the table 
app.post("/signup", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const city = req.body.city;
    const country = req.body.country;
    const street = req.body.street;
    const pincode = req.body.pincode;

    try {
        const insertQuery = `INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *`;
        const insertResponse = await pgClient.query(insertQuery, [username, password, email]);
        const userId = insertResponse.rows[0].id;
        const insertAddressQuery = `INSERT INTO addresses (user_id, city, country, street, pincode) VALUES ($1, $2, $3, $4, $5)`;
        const insertAddressResponse = await pgClient.query(insertAddressQuery, [userId, city, country, street, pincode]);
        
        res.status(200).send({ message: "User created successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error creating user"});
    }
});

//Inserting data but using transaction as we use BEGIN and COMMIT for the transaction process 
app.post("/createUser",async (req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const city = req.body.city;
    const country = req.body.country;
    const street = req.body.street;
    const pincode = req.body.pincode;


    const query = `INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *`;
    const query2 = `INSERT INTO addresses (user_id, city, country, street, pincode) VALUES ($1, $2, $3, $4, $5)`;

    await pgClient.query("BEGIN;");
    const values = [username, password, email];
    const queryResponse1 = await pgClient.query(query,values);
    const userId = queryResponse1.rows[0].id;
    
    const values2 = [userId, city, country, street, pincode];
    const queryResponse2 = await pgClient.query(query2,values2);

    await pgClient.query("COMMIT;");

    res.status(200).send({message:"User created successfully"});
})

//Without Joins approach but it is more usefull for lager dataset 
app.get("/metadata",async (req,res)=>{
    const id = req.query.id;
    const query = `SELECT id,username,email FROM users WHERE id=$1`;
    const responseQuery = await pgClient.query(query,[id]);
    const user_id = responseQuery.rows[0].id
    const query2 = `SELECT city,country,street,pincode FROM addresses WHERE user_id=$1`;
    const responseQuery2 = await pgClient.query(query2,[user_id]);
    res.status(200).send({users:responseQuery.rows, addresses:responseQuery2.rows});
})

//Joins of the table but this is less usefull for lager dataset as it uses n*m complexity to fetch data
app.get("/data", async (req, res) => {
    try {
        const id = req.query.id;
        const query = `
            SELECT u.id, u.username, u.password, u.email, a.city, a.country, a.street, a.pincode 
            FROM users u 
            JOIN addresses a ON u.id = a.user_id
            WHERE u.id = $1
        `;
        const response = await pgClient.query(query, [id]);
        res.json(response.rows);
    } catch (error) {
        console.log(error);
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});