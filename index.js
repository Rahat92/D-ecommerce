const express = require('express');
const mssql = require('mssql');

const app = express()
const config = {
    driver: 'msnodesqlv8',
    server:'192.168.1.105',
    database:'Ecommerce',
    user:'sa',
    password:'@dm1n321#',
    options:{
        encrypt:false,
        enableArithAbort:false
    }
}

const pool = new mssql.ConnectionPool(config);


app.get('/:id', async(req,res) => {
    try{
        await pool.connect();
        // const result = await pool.request().query(`select product.productId, product.productName,customers.customerId,customers.customerName,customers.email, review.review, review.rating from product
        // inner join review on review.productId = product.productId
        // INNER JOIN customers ON review.customerId = customers.customerId
        // where product.productId =2`)
        const reqId = req.params.id;
        const result = await pool.request().input('productId', reqId).execute(`sp_get_single_product`)
        console.log(result.recordset)
        const fResult = [];
        result.recordset.forEach((item) => {
            const index = fResult.findIndex(el => el.productId === item.productId)
            if(index!==-1){
                const obj = {...fResult[index]};
                fResult[index] = {...obj, reviews: [
                    ...obj.reviews, {
                        customerId: item.customerId,
                        customer:item.customerName,
                        review:item.review,
                        rating:item.rating
                    }
                ]}
            }else {
                fResult.push({...item, reviews: [
                    {
                        customerId: item.customerId,
                        customer:item.customerName,
                        review:item.review,
                        rating:item.rating
                    }
                ]})
            }
        })
        delete fResult[0].review;
        delete fResult[0].rating;
        delete fResult[0].customerName;
        delete fResult[0].customerId;
        delete fResult[0].email;
        res.status(200).json({
            status:'success',
            data:{
                product:fResult
            }                
        })
    }catch(err){
        console.log(err)
    }
})

app.listen(3000, () => {
    console.log('Server is running on port 3000')
})