var auth = require('./src/auth')


const username = process.env.username
const password = process.env.password

await auth.login(username, password)