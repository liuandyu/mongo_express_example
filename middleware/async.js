module.exports = function asyncMiddleware(handler) {
	//return a function defintion
	return async (req, res, next) => {
		try {
			await handler();
		}
		catch(ex) {
			next(ex);
		}
	} 
};