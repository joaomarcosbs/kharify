export default () => ({
  port: parseInt(process.env.PORT || '3080'),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: process.env.JWT_EXPIRES_IN || '7d',
  },
});
