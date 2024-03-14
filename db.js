import { Client } from 'pg';
import jsonData from './index.js';

const client = new Client({
    user: 'database_user',
    host: 'database_host',
    database: 'database_name',
    password: 'database_password',
    port: 'database_port',
});

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');
        const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(255),
            last_name VARCHAR(255),
            age INTEGER,
            address_line1 VARCHAR(255),
            address_line2 VARCHAR(255),
            city VARCHAR(255),
            state VARCHAR(255),
            gender VARCHAR(255)
        )
        `;
        return client.query(createTableQuery);
    })
    .then(() => {
        console.log('Table created successfully')
        const insertQuery = `
        INSERT INTO users (first_name, last_name, age, address_line1, address_line2, city, state, gender)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;
        // Iterate over each record in the JSON data and insert it into the users table
        return Promise.all(jsonData.map(record => {
            const values = [
                record['name.firstName'],
                record['name.lastName'],
                parseInt(record.age),
                record['address.line1'],
                record['address.line2'],
                record['address.city'],
                record['address.state'],
                record.gender
            ];
            return client.query(insertQuery, values);
        }));
    })
    .then(() => {
        console.log('Data inserted successfully');
        // Fetch age data from the database
        return client.query('SELECT age FROM users');
    })
    .then(result => {
        const ages = result.rows.map(row => row.age);

        // Calculate age distribution
        const ageDistribution = calculateAgeDistribution(ages);

        // Print age-group percentage distribution on the console
        console.log('Age-Group % Distribution');
        Object.entries(ageDistribution).forEach(([ageGroup, percentage]) => {
            console.log(`${ageGroup} ${percentage}`);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    })
    .finally(() => {
        // Close the database connection
        client.end();
    });

function calculateAgeDistribution(ages) {
    // Initialize counts for each age group
    const ageDistribution = {
        '< 20': 0,
        '20 to 40': 0,
        '> 40': 0,
    };

    ages.forEach(age => {
        if (age < 20) {
            ageDistribution['< 20']++;
        } else if (age >= 20 && age <= 40) {
            ageDistribution['20 to 40']++;
        } else {
            ageDistribution['> 40']++;
        }
    });

    // Calculate percentages
    const totalUsers = ages.length;
    Object.entries(ageDistribution).forEach(([ageGroup, count]) => {
        ageDistribution[ageGroup] = ((count / totalUsers) * 100).toFixed(2);
    });

    return ageDistribution;
}
