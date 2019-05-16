/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module Address
define('Address.Router'
,	[
		'Address.Edit.View'
	,	'Address.List.View'
	,	'Address.Model'
	,	'Profile.Model'
	,	'Backbone'
	]
,	function (
		AddressEditView
	,	AddressListView
	,	Model
	,	ProfileModel
	,	Backbone
	)
{
	'use strict';

	//@class Address.Router @extend Backbone.Router
	return Backbone.Router.extend({

		routes: {
			'addressbook': 'addressBook'
		,	'addressbook/new': 'newAddress'
		,	'addressbook/:id': 'addressDetailed'
		}

	,	initialize: function (application)
		{
			this.application = application;
			this.profileModel = ProfileModel.getInstance();
		}

		// list profile's addresses
	,	addressBook: function ()
		{

			if (this.profileModel.get('isLoggedIn') !== 'T')
			{
				return this.application.getLayout().notFound();
			}

			var collection = this.profileModel.get('addresses');

			if (collection.length)
			{
				var view = new AddressListView({
					application: this.application
				,	collection: collection
				});

				collection.off(null, null, this);

				collection.on('reset destroy change add', function ()
				{
					var currentView = this.application.getLayout().currentView;

					if (currentView instanceof AddressListView || currentView instanceof AddressEditView)
					{
						this.addressBook();
					}

				}, this);

				view.showContent();
			}
			else
			{
				Backbone.history.navigate('#addressbook/new', {trigger: true});
			}

		}

	// view address's details
	,	addressDetailed: function (id)
		{
			if (this.profileModel.get('isLoggedIn') !== 'T')
			{
				return this.application.getLayout().notFound();
			}

			var collection = this.profileModel.get('addresses')

			,	model = collection.get(id)
			,	view = new AddressEditView({
					application: this.application
				,	collection: collection
				,	model: model
				});

			view.model.on('reset destroy add', function ()
			{
				if (view.inModal && view.$containerModal)
				{
					view.$containerModal.modal('hide');
					view.destroy();
				}
				else
				{
					Backbone.history.navigate('#addressbook', {trigger: true});
				}
			}, view);

			view.showContent();
		}

	// add new address
	,	newAddress: function ()
		{
			if (this.profileModel.get('isLoggedIn') !== 'T')
			{
				return this.application.getLayout().notFound();
			}

			var collection = this.profileModel.get('addresses')

			,	view = new AddressEditView({
					application: this.application
				,	collection: collection
				,	model: new Model()
				});

			collection.on('add', function ()
			{
				if (view.inModal && view.$containerModal)
				{
					view.$containerModal.modal('hide');
					view.destroy();
				}
				else
				{
					Backbone.history.navigate('#addressbook', {trigger: true});
				}
			}, view);

			view.model.on('change', function (model)
			{
				collection.add(model);
			}, this);

			view.showContent();
		}
	});
});
