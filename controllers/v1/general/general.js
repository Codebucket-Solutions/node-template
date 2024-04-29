const { General } = require("@service/v1")

const createApi = async (req, res, next) => {
  try {
    const data = (new General()).createApi()
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createApi,
};
