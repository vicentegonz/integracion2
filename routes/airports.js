const Router = require('koa-router');

const router = new Router({
	prefix: '/airports'
});

function checkParam(data){
    if (data.hasOwnProperty('id')) {
        if (typeof data.id != "string"){
            return {"error": `Invalid type of field id, got ${typeof data.id} expecting ${typeof "string"}`}
        } else {
            if (data.id.length < 3){
                return {"error": "Missing parameter: id"}
            }
        }
    } else {
        return {"error": "Missing parameter: id"}
    }

    if (data.hasOwnProperty('name')) {
        if (typeof data.name != typeof "string"){
            return {"error": `Invalid type of field name, got ${typeof data.name} expecting ${typeof "string"}`}
        }
    } else {
        return {"error": "Missing parameter: name"}
    }

    if (data.hasOwnProperty('country')) {
        if (typeof data.country != typeof "string"){
            return {"error": `Invalid type of field country, got ${typeof data.country} expecting ${typeof "string"}`}
        }
    } else {
        return {"error": "Missing parameter: country"}
    }
    
    if (data.hasOwnProperty('city')) {
        if (typeof data.city != typeof "string"){
            return {"error": `Invalid type of field city, got ${typeof data.city} expecting ${typeof "string"}`}
        }
    } else {
        return {"error": "Missing parameter: city"}
    }
    if (data.hasOwnProperty('position')) {
        if (typeof data.position != typeof {position:{lat: 5, long:2}}){
            return {"error": `Invalid type of field position, got ${typeof data.position} expecting ${typeof {position:{lat: 5, long:2}}}`}
        } else {
            if (data.position.hasOwnProperty('lat')) {
                if (typeof data.position.lat != typeof 39.9667){
                    return {"error": `Invalid type of field lat, got ${typeof data.position.lat} expecting ${typeof 39.9667}`}
                } else {
                    if (data.position.lat > 90 || data.position.lat < -90){
                        return {"error": "Latitude must be between -90 and 90"}
                    }
                }
            } else {
                return {"error": "Missing parameter: lat"}
            }
            if (data.position.hasOwnProperty('long')) {
                if (typeof data.position.long != typeof 39.9667){
                    return {"error": `Invalid type of field long, got ${typeof data.position.long} expecting ${typeof 39.9667}`}
                } else {
                    if (data.position.long > 180 || data.position.long < -180){
                        return {"error": "Longitude must be between -180 and 180"}
                    }
                }
            } else {
                return {"error": "Missing parameter: long"}
            }
        }
    } else {
        return {"error": "Missing parameter: position"}
    }
    return "none"
}

router.get('/', async (ctx, next) => {
	// eslint-disable-next-line no-undef
	try {
		const air = await ctx.db.Airport.findAll({
            attributes: ['id',  'name']
        });
		if (air.length === 0){
			ctx.body = {};
			next();
		} else {
			ctx.body = air;
			next();
		}
	} catch (ValidationError) {
		ctx.throw(404, `${ValidationError}`);
	}
});

router.post('/', async (ctx, next) => {
	// eslint-disable-next-line no-undef
    const fail = checkParam(ctx.request.body)
    if (fail === "none") {
        const del = await ctx.db.Airport.findAll({where: {
            id: ctx.request.body.id
        }});
        if (del.length > 0) {
            ctx.body = {"error": `Airport with id ${ctx.request.body.id} already exists`};
            ctx.response.status = 409;
            next();
        } else {
            const new_air = await ctx.db.Airport.build(ctx.request.body);
		    await new_air.save();
            const air = await ctx.db.Airport.findAll({
                attributes: ['id',  'name', "country", "city", "position"],
                where: {id: ctx.request.body.id}
            });
            ctx.response.status = 201;
            ctx.response.body = air[0];
            next()
        }
    } else {
        ctx.body = fail;
        ctx.response.status = 400;
        next();
    }
});

router.get('/:id', async (ctx, next) => {
	// eslint-disable-next-line no-undef
    const air = await ctx.db.Airport.findAll({
        attributes: ['id',  'name', "country", "city", "position"],
        where: {id: ctx.params.id}
    });
    if (air.length === 0){
        ctx.body = {"error": `Airport with id ${ctx.params.id} not found`};
        ctx.response.status = 404;
        next();
    } else {
        ctx.body = air[0];
        ctx.response.status = 200;
        next();
    }
});

router.patch('/:id', async (ctx, next) => {
	// eslint-disable-next-line no-undef
	const air = await ctx.db.Airport.findAll({
        where: {id: ctx.params.id}
    });
    if (air.length === 0){
        ctx.body = {"error": `Airport with id ${ctx.params.id} not found`};
        ctx.response.status = 404;
        next();
    } else {
        if (typeof ctx.request.body.name === "string"){
            const n_air = {
                "id": air[0].id,
                "name": ctx.request.body.name,
                "country": air[0].country,
                "city": air[0].city,
                "position": air[0].position
            }
            await ctx.db.Airport.update(n_air, {where: {id: ctx.params.id}});
            ctx.response.status = 204;
        } else {
            ctx.body = {"error": "Field name must be a string"};
            ctx.response.status = 400;
            next();
        }
    }
});

router.delete('/:id', async (ctx, next) => {
	// eslint-disable-next-line no-undef
    const del = await ctx.db.Airport.findAll({where: {
        id: ctx.params.id
    }});
    if (del.length === 0) {
        ctx.body = {"error": `Airport with id ${ctx.params.id} not found`};
        ctx.response.status = 404;
        next();
    } else {
        const dep = await ctx.db.Flight.findAll({where: {
            departure: {
                id: ctx.params.id
            }
        }});
        const des = await ctx.db.Flight.findAll({where: {
            destination: {
                id: ctx.params.id
            }
        }});
        if (dep.length > 0 || des.length > 0){
            ctx.body = {"error": `Airport ${ctx.params.id} has flights in progress`};
            ctx.response.status = 409;
            next();
        } else {
            const res = await ctx.db.Airport.destroy({
                where: {
                    id: ctx.params.id
                }
            });
            ctx.response.status = 204
        }
    }
});

module.exports = router;