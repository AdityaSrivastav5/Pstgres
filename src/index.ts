import {Client} from "pg";

const pgClient = new Client({
    user: 'neondb_owner',
    password: 'npg_Rni4mbdhS0MA',
    port: 5432,
    host: 'ep-crimson-bird-a5n5fgta-pooler.us-east-2.aws.neon.tech',
    database: 'neondb',
    ssl: true,
});

async function main(){
    await pgClient.connect();
    const response = await pgClient.query("SELECT * FROM users;");
    console.log(response);
}

main();