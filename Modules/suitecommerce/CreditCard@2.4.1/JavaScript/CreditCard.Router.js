/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module CreditCard
define('CreditCard.Router'
,	[	'CreditCard.Edit.View'
	,	'CreditCard.List.View'
	,	'CreditCard.Model'
	,	'Profile.Model'
	,	'Backbone'
	]
,	function (
		CreditCardEditView
	,	CreditCardListView
	,	Model
	,	ProfileModel
	,	Backbone
	)
{
	'use strict';

	// @class CreditCard.Router Router for handling credit cards (CRUD) @extends Backbone.Router
	return Backbone.Router.extend({

		routes: {
			'creditcards': 'creditCards'
		,	'creditcards/new': 'newCreditCard'
		,	'creditcards/:id': 'creditCardDetailed'
		}

	,	initialize: function (application)
		{
			this.application = application;
			this.profileModel = ProfileModel.getInstance();
		}

		// @method creditCards dispatch the 'creditcards list' route
	,	creditCards: function ()
		{
			if (this.profileModel.get('isLoggedIn') !== 'T')
			{
				return this.application.getLayout().notFound();
			}

			var collection = this.profileModel.get('creditcards');

			if (collection.length)
			{
				var view = new CreditCardListView({
					application: this.application
				,	collection: collection
				});

				collection.once('reset destroy change add', function ()
				{
					// Only render this view again if it is the 'creditcards', otherwise it will render it but it will not change the url hash
					if (Backbone.history.fragment === 'creditcards')
					{
						this.creditCards();
					}
				}, this);

				view.showContent();
			}
			else
			{
				Backbone.history.navigate('#creditcards/new', { trigger: true });
			}
		}

		// @method creditCardDetailed Dispatch the 'view credit card details' route @param {String} id
	,	creditCardDetailed: function (id)
		{
			if (this.profileModel.get('isLoggedIn') !== 'T')
			{
				return this.application.getLayout().notFound();
			}

			var collection = this.profileModel.get('creditcards')
			,	model = collection.get(id)
			,	view = new CreditCardEditView({
					application: this.application
				,	isCreditCardCollectionEmpty: collection.length === 0
				,	model: model
				});

			model.on('reset destroy change add', function ()
			{
				if (view.inModal && view.$containerModal)
				{
					view.$containerModal.modal('hide');
					view.destroy();
				}
				else
				{
					Backbone.history.navigate('#creditcards', {trigger: true});
				}
			}, view);

			view.showContent();
		}

		// @method newCreditCard Dispatch the 'add new credit card' route
	,	newCreditCard: function ()
		{
			if (this.profileModel.get('isLoggedIn') !== 'T')
			{
				return this.application.getLayout().notFound();
			}

			var collection = this.profileModel.get('creditcards')
			,	view = new CreditCardEditView({
					application: this.application
				,	isCreditCardCollectionEmpty: collection.length === 0
				,	model: new Model()
				});

			collection
				.on('add', function ()
				{
					if (view.inModal)
					{
						view.$containerModal && view.$containerModal.modal('hide');
						view.destroy();
					}
					else
					{
						Backbone.history.navigate('#creditcards', { trigger: true });
					}

				}, view);

			view.model.on('change', function (model)
			{
				collection.add(model, {merge: true});
			}, this);

			view.showContent();
		}
	});
});
