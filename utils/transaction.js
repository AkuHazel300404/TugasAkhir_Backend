const db = require ('../config/db');

const withTransaction = async (fn) => {
    const connection = await db.getConnection();
    try{
        await connection.beginTransaction();
        const result = await fn(connection);
        await connection.commit();
        return result;
    }catch(error){
        await connection.rollback().catch(() => {});
        throw error;
    }finally{
        connection.release();
    }
};

module.exports = {withTransaction};