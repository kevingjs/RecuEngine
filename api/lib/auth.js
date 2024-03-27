export const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	};
	return res.redirect('/ingresar');
};

export const isNotLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		return next();
	};
	return res.redirect('/inicio');
};