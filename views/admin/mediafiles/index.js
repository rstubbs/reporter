'use strict';

exports.find = function(req, res, next){
	req.query.name = req.query.name ? req.query.name : '';
	req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	req.query.sort = req.query.sort ? req.query.sort : '_id';

	var filters = {};
	if (req.query.name) {
		filters.name = new RegExp('^.*?'+ req.query.name +'.*$', 'i');
	}

	req.app.db.models.Mediafile.pagedFind({
		filters: filters,
		keys: 'name filename lifecycle action lastCheckedBy geoLocation actionLog',
		limit: req.query.limit,
		page: req.query.page,
		sort: req.query.sort
	}, function(err, results) {
		if (err) {
			return next(err);
		}

		if (req.xhr) {
			res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
			results.filters = req.query;
			res.send(results);
		}
		else {
			results.filters = req.query;
			res.render('admin/mediafiles/index', { data: { results: escape(JSON.stringify(results)) } });
		}
	});
};

exports.read = function(req, res, next){
	req.app.db.models.Mediafile.findById(req.params.id).exec(function(err, mediafile) {
		if (err) {
			return next(err);
		}

		if (req.xhr) {
			res.send(mediafile);
		}
		else {
			// send recorded data for this file and send the full lifecycle stages data
			var record = escape(JSON.stringify(mediafile));
			var lifecycles = escape(JSON.stringify(require('../../../lifecycles.json')));

			res.render('admin/mediafiles/details', { data: { record: record , lifecycles: lifecycles } });
		}
	});
};

exports.readActions = function(req, res, next){
	req.app.db.models.Mediafile.findById(req.params.id).exec(function(err, mediafile) {
		if (err) {
			return next(err);
		}

		if (req.xhr) {
			res.send(mediafile);
		}
		else {
			res.render('admin/mediafiles/actions', { data: { record: escape(JSON.stringify(mediafile)) } });
		}
	});
};

exports.create = function(req, res, next){
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.user.roles.admin.isMemberOf('root')) {
			workflow.outcome.errors.push('You may not create mediafiles.');
			return workflow.emit('response');
		}

		if (!req.body.name) {
			workflow.outcome.errors.push('A name is required.');
			return workflow.emit('response');
		}

		workflow.emit('duplicateMediafileCheck');
	});

	workflow.on('duplicateMediafileCheck', function() {
		req.app.db.models.Mediafile.findById(req.app.utility.slugify(req.body.name, req.body.filename)).exec(function(err, mediafile) {
			if (err) {
				return workflow.emit('exception', err);
			}

			if (mediafile) {
				workflow.outcome.errors.push('That name & filename is already taken.');
				return workflow.emit('response');
			}

			workflow.emit('createMediafile');
		});
	});

	workflow.on('createMediafile', function() {
		
		var fieldsToSet = {
			_id: req.app.utility.slugify( req.body.name, req.body.filename ),
			name: req.body.name,
			filename: req.body.filename,
			lifecycle: 1,
			action: 1,
			lastCheckedBy: req.body.lastCheckedBy,
			geoLocation : req.body.geoLocation,
			actionLog : []
		};
		
		req.app.db.models.Mediafile.create(fieldsToSet, function(err, mediafile) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.record = mediafile;
			return workflow.emit('response');
		});
	});

	workflow.emit('validate');
};

exports.update = function(req, res, next){
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.user.roles.admin.isMemberOf('root')) {
			workflow.outcome.errors.push('You may not update mediafiles.');
			return workflow.emit('response');
		}
		
		if (!req.body.name) {
			workflow.outcome.errfor.name = 'required';
			return workflow.emit('response');
		}

		workflow.emit('patchMediafile');
	});

	workflow.on('patchMediafile', function() {
		var fieldsToSet = {
			name: req.body.name,
			lifecycle: req.body.lifecycle,
			action: req.body.action
		};

		req.app.db.models.Mediafile.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, mediafile) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.mediafile = mediafile;
			return workflow.emit('response');
		});
	});

	workflow.emit('validate');
};

exports.delete = function(req, res, next){
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.user.roles.admin.isMemberOf('root')) {
			workflow.outcome.errors.push('You may not delete mediafiles.');
			return workflow.emit('response');
		}

		workflow.emit('deleteMediafile');
	});

	workflow.on('deleteMediafile', function(err) {
		req.app.db.models.Mediafile.findByIdAndRemove(req.params.id, function(err, mediafile) {
			if (err) {
				return workflow.emit('exception', err);
			}
			workflow.emit('response');
		});
	});

	workflow.emit('validate');
};
