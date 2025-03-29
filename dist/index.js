"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
// Add this line to parse JSON request bodies
app.use(express_1.default.json());
const pgClient = new pg_1.Client({
    user: 'neondb_owner',
    password: 'npg_Rni4mbdhS0MA',
    port: 5432,
    host: 'ep-crimson-bird-a5n5fgta-pooler.us-east-2.aws.neon.tech',
    database: 'neondb',
    ssl: true,
});
pgClient.connect();
//Insert Data in the table 
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const city = req.body.city;
    const country = req.body.country;
    const street = req.body.street;
    const pincode = req.body.pincode;
    try {
        const insertQuery = `INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *`;
        const insertResponse = yield pgClient.query(insertQuery, [username, password, email]);
        const userId = insertResponse.rows[0].id;
        const insertAddressQuery = `INSERT INTO addresses (user_id, city, country, street, pincode) VALUES ($1, $2, $3, $4, $5)`;
        const insertAddressResponse = yield pgClient.query(insertAddressQuery, [userId, city, country, street, pincode]);
        res.status(200).send({ message: "User created successfully" });
    }
    catch (error) {
        console.log(error);
        res.status(500).send({ message: "Error creating user" });
    }
}));
//Inserting data but using transaction as we use BEGIN and COMMIT for the transaction process 
app.post("/createUser", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const city = req.body.city;
    const country = req.body.country;
    const street = req.body.street;
    const pincode = req.body.pincode;
    const query = `INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *`;
    const query2 = `INSERT INTO addresses (user_id, city, country, street, pincode) VALUES ($1, $2, $3, $4, $5)`;
    yield pgClient.query("BEGIN;");
    const values = [username, password, email];
    const queryResponse1 = yield pgClient.query(query, values);
    const userId = queryResponse1.rows[0].id;
    const values2 = [userId, city, country, street, pincode];
    const queryResponse2 = yield pgClient.query(query2, values2);
    yield pgClient.query("COMMIT;");
    res.status(200).send({ message: "User created successfully" });
}));
//Without Joins approach but it is more usefull for lager dataset 
app.get("/metadata", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const query = `SELECT id,username,email FROM users WHERE id=$1`;
    const responseQuery = yield pgClient.query(query, [id]);
    const user_id = responseQuery.rows[0].id;
    const query2 = `SELECT city,country,street,pincode FROM addresses WHERE user_id=$1`;
    const responseQuery2 = yield pgClient.query(query2, [user_id]);
    res.status(200).send({ users: responseQuery.rows, addresses: responseQuery2.rows });
}));
//Joins of the table but this is less usefull for lager dataset as it uses n*m complexity to fetch data
app.get("/data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.query.id;
        const query = `
            SELECT u.id, u.username, u.password, u.email, a.city, a.country, a.street, a.pincode 
            FROM users u 
            JOIN addresses a ON u.id = a.user_id
            WHERE u.id = $1
        `;
        const response = yield pgClient.query(query, [id]);
        res.json(response.rows);
    }
    catch (error) {
        console.log(error);
    }
}));
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
