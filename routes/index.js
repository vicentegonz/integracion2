const Router = require('koa-router');

const router = new Router({
	prefix: '/status'
});

router.get('/index', (ctx, next) => {
	// eslint-disable-next-line no-undef
	ctx.body = process.env.VARIABLE;
	next();
});

router.get('/', (ctx, next) => {
	// eslint-disable-next-line no-undef
	ctx.response.status = 204;
});

module.exports = router;