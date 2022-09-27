const Router = require('koa-router');
const axios = require('axios');

const router = new Router({
	prefix: '/flights'
});

function checkParam(data){
    if (data.hasOwnProperty('id')) {
        // data.media
		if (typeof data.id != typeof "string"){
			return {"error": `Invalid type of field id, got ${typeof data.id} expecting ${typeof "string"}`}
		} else {
			if (data.id.length < 10){
				return {"error": "Missing parameter: id"}
			}
		}
    } else {
        return {"error": "Missing parameter: id"}
    }
    if (data.hasOwnProperty('departure')) {
        if (typeof data.departure != typeof "string"){
			return {"error": `Invalid type of field departure, got ${typeof data.departure} expecting ${typeof "string"}`}
		}
    } else {
        return {"error": "Missing parameter: departure"}
    }
    if (data.hasOwnProperty('destination')) {
        if (typeof data.destination != typeof "string"){
			return {"error": `Invalid type of field destination, got ${typeof data.destination} expecting ${typeof "string"}`}
		}
    } else {
        return {"error": "Missing parameter: destination"}
    }

	if (data.hasOwnProperty('destination') && data.hasOwnProperty('departure')){
		if (data.destination === data.departure){
			return {"error": "Departure and Destination airports must be different"}
		}
	}
    return "none"
}

const requestDist = async (dep, des) => {
	var base = `https://tarea-2.2022-2.tallerdeintegracion.cl/distance?initial=${dep.position.lat},${dep.position.long}
	&final=${des.position.lat},${des.position.long}`
	//var base2 = "https://tarea-2.2022-2.tallerdeintegracion.cl/distance?initial=-33.447487,-70.673676&final=-23.65,-70.4"
	var res = await axios.get(base)
	return res.data
}

router.get('/', async (ctx, next) => {
	// eslint-disable-next-line no-undef
	const f = await ctx.db.Flight.findAll({
		attributes: ["id", "departure", "destination", "total_distance", "traveled_distance", "bearing", "position"]
	});
	if (f.length === 0){
		ctx.body = {};
		next();
	} else {
		ctx.body = f;
		next();
	}
});

router.post('/', async (ctx, next) => {
	// eslint-disable-next-line no-undef
	const fail = checkParam(ctx.request.body)
    if (fail === "none") {
        const old = await ctx.db.Flight.findAll({where: {
            id: ctx.request.body.id
        }});
        if (old.length > 0) {
            ctx.body = {"error": `Flight with id ${ctx.request.body.id} already exists`};
            ctx.response.status = 409;
            next();
        } else {
			const dep = await ctx.db.Airport.findAll({where: {
				id: ctx.request.body.departure
			}});
			const des = await ctx.db.Airport.findAll({where: {
				id: ctx.request.body.destination
			}});
			if (dep.length === 0 || des.length === 0){
				ctx.response.status = 404;
				if (dep.length === 0) {
					ctx.body = {"error": `Airport with id ${ctx.request.body.departure} does not exist`};
					next();
				} else {
					ctx.body = {"error": `Airport with id ${ctx.request.body.destination} does not exist`};
					next();
				}
			} else {
				var api = await requestDist(dep[0], des[0])
				var data = {
					id: ctx.request.body.id,
					departure: {
						id: dep[0].id,
						name: dep[0].name
					},
					destination: {
						id: des[0].id,
						name: des[0].name
					},
					total_distance: api.distance,
					traveled_distance: 0,
					bearing: 0,
					position: {
						lat: dep[0].position.lat,
						long: dep[0].position.long
					}
				}
				const new_f = await ctx.db.Flight.build(data);
				await new_f.save();
				const f = await ctx.db.Flight.findAll({
					attributes: ["id", "departure", "destination", "total_distance", "traveled_distance", "bearing", "position"],
					where: {id: ctx.request.body.id}
				});
				ctx.response.status = 201;
				ctx.response.body = f[0];
				next()
			}
        }
    } else {
        ctx.body = fail;
        ctx.response.status = 400;
        next();
    }
});

router.get('/:id', async (ctx, next) => {
	// eslint-disable-next-line no-undef
	const f = await ctx.db.Flight.findAll({
		attributes: ["id", "departure", "destination", "total_distance", "traveled_distance", "bearing", "position"],
		where: {id: ctx.params.id}
	});
	if (f.length === 0){
		ctx.body = {"error": `Flight with id ${ctx.params.id} not found`};
		ctx.response.status = 404
		next();
	} else {
		ctx.body = f[0];
		next();
	}
});

router.delete('/:id', async (ctx, next) => {
	// eslint-disable-next-line no-undef
	const f = await ctx.db.Flight.findAll({
		where: {id: ctx.params.id}
	});
	if (f.length === 0){
		ctx.body = {"error": `Flight with id ${ctx.params.id} not found`};
		ctx.response.status = 404
		next();
	} else {
		const res = await ctx.db.Flight.destroy({
			where: {
				id: ctx.params.id
			}
		});
		ctx.response.status = 204;
		next();
	}
});

router.post('/:id/position', async (ctx, next) => {
	// eslint-disable-next-line no-undef
	var res = "none";
	if (ctx.request.body.hasOwnProperty('lat')) {
		if (typeof ctx.request.body.lat != typeof 39.9667){
			return {"error": `Invalid type of field lat, got ${typeof ctx.request.body.lat} expecting ${typeof 39.9667}`}
		} else {
			if (ctx.request.body.lat > 90 || ctx.request.body.lat < -90){
				return {"error": "Latitude must be between -90 and 90"}
			}
		}
	}
	if (ctx.request.body.hasOwnProperty('long')) {
		if (typeof ctx.request.body.long != typeof 39.9667){
			return {"error": `Invalid type of field long, got ${typeof ctx.request.body.long} expecting ${typeof 39.9667}`}
		} else {
			if (ctx.request.bodylong > 180 || ctx.request.body.long < -180){
				return {"error": "Longitude must be between -180 and 180"}
			}
		}
	} else {
		res =  {"error": "Missing parameter: long"}
	}
	if (res === "none"){
		const f = await ctx.db.Flight.findAll({
			attributes: ["id", "departure", "destination", "total_distance", "traveled_distance", "bearing", "position"],
			where: {id: ctx.params.id}
		});
		if (f.length === 0){
			ctx.body = {"error": `Flight with id ${ctx.params.id} not found`};
			ctx.response.status = 404
			next();
		} else {
			const initial = await ctx.db.Flight.findAll({
				attributes: ["departure"],
				where: {id: ctx.params.id}
			});
			const initial2 = await ctx.db.Airport.findAll({
				attributes: ["position"],
				where: {id: initial[0].departure.id}
			});
			var data = {
				traveled_distance: 0,
				bearing: 0,
				position:{
					lat: ctx.request.body.lat,
					long: ctx.request.body.long,
				}
			}
			var api_pos = await requestDist(initial2[0], data)
			data.bearing = api_pos.bearing
			data.traveled_distance = api_pos.distance
			await ctx.db.Flight.update(data, {where: {id: ctx.params.id}});
			const f = await ctx.db.Flight.findAll({
				attributes: ["id", "departure", "destination", "total_distance", "traveled_distance", "bearing", "position"],
				where: {id: ctx.params.id}
			});
			ctx.body = f[0];
			next();
		}
	} else {
		ctx.body = res;
		ctx.response.status = 400
		next();
	}
});

module.exports = router;