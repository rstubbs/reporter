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

	app.HeaderView = Backbone.View.extend({
		el: '#header',
		template: _.template( $('#tmpl-header').html() ),
		initialize: function() {
			this.model = app.mainView.model;
			console.log("mod", this.model.attributes);
			this.listenTo(this.model, 'change', this.render);
			this.render();
		},
		render: function() {
			this.$el.html(this.template( this.model.attributes ));
		}
	});

	app.MainView = Backbone.View.extend({
		el: '.page .container',
		initialize: function() {
			app.mainView = this;
			this.model = new app.Mediafile( JSON.parse( unescape($('#data-record').html()) ) );

			app.headerView = new app.HeaderView();
		}
	});

	$(document).ready(function() {
		app.mainView = new app.MainView();
	});
}());
