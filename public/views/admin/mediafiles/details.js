/* global app:true */

(function() {
	'use strict';

	app = app || {};

	app.Mediafile = Backbone.Model.extend({
		idAttribute: '_id',
		
		url: function() {
			return '/admin/mediafiles/'+ this.id +'/';
		}
	});

	app.Delete = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			errors: [],
			errfor: {}
		},

		url: function() {
			return '/admin/mediafiles/'+ app.mainView.model.id +'/';
		}
	});

	app.Details = Backbone.Model.extend({
		idAttribute: '_id',
		defaults: {
			success: false,
			errors: [],
			errfor: {},
			name: '',
			lifecycle: 1,
			action: 1
		},

		url: function() {
			return '/admin/mediafiles/'+ app.mainView.model.id +'/';
		},

		parse: function(response) {
			if (response.mediafile) {
				app.mainView.model.set(response.mediafile);
				delete response.mediafile;
			}

			return response;
		}
	});

	app.HeaderView = Backbone.View.extend({
		el: '#header',
		template: _.template( $('#tmpl-header').html() ),

		initialize: function() {
			this.model = app.mainView.model;
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},

		render: function() {
			this.$el.html(this.template( this.model.attributes ));
		}
	});

	app.DetailsView = Backbone.View.extend({
		el: '#details',
		template: _.template( $('#tmpl-details').html() ),
		events: {
			'click .btn-update': 'update',
			'change #lifecycle': 'populateActionList'
		},

		initialize: function() {
			this.model = new app.Details();
			this.syncUp();
			this.listenTo(app.mainView.model, 'change', this.syncUp);
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},

		syncUp: function() {
			this.model.set({
				_id: app.mainView.model.id,
				name: app.mainView.model.get('name'),
				lifecycle: app.mainView.model.get('lifecycle'),
				action: app.mainView.model.get('action')
			});
		},

		render: function() {
			this.$el.html(this.template( this.model.attributes ));

			for (var key in this.model.attributes) {
				if (this.model.attributes.hasOwnProperty(key)) {

					// populate lifecycle dropdown with options
					if (key === 'lifecycle') {
						app.mainView.lifecycles.forEach( this.populateLifecycleList, this );
					}

					// populate action dropdown with options
					else if (key === 'action') {
						this.populateActionList();
					}

					// populate rest of inputs
					else {
						this.$el.find('[name="'+ key +'"]').val(this.model.attributes[key]);
					}
				}
			}
		},

		update: function() {
			this.model.save({
				name: this.$el.find('[name="name"]').val(),
				lifecycle: parseInt(this.$el.find('[name="lifecycle"]').val())+1,
				action: parseInt(this.$el.find('[name="action"]').val())+1
			});
		},

		populateLifecycleList : function(lc, index) {
			var LCdropdown = this.$el.find('[name="lifecycle"]');
			var option = $("<option>").val(index).data('LC', lc).text(lc.desc);
			LCdropdown.append(option);
		},

		populateActionList : function() {
			var LCdropdown = this.$el.find('[name="lifecycle"]');
			var currentLC = LCdropdown.find(":selected").data('LC');
			var actions = currentLC.actions;

			var ACdropdown = this.$el.find('[name="action"]');
			ACdropdown.find('option').remove();

			actions.forEach( function(action, index) {
				var option = $("<option>").val(index).data('AC', action).text(action.desc);
				ACdropdown.append(option);
			});
		}


	});

	app.DeleteView = Backbone.View.extend({
		el: '#delete',
		template: _.template( $('#tmpl-delete').html() ),
		events: {
			'click .btn-delete': 'delete',
		},
		initialize: function() {
			this.model = new app.Delete({ _id: app.mainView.model.id });
			this.listenTo(this.model, 'sync', this.render);
			this.render();
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));
		},
		delete: function() {
			if (confirm('Are you sure?')) {
				this.model.destroy({
					success: function(model, response) {
						if (response.success) {
							location.href = '/admin/mediafiles/';
						}
						else {
							app.deleteView.model.set(response);
						}
					}
				});
			}
		}
	});

	app.MainView = Backbone.View.extend({
		el: '.page .container',
		initialize: function() {
			app.mainView = this;
			this.model = new app.Mediafile( JSON.parse( unescape($('#data-record').html()) ) );
			this.lifecycles = JSON.parse( unescape($('#data-lifecycles').html()) ).lifecycles;

			app.headerView = new app.HeaderView();
			app.detailsView = new app.DetailsView();
			app.deleteView = new app.DeleteView();
		}
	});

	$(document).ready(function() {
		app.mainView = new app.MainView();
	});
}());