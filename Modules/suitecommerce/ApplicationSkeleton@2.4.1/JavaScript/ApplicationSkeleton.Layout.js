/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ApplicationSkeleton
define(
	'ApplicationSkeleton.Layout'
,	[	'GlobalViews.Modal.View'
	,	'Header.View'
	,	'Footer.View'
	,	'Backbone.CompositeView'
	,	'GlobalViews.Breadcrumb.View'
	,	'Tracker'

	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		GlobalViewsModalView
	,	HeaderView
	,	FooterView
	,	BackboneCompositeView
	,	GlobalViewsBreadcrumbView
	,	Tracker

	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	var $current_modal_el
	,	current_modal_view;

	// @class ApplicationSkeleton.Layout The root view of the application.
	// It is installed in a container_element HTML element that must exists in the HTML DOM (div #main)
	// Implement the concept of a currentView, this is at any time there is a MAIN view in which the use
	// case implementation is shown. When the user navigates to different application use cases the
	// currentView will change and the afterAppendView event is triggered, offering an API to Modules to
	// react when a certain use case view is shown
	// @extends Backbone.View
	return Backbone.View.extend({

		// @property {String} container_element where it will be appended
		container_element: '#main'

		// @property {String} content_element where the content (views) will be appended
	,	content_element: '#content'

	,	events: {
			'click [data-type="post-to-touchpoint"]': 'touchpointPost'
		,	'click [data-action="items-expander"]' : 'itemsExpander'
		,	'click [data-action="dropdown-expander"]' : 'dropdownExpander'
		}

		//@property {Array} breadcrumbPrefix
	,	breadcrumbPrefix: []

		//@property {Array} breadcrumbPages
	,	breadcrumbPages: []

	,	initialize: function (Application)
		{
			BackboneCompositeView.add(this);

			this.headerView = this.originalHeaderView = HeaderView;
			this.footerView = this.originalFooterView = FooterView;

			this.application = Application;
			this.windowWidth = jQuery(window).width();

			// @property {jQuery.Deferred} afterAppendViewPromise a promise that is resolved only if one view was shown in this layout
			this.afterAppendViewPromise = jQuery.Deferred();

			var self = this;

			this.once('afterAppendView', function ()
			{
				self.afterAppendViewPromise.resolve();
			});

			jQuery(window).on('resize', _.throttle(function ()
			{

				if (_.getDeviceType(self.windowWidth) === _.getDeviceType(jQuery(window).width()))
				{
					return;
				}

				_.resetViewportWidth();

				self.updateHeader();
				self.updateFooter();

				self.updateLayoutSB && self.updateLayoutSB();

				self.windowWidth = jQuery(window).width();

			}, 1000));
		}

		//@method getColorPalette Given a palette name it generates a Layout.ColorPalette. The returned palette can be used for any purpose.
		//@public
		//@param {String} palette_name Name of the requested palette
		//@return {Layout.ColorPalette}
	,	getColorPalette: function getColorPalette (palette_name)
		{
			//@class Layout.ColorPalette This class works as a dictionary, where each key is the color name (e.g. black) and each value is the color value (hexa value expressed in the configuration)
			var color_palette = {};

			//empty palette_name is not allowed
			if (!palette_name)
			{
				return color_palette;
			}

			_.each(this.application.getConfig('layout.colorPalette', []), function (color_item)
			{
				if (color_item.paletteId === palette_name)
				{
					if (color_item.colorValue) // if it is a color
					{
						color_palette[color_item.colorName] = color_item.colorValue;
					}
					else if (color_item.imgsrc)
					{
						color_palette[color_item.colorName] = {
							src: color_item.imgsrc
						,	height: color_item.imgheight
						,	width: color_item.imgwidth
						};
					}
				}
			});

			return color_palette;
			// @class ApplicationSkeleton.Layout
		}

	,	render: function ()
		{
			// @event beforeRender triggered before rendering this layout view
			this.trigger('beforeRender', this);

			Backbone.View.prototype.render.call(this);

			// @event afterRender triggered after rendering this layout view
			this.trigger('afterRender', this);
		}

		// @method updateHeader
	,	updateHeader: function ()
		{
			if (this.application.getConfig('siteSettings.sitetype') === 'ADVANCED')
			{
				this.headerViewInstance && this.headerViewInstance.render();
			}
		}

		// @method updateFooter
	,	updateFooter: function()
		{
			if (this.application.getConfig('siteSettings.sitetype') === 'ADVANCED')
			{
				this.footerViewInstance && this.footerViewInstance.render();
			}
		}

		//@method updateCrumbtrail Receives a collection of pages.
		//@param {Array<BreadcrumbPage>||BreadcrumbPage} pages
		//@return {Array<BreadcrumbPage>} List of all the "navigation" needed to get to the current page
	,	updateCrumbtrail: function (pages)
		{
			if (!_.isArray(pages))
			{
				pages = [pages];
			}

			this.breadcrumbPages = _.union(this.breadcrumbPrefix, pages);

			return this.breadcrumbPages;
		}

		//@method hideBreadcrumb
	,	hideBreadcrumb: function ()
		{
			this.breadcrumbViewInstance && this.breadcrumbViewInstance.$el.empty();
		}

		// @method appendToDom append this layout view to the DOM in the element pointed by property container_element
	,	appendToDom: function ()
		{
			var self = this;
			this.afterAppendViewPromise.done(function ()
			{
				// @event beforeAppendToDom triggered before this layout view is appended to the DOM
				self.trigger('beforeAppendToDom', self);

				jQuery(self.container_element).html(self.$el);

				// @event afterAppendToDom triggered after this layout view is appended to the DOM
				self.trigger('afterAppendToDom', self);
			});
		}

		// @method getApplication
		// @return {ApplicationSkeleton} this layout's application
	,	getApplication: function ()
		{
			return this.application;
		}

		// @method touchpointPost perform a POST operation to the specified touchpoint ('post-touchpoint')
	,	touchpointPost: function(e)
		{
			var touchpoint = this.$(e.target).data('post-touchpoint')
			,	touchpoints = SC.getSessionInfo('touchpoints')
			,	target_touchpoint = (touchpoints ? touchpoints[touchpoint] : '') || ''
			,	new_url = _.fixUrl(target_touchpoint);

			_.doPost(new_url);
		}

		// @method itemsExpander
	,	itemsExpander: function (e)
		{
			e.preventDefault();
			e.stopPropagation();

			jQuery(e.currentTarget)
				.parent().find('[data-action="items-expander"] a i').toggleClass('icon-minus').end()
				.find('[data-content="items-body"]').stop().slideToggle();
		}

		// @method dropdownExpander
	,	dropdownExpander: function (e)
		{
			e.preventDefault();
			e.stopPropagation();

			jQuery(e.currentTarget)
				.parent().find('[data-action="dropdown-expander"] a i').toggleClass('icon-chevron-up').end()
				.find('[data-content="items-body"]').stop().slideToggle();
		}

		// @method showContent use view.shoContent or layout.showContent(aView) to set the currentView
		// @param {Backbone.View} view
		// @param {Boolean} dont_scroll
	,	showContent: function showContent (view, dont_scroll)
		{
			return this.cancelableTriggerUnsafe('beforeAppendView', view)
				.then(_.bind(this._showContent, this, view, dont_scroll));
		}

		// @method showContent use view.showContent or layout.showContent(aView) to set the currentView
		// @param {Backbone.View} view
		// @param {Boolean} dont_scroll
	,	_showContent: function _showContent (view, dont_scroll)
		{
			var first_show_content = !this.currentView
			,	current_view = this.currentView;

			if (!view.enhancedPage)
			{
				Tracker.getInstance().trackPageview('/' + Backbone.history.fragment);
			}

			// if the current view displays a bootstrap modal manually (without calling view.showInModal)
			// then it is necessary to clean up the modal backdrop manually here

			this.closeModal();

			if (view.inModal)
			{
				return view.showInModal();
			}

			// We render the layout only once, the first time showContent is called
			if (!this.rendered)
			{
				this.render();
				this.rendered = true;
			}

			// This line will destroy the view only if you are adding a different instance of a view
			if (current_view && current_view !== view)
			{
				current_view.destroy();

				if (current_view.bodyClass)
				{
					this.$el.removeClass(current_view.bodyClass);
				}
			}

			// @property {Backbone.View} currentView The layout as a view can contain many child views, but there is one that is mandatory and important and is referenced by this property
			// The currentView is the one that is showing the use case  page that the user is currently being working on. While the user navigates through our
			// application the currentView will be changing.
			// {Backbone.View} the single children of the layout should have only one view, the currentView
			this.currentView = view;
			this._currentView = view;


			//update the header and footer
			this.headerView = this.currentView.getHeaderView && this.currentView.getHeaderView() ? this.currentView.getHeaderView() : this.originalHeaderView;

			this.footerView = this.currentView.getFooterView && this.currentView.getFooterView() ? this.currentView.getFooterView() : this.originalFooterView;

			if ((this.headerViewInstance && !(this.headerViewInstance instanceof this.headerView)) || (this.footerViewInstance && !(this.footerViewInstance instanceof this.footerView)))
			{
				this.getChildViewInstance('Header') && this.getChildViewInstance('Header').undelegateEvents();
				this.getChildViewInstance('Footer') && this.getChildViewInstance('Footer').undelegateEvents();

				this.addChildViewInstances({
					'Header': this.childViews.Header
				,	'Footer': this.childViews.Footer
				});

					this.render();
				}

			// update the breadcrumb
			var breadcrumb_pages = this.currentView.getBreadcrumbPages ? this.currentView.getBreadcrumbPages() : null;

			if (breadcrumb_pages && this.breadcrumbViewInstance)
			{
				this.breadcrumbViewInstance.pages = this.updateCrumbtrail(breadcrumb_pages || []);
				this.breadcrumbViewInstance.render();
			}
			else
			{
				this.hideBreadcrumb();
			}

			// keep the min height value to restore it later because the .empty() will mess the current scrolling.
			var minHeight;
			if(!first_show_content)
			{
				minHeight = this.$(this.content_element).css('min-height');
				// set the height of 'content_element' to his current height because after empty() there will be no scroll bar and the dont_scroll will not work
				this.$(this.content_element).css('min-height', this.$(this.content_element).height() + 'px');
			}

			// Empties the content first, so events don't get unbind
			this.$(this.content_element).empty();
			view.render();

			if (view.bodyClass)
			{
				this.$el.addClass(view.bodyClass);
			}

			//document's title
			document.title = view.title || '';

			// @event beforeAppendView
			this.trigger('beforeAppendView', view);

			this.$(this.content_element).append(view.$el);
			if(!first_show_content && minHeight)
			{
				this.$(this.content_element).css('min-height', minHeight);
			}

			// @event afterAppendView
			this.trigger('afterAppendView', view);

			view.isRenderedInLayout = true;

			// Sometimes we do not want to scroll top when the view is rendered
			// Eventually we might change view and dont_scroll to an option obj
			if (!dont_scroll && !first_show_content)
			{
				jQuery(document).scrollTop(0);
			}

			// we need to return a promise always, as show content might be async
			return jQuery.Deferred().resolveWith(this, [view]);
		}

		// @method wrapModalView
		// @param {Backbone.View} view
	,	wrapModalView: function (view)
		{
			var $modal_body = view.$containerModal.find(['data-type="modal-body"']);
			if (view.$('.modal-body').length && $modal_body.length)
			{
				$modal_body.removeClass('modal-body');
			}

			return this;
		}

		// @method prefixViewIds
		// @param {Backbone.View} view
		// @param {String} prefix
	,	prefixViewIds: function (view, prefix)
		{
			if (typeof view === 'string')
			{
				prefix = view;
				view = this.currentView;
			}

			if (view instanceof Backbone.View)
			{
				prefix = prefix || '';
				// Adding the prefix to all ids
				view.$('[id]').each(function ()
				{
					var el = jQuery(this);


					if (el.parents('svg').length > 0 || !!el.data('nonprefix'))
					{
						return; // don't overwrite svg child ids & data-nonprefix="true"
					}

					el.attr('id', function (i, old_id)
					{
						return prefix + old_id;
					});
				});

				// Adding the prefix to all fors, so labels still work
				view.$('[for]').each(function ()
				{
					jQuery(this).attr('for', function (i, old_id)
					{
						return prefix + old_id;
					});
				});
			}
		}

		// @method addModalListeners
		// @param {Backbone.View} view
	,	addModalListeners: function (view, current_view)
		{
			var self = this;

			// hidden is an even triggered by the bootstrap modal plugin
			// we obliterate anything related to the view once the modal is closed
			view.$containerModal.on('hidden.bs.modal', function ()
			{
				self.$el.removeClass('modal-open');

				view.trigger('modal-close', view);

				current_view.destroy();
				view.$containerModal.remove();
				view.$containerModal = null;
				self.$containerModal = null;
				self.modalCurrentView = null;
				$current_modal_el = false;

				self._currentView = self.currentView;

				//After closing te modal, impose the underlying view's title
				document.title = self.currentView && self.currentView.getTitle() || '';
			});

			//Only trigger afterAppendView when finished showing the modal (has animation which causes a delay)
			view.$containerModal.on('shown.bs.modal',function ()
			{
				if (view.focusFirstInput ? view.focusFirstInput() : true)
				{
				view.$('form:first *:input[type!=hidden]:first').focus();
				}
				self.trigger('afterAppendView', view);
				view.$containerModal.modal('handleUpdate');
			});
		}

		// @method getCurrentView
		// @return {Backbone.View} the current view no matter if rendered normally or in a modal.
	,	getCurrentView: function ()
		{
			return this._currentView;
		}

		// @method showInPush
		// @param {Backbone.View} view
		// @param {Object} options
	,	showInPush: function (view, options)
		{
			var self = this;

			options = options || {};

			if (!this.$pusher_container)
			{
				this.$pusher_container = jQuery('<div data-action="pushable"></div>');

				this.$el.append(this.$pusher_container);
			}

			view.$pusher_container = this.$pusher_container;

			view.render();

			this.pushCurrentView = view;

			this.$pusher_container.append(view.$el);

			this.$pusher_container.scPush();

			this.$pusher_container.trigger('open');

			this.$pusher_container.on('afterClose', function ()
			{
				if (!options.no_destroy)
				{
					if (view)
					{
						view.$el.empty();
						view.destroy();
						self.$pusher_container.find('div:empty').remove();
						self.pushCurrentView = null;
					}
				}
			});

			return jQuery.Deferred().resolveWith(this, [view]);
		}

		// @method closePush
	,	closePush: function removePush ()
		{
			if (this.$pusher_container)
			{
				this.$pusher_container.trigger('close');
				this.$pusher_container.find('div:empty').remove();
			}
		}

		// @method showInModal
		// @param {Backbone.View} view
		// @param {className:String,modalOptions:Object} options Optional object
		// @param {jQuery.Deferred}
	,	showInModal: function (view, options)
		{
			var promise_result = jQuery.Deferred();

			options = jQuery.extend({ modalOptions: {} }, options);

			view.events = view.events || {};
			// We add the mousedown event on the 'Cancel' button to hide the modal, otherwise,
			// the validation could add a validation error and move the position of the 'Cancel' button
			// and fail to close the modal on the click event
			// Order of the events: mousedown, blur, click
			view.events['mousedown [data-dismiss="modal"]'] = function(e)
			{
				e.preventDefault();
			};

			// we tell the view its being shown in a Modal
			view.inModal = true;

			// we need a different variable to know if the view has already been rendered in a modal
			// this is to add the Modal container only once to the DOM
			if (!view.hasRenderedInModal)
			{
				var element_id = view.$el.attr('id');

				GlobalViewsModalView.prototype.attributes = {};
				GlobalViewsModalView.prototype.className = 'modal fade ' + (view.modalClass || element_id ? ('modal-'+ element_id) : '');
				GlobalViewsModalView.prototype.attributes.id = view.modalId || element_id ? ('modal-'+ element_id) : 'modal';

				current_modal_view = new GlobalViewsModalView({
					childViewIstance: view
				,	pageHeader: view.page_header || view.title || ''
				});

				this.$containerModal = view.$containerModal = current_modal_view.$el;

				this.modalCurrentView = view;
				this._currentView = view;

				view.options.layout = this;
			}

			this.trigger('beforeAppendView', view);

			if (!view.hasRenderedInModal)
			{
				var self = this;
				// if there was a modal opened we wait for close it
				this.closeModal().done(function () {
					self._showModalInDOM(view, options, current_modal_view, promise_result);
				});
			}
			else
			{
				this._renderModalView(view, current_modal_view);
				promise_result.resolveWith(this, [view]);
			}

			return promise_result;
		}

	, 	closeModal: function ()
		{
			var promise = jQuery.Deferred();

			if ($current_modal_el)
			{
				$current_modal_el.on('hidden.bs.modal', function ()
				{
					promise.resolve();
				});

				$current_modal_el.modal('hide');
			}
			else
			{
				promise.resolve();
			}

			return promise;
		}

		//@method _renderModalView Internal method to render a view in a modal context
		//@param {Backbone.View} view
		//@param {jQuery} current_modal_view
		//@return {Void}
	,	_renderModalView: function (view, current_modal_view)
		{
			// Generates the HTML for the view based on its template
			// http://backbonejs.org/#View-render
			if (!view.hasRenderedInModal)
			{
				current_modal_view.render();
			}
			else
			{
				view.render();
			}

			this.wrapModalView(view).prefixViewIds(view, 'in-modal-');
		}

		//@method _showModalInDOM Internal auxiliary method responsible for render the view and show it as a modal.
		//@param {Backbone.View} view
		//@param {Object} options
		//@param {jQuery} current_modal_view
		//@param {jQuery.Deferred} promise
		//@return {Void}
	,	_showModalInDOM: function (view, options, current_modal_view, promise)
		{
			this._renderModalView(view, current_modal_view);

			$current_modal_el = view.$containerModal;

			this.addModalListeners(view, current_modal_view);
			// So, now we add the wrapper modal with the view in it to the DOM - we append it to the Layout view instead of body, so modal links are managed by NavigationHelper.
			view.$containerModal.appendTo(this.el);

			// We trigger the plugin, it can be passed custom options
			// http://twitter.github.com/bootstrap/javascript.html#modals
			view.$containerModal.modal(options.modalOptions);

			//When we are in SiteBuilder all our CSS classes are wrapped up with a container (#main generally)
			//and as  bootrap add the class modal-open at the body HTML element, this makes unaccessible for boostrap selector due to the #main selector in the middle
			//In the and we need all boostrap events properly attached, so we fix it by adding this class inside the main wrapper
			this.$el.addClass('modal-open');

			if (options.className)
			{
				view.$containerModal.addClass(options.className);
			}

			// the view has now been rendered in a modal
			view.hasRenderedInModal = true;

			promise.resolveWith(this, [view]);
		}

		// Defining the interface for this class. All modules will interact with the layout trough this methods some others may be added as well
		// @method showError
	,	showError: jQuery.noop

		// @method showSuccess
	,	showSuccess: jQuery.noop

		//@property {Object} childViews
	,	childViews: {
			'Header': function()
			{
				var options = {
					application: this.application
				};

				if (this.currentView && this.currentView.getHeaderViewOptions)
				{
					_.extend (options, this.currentView.getHeaderViewOptions());
				}

				this.headerViewInstance = new this.headerView(options);
				return this.headerViewInstance;
			}
		,	'Footer': function()
			{
				var options = {
					application: this.application
				};

				if (this.currentView && this.currentView.getFooterViewOptions)
				{
					_.extend (options, this.currentView.getFooterViewOptions());
				}

				this.footerViewInstance = new this.footerView(options);
				return this.footerViewInstance;
			}

		,	'Global.Breadcrumb': function ()
			{
				this.breadcrumbViewInstance = new GlobalViewsBreadcrumbView({pages: this.breadcrumbPages});

				return this.breadcrumbViewInstance;
			}
		}
		//@method getContext
		//@return {ApplicationSkeleton.Layout.Context}
	,	getContext: function ()
		{
			//@class ApplicationSkeleton.Layout.Context
			return {};
		}

	});
});


//@class BreadcrumbPage
//@property {String} text
//@property {String} href
