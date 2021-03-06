const { StatusCodes } = require('http-status-codes')
const queryPromise = require('../database/promise')
const { AuthenticationError, BadRequestError, NotFoundError } = require('../errors')
const knexConfig = require('../knexconfig')
const generateId = require('../misc/generate-id')
const knex = require('knex')(knexConfig.development)
const filterUndefined = require('../misc/filter-undefined-in-obj')

const getProducts = async(req, res, next) => {
    if(!req.body.user) {
        throw new AuthenticationError('No User Privilege')
    }
    const {limit, offset, page} = req.body
    const query = knex('MsProduct').select('*').offset(offset).limit(limit)
    const result = await queryPromise(query)
    if(!result[0] && page > 1) {
        throw new Error('Page number is excessive')
    }
    return res.status(StatusCodes.OK).json({
        success: true, 
        page: page, 
        count: result.length, 
        products: result
    })
}

const getProduct = async(req, res, next) => {
    const productID = req.params.productID
    const query = knex('MsProduct').select('*').where({productID: productID})
    const result = await queryPromise(query)
    if(!result[0]) {
        throw new NotFoundError('Product Not Found')
    }
    return res.status(StatusCodes.OK).json({
        success: true, 
        product: result[0]
    })
}

const postProduct = async(req, res, next) => {
    if(!req.body.store) {
        throw new AuthenticationError('No Store Privilege')
    }
    const {productName, price, category, stocks} = req.body
    const {storeID} = req.body.store
    const insertParam = {
        productID: generateId(), 
        productName: productName, 
        storeID: storeID,
        price: price, 
        category: category, 
        stocks: stocks
    }
    const query = knex('MsProduct').insert(insertParam)
    await queryPromise(query)
    return res.status(StatusCodes.CREATED).json({
        success: true, 
        product: insertParam
    })
}

const patchProduct = async(req, res, next) => {
    if(!req.body.store) {
        throw new AuthenticationError('No Store Privilege')
    }
    const {productID, productName, price, category, stocks} = req.body
    const {storeID} = req.body.store
    if(!productID) {
        throw new BadRequestError('ProductID not inserted')
    }
    let updateParam = {
        productName: productName, 
        price: price, 
        category: category,
        stocks: stocks
    }
    updateParam = filterUndefined(updateParam)
    const query = knex('MsProduct').update(updateParam).where({productID: productID, storeID: storeID})
    await queryPromise(query)
    return res.status(StatusCodes.CREATED).json({
        success: true, 
        update: updateParam
    })
}

const deleteProduct = async(req, res, next) => {
    if(!req.body.store) {
        throw new AuthenticationError('No Store Privilege')
    }
    const {productID} = req.body
    const {storeID} = req.body.store
    
    const query = knex('MsProduct').del().where({productID: productID, storeID: storeID})
    const result = await queryPromise(query)
    if(result == 0) {
        throw new NotFoundError('Product with given ID not found')
    }
    return res.status(StatusCodes.OK).json({
        success: true, 
        deletedProductID: productID
    })
}

module.exports = {
    getProducts,
    getProduct, 
    postProduct, 
    patchProduct, 
    deleteProduct
}