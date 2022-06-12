const { BadRequestError } = require("../errors")

const login = async(req, res, next) => {
    const {username, password} = req.body
    if(!username || !password) {
        throw new BadRequestError('Username or/and Password not included')
    }
    
}

module.exports = {
    login
}