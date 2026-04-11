export default () => ({
    port: parseInt(process.env.PORT || '3000'),
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expirationTime: process.env.JWT_EXPIRATION || '7d',
    },
});
