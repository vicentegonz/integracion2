const Router = require('koa-router');

const router = new Router({
	prefix: '/data'
});

router.delete('/', async (ctx, next) => {
	// eslint-disable-next-line no-undef
	const f = await ctx.db.Flight.destroy({
		where: {},
		truncate: true
});
	const a = await ctx.db.Airport.destroy({
		where: {},
		truncate: true
	});
    ctx.response.status = 200;
	next();
});

module.exports = router;