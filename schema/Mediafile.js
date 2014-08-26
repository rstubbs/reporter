'use strict';

var versioner = require('./plugins/mongoose-versioner'),
	pagedFind = require('./plugins/pagedFind');

exports = module.exports = function(app, mongo) {
	
	var mediafileSchema = new mongo.Schema({
		_id: { type: String },
		geoLocation: { type: String, default: ''},
		lastCheckedBy: { type: String, default: '' },
		action: { type: Number, default: 0 },
		lifecycle: { type: Number, default: 0 },
		filename: { type: String, default: '' },
		name: { type: String, default: '' },
		actionLog: { type: Array, default: [] }
	});

	mediafileSchema.plugin(pagedFind);
	mediafileSchema.plugin(versioner, {modelName:'Mediafile', mongoose:mongo});
	
	mediafileSchema.index({ pivot: 1 });
	mediafileSchema.index({ name: 1 });
	mediafileSchema.set('autoIndex', (app.get('env') === 'development'));
	
	app.db.model('Mediafile', mediafileSchema);
};
