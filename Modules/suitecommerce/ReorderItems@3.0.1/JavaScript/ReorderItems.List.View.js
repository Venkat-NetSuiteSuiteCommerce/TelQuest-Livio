/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module ReorderItems
define(
	'ReorderItems.List.View'
,	[	'ListHeader.View'
	,	'SC.Configuration'
	,	'GlobalViews.Pagination.View'
	,	'GlobalViews.ShowingCurrent.View'
	,	'Tracker'
	,	'LiveOrder.Model'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'Transaction.Line.Views.Cell.Actionable.View'
	,	'ReorderItems.Actions.Quantity.View'
	,	'ReorderItems.Actions.AddToCart.View'
	,	'GlobalViews.Message.View'
	,	'ErrorManagement'
	,	'Handlebars'

	,	'reorder_items_list.tpl'

	,	'Backbone'

	,	'underscore'
	,	'jQuery'
	]
,	function (

		ListHeaderView
	,	Configuration
	,	GlobalViewsPaginationView
	,	GlobalViewsShowingCurrentView
	,	Tracker
	,	LiveOrderModel
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	TransactionLineViewsCellActionableView
	,	ReorderItemsActionsQuantityView
	,	ReorderItemsActionsAddToCartView
	,	GlobalViewsMessageView
	,	ErrorManagement
	,	Handlebars

	,	reorder_items_list_tpl

	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	//@class ReorderItems.List.View @extends Backbone.View
	return Backbone.View.extend({
		//@propery {Function} template
		template: reorder_items_list_tpl
		//@propery {String} className
	,	className: 'OrderItemReorderListView'
		//@propery {String} title
	,	title: _('Reorder Items').translate()
		//@propery {String} page_header
	,	page_header: _('Reorder Items').translate()
		//@propery {Object} attributes
	,	attributes: {'class': 'OrderItemReorderListView'}
		//@propery {Object} events
	,	events: {
				'click [data-action="add-to-cart"]': 'addToCart'
			,	'change [name="item_quantity"]' : 'updateQuantity'
		}
		//@method initialize
	,	initialize: function (options)
		{
			this.application = options.application;
			this.options.showCurrentPage = true;

			if (options.order_id)
			{
				this.collection.order_id = options.order_id;
				this.order_id = options.order_id;
				this.order_number = options.order_number;
			}

			this.listenCollection();

			// manges sorting and filtering of the collection
			this.listHeader = new ListHeaderView({
				view: this
			,	application: options.application
			,	collection: this.collection
			,	filters: options.order_id ? null : this.filterOptions
			,	sorts: options.order_id ? this.sortOptionsSingleOrder : this.sortOptions
			,	hidePagination: true
			,	headerMarkup: options.order_id ? this.getOrderLink() : ''
			});

			BackboneCompositeView.add(this);
		}

		//@method updateQuantity
	,	updateQuantity:  function (e)
		{
			var target = jQuery(e.currentTarget)
			,	line_id = target.data('line-id')
			,	line = this.collection.get(line_id)
			,	item = line.get('item')
			,	min_quantity = item.get('_minimumQuantity', true) || 1;

			var new_value = parseInt(target.val(), 10);
			if(new_value < min_quantity)
			{
				target.val(min_quantity);
			}

			line.set('quantity', new_value);
		}

		//@method getOrderLink
	,	getOrderLink: function ()
		{
			var order_link = jQuery('<a/>')
							.attr('href','/ordershistory/view/' + this.order_id)
							.html(_('Order Number: $(0)').translate(this.order_number))
							.wrap('<div></div>')
							.parent();

			return new Handlebars.SafeString(order_link.html());

		}
		//@method listenCollection
	,	listenCollection: function ()
		{
			this.setLoading(true);

			this.collection.on({
				request: jQuery.proxy(this, 'setLoading', true)
			,	reset: jQuery.proxy(this, 'setLoading', false)
			});
		}
		//@method setLoading
	,	setLoading: function (value)
		{
			this.isLoading = value;
		}

		//@method getSelectedMenu
	,	getSelectedMenu: function ()
		{
			return 'reorderitems';
		}
		//@method getBreadcrumbPages
	,	getBreadcrumbPages: function ()
		{
			var crumbtrail = [{
				text: this.title
			,	href: '/reorderItems'
			}];

			if (this.order_id && this.order_number)
			{
				this.title = _('Reorder Items from Order #$(0)').translate(this.order_number);
				crumbtrail.push({text: _('Order #$(0)').translate(this.order_number), href: '/reorderItems/order/' + this.order_id});
			}

			return crumbtrail;
		}

		//@method trackEventReorder
	,	trackEventReorder: function (line)
		{
			line && Tracker.getInstance().trackEvent({
				category: 'Reorder'
			,	action: 'button'
			,	label: line.generateURL()
			,	value: 1
			});
		}

		//@method addToCart add to cart an item, the quantity is written by the user on the input and the options are the same that the ordered item in the previous order
	,	addToCart: function (e)
		{
			e.preventDefault();

			var	self = this
			,	line_id = this.$(e.target).data('line-id')
			,	$form = this.$(e.target).closest('[data-type="order-item"]')
			,	$alert_placeholder = $form.find('[data-type=alert-placeholder]')
			,	$quantity = $form.find('input[name=item_quantity]')
			,	selected_line = this.collection.get(line_id)
			,	quantity = isNaN(parseInt($quantity.val(), 10)) ? 0 : parseInt($quantity.val(), 10);

			if (quantity)
			{
				selected_line.set('quantity', quantity);

				// The 'fulfillmentChoice' for reorders must be setted to 'ship'
				if (selected_line.get('fulfillmentChoice'))
				{
					selected_line.set('fulfillmentChoice', 'ship');
				}

				LiveOrderModel.getInstance().addLine(selected_line).done(function ()
				{
					self.trackEventReorder(selected_line);

					$alert_placeholder.show().empty();

					var message;

					if (quantity > 1)
					{
						message = _('$(0) Items successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>').translate(quantity);
					}
					else
					{
						message = _('Item successfully added to <a href="#" data-touchpoint="viewcart">your cart</a><br/>').translate();
					}

					message = new GlobalViewsMessageView({
							message: message
						,	type: 'success'
						,	closable: true
					}).render().$el;

					$alert_placeholder.html(message);

					setTimeout(function ()
					{
						$alert_placeholder.fadeOut(function ()
						{
							$alert_placeholder.empty();
						});
					}, 6000);

				}).fail(function (jqXhr)
				{
					jqXhr.preventDefault = true;

					var message = new GlobalViewsMessageView({
						message: ErrorManagement.parseErrorMessage(jqXhr, self.application.getLayout().errorMessageKeys)
					,	type: 'error'
					,	closable: true
					}).render().$el;

					$alert_placeholder.show().empty().html(message);
				});
			}
			else
			{
				var message = new GlobalViewsMessageView({
						message: _('The number of items must be positive.').translate()
					,	type: 'error'
					,	closable: true
				}).render().$el;

				$alert_placeholder.show().empty().html(message);
			}
		}

		//@method getStringDateFromDaysCount Returns a date substracting the amound of days specified from now
	,	getStringDateFromDaysCount: function (days_back)
		{
			var now = new Date();
			return new Date(now.setDate(now.getDate() - days_back));
		}
		//@method {Array} sortOptionsSingleOrder
	,	sortOptionsSingleOrder: [
			{
				value: 'price'
			,	name: _('By Price').translate()
			,	selected: true
			}
		,	{
				value: 'name'
			,	name: _('By Name').translate()
			}
		]
		//@method {Array} sortOptions
	,	sortOptions: [
			{
				value: 'quantity'
			,	name: _('By Frequently Purchased').translate()
			,	selected: true
			}
		,	{
				value: 'date'
			,	name: _('By Most Recently Purchased').translate()
			}
		,	{
				value: 'price'
			,	name: _('By Price').translate()
			}
		,	{
				value: 'name'
			,	name: _('By Name').translate()
			}
		]
		//@method {Array} filterOptions
	,	filterOptions: [
			{
				value: function ()
				{
					return _.dateToString(this.getStringDateFromDaysCount(15)) + 'T'+ _.dateToString(new Date());
				}
			,	name: _('Show last 15 days').translate()
			,	className: 'reorder-items-filter-last-15-days'
			,	selected: true
			}
		,	{
				value: function ()
				{
					return _.dateToString(this.getStringDateFromDaysCount(30)) + 'T'+ _.dateToString(new Date());
				}
			,	name: _('Show last 30 days').translate()
			,	className: 'reorder-items-filter-last-30-days'
			}
		,	{
				value: function ()
				{
					return _.dateToString(this.getStringDateFromDaysCount(60)) + 'T'+ _.dateToString(new Date());
				}
			,	name: _('Show last 60 days').translate()
			,	className: 'reorder-items-filter-last-60-days'
			}
		,	{
				value: function ()
				{
					return _.dateToString(this.getStringDateFromDaysCount(90)) + 'T'+ _.dateToString(new Date());
				}
			,	name: _('Show last 90 days').translate()
			,	className: 'reorder-items-filter-last-90-days'
			}
		,	{
				value: function ()
				{
					return _.dateToString(this.getStringDateFromDaysCount(180)) + 'T'+ _.dateToString(new Date());
				}
			,	name: _('Show last 180 days').translate()
			,	className: 'reorder-items-filter-last-180-days'
			}
		]
		// @property {Object} childViews
	,	childViews: {
			'ListHeader': function()
			{
				return this.listHeader;
			}
		,	'GlobalViews.Pagination': function()
			{
				return new GlobalViewsPaginationView(_.extend({
					totalPages: Math.ceil(this.collection.totalRecordsFound / this.collection.recordsPerPage)
				}, Configuration.defaultPaginationSettings));
			}
		,	'GlobalViews.ShowCurrentPage': function()
			{
				return new GlobalViewsShowingCurrentView({
					items_per_page: this.collection.recordsPerPage
		 		,	total_items: this.collection.totalRecordsFound
				,	total_pages: Math.ceil(this.collection.totalRecordsFound / this.collection.recordsPerPage)
				});
			}
		,	'Reorder.Items': function()
			{
				var view = new BackboneCollectionView({
						collection: this.collection.filter(function (line){ return line.get('item').get('_id');})
					,	viewsPerRow: 1
					,	childView: TransactionLineViewsCellActionableView
					,	childViewOptions: {
								application: this.application
							,	navigable: true
							,	SummaryView: ReorderItemsActionsQuantityView
							,	ActionsView: ReorderItemsActionsAddToCartView
							,	showComparePrice: true
						}
				});

				this.collection.on('reset', function ()
				{
					view.render();
				});

				return view;
			}
		}
		//@method getContext: function()
	,	getContext: function()
		{
			//@class ReorderItems.List.View.Context
			return {
					//@propery {Boolean} isLoading
					isLoading: this.isLoading
					//@propery {Boolean} showItems
				,	showItems: !!this.collection.totalRecordsFound
					//@propery {Boolean} itemsNotFound
				,	itemsNotFound: !this.collection.totalRecordsFound && !this.isLoading
					//@propery {String} pageHeader
				,	pageHeader: this.page_header
					// @property {Boolean} showPagination
				,	showPagination: !!(this.collection.totalRecordsFound && this.collection.recordsPerPage)
					// @property {Boolean} showCurrentPage
				,	showCurrentPage: this.options.showCurrentPage
					//@property {Boolean} showBackToAccount
				,	showBackToAccount: Configuration.get('siteSettings.sitetype') === 'STANDARD'
			};
		}

	});

});
