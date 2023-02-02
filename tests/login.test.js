var auth = require("../src/auth");

username = process.env.username;
password = process.env.password;

test('login method returns a string token', async () => {
  const token = await auth.login(username, password)
  expect(typeof token).toBe("string")
})