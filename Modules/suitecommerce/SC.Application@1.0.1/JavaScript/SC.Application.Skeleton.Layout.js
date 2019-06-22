/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('SC.Application.Skeleton.Layout'
,	[
		'GlobalViews.Breadcrumb.View'
	,	'GlobalViews.Modal.View'

	,	'SC.View'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		GlobalViewsBreadcrumbView
	,	GlobalViewsModalView

	,	SCView
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
	// @extends SCCompositeComponentsView
	return SCView.extend({

		// @property {String} container_element where it will be appended
		container_element: '#main'

		// @property {String} content_element where the content (views) will be appended
	,	content_element: '#content'

		//@property {Array} breadcrumbPrefix
	,	breadcrumbPrefix: []

		//@property {Array} breadcrumbPages
	,	breadcrumbPages: []

	,	_initialize: function ()
		{
			SCView.prototype._initialize.apply(this, arguments);
			// @property {jQuery.Deferred} afterAppendViewPromise a promise that is resolve only if one view was shown in this layout
			this.afterAppendViewPromise = jQuery.Deferred();

			var self = this;

			this.once('afterAppendView', function ()
			{
				self.afterAppendViewPromise.resolve();
			});
		}

	,	render: function ()
		{
			// @event beforeRender triggered before rendering this layout view
			this.trigger('beforeRender', this);

			// @event afterRender triggered after rendering this layout view
			this.trigger('afterRender', this);
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

		// @method getApplication @return {ApplicationSkeleton} this layout's application
	,	getApplication: function ()
		{
			return this.application;
		}

		// @method showContent use view.shoContent or layout.showContent(aView) to set the currentView
		// @param {Backbone.View} view @param {Boolean} dont_scroll
	,	showContent: function (view, dont_scroll)
		{
			var first_show_content = !this.currentView;
			var current_view = this.currentView;

			// if the current view displays a bootstrap modal manually (without calling view.showInModal)
			// then it is necessary to clean up the modal backdrop manually here

			this.closeModal();

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
			}

			// @property {Backbone.View} currentView The layout as a view can contain many child views, but there is one that is mandatory and important and is referenced by this property
			// The currentView is the one that is showing the use case  page that the user is currently being working on. While the user navigates through our
			// application the currentView will be changing.
			// {Backbone.View} the single children of the layout should have only one view, the currentView
			this.currentView = view;

			// update the breadcrumb
			var breadcrumb_pages = this.currentView.getBreadcrumbPages ? this.currentView.getBreadcrumbPages() : null;

			if (breadcrumb_pages && this.breadcrumbViewInstance)
			{
				// this.breadcrumbViewInstance.pages = this.updateCrumbtrail(breadcrumb_pages || []);
				this.updateCrumbtrail(breadcrumb_pages || []);
				// this.breadcrumbViewInstance.render();
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
				// jQuery(document).scrollTop(0);
				window.scrollTo(0, 0);
			}

			// we need to return a promise always, as show content might be async
			return jQuery.Deferred().resolveWith(this, [view]);
		}

		// @method addModalListeners @param {Backbone.View} view
	,	addModalListeners: function (view)
		{
			var self = this;

			// hidden is an even triggered by the bootstrap modal plugin
			// we obliterate anything related to the view once the modal is closed
			view.$containerModal.on('hidden.bs.modal', function ()
			{
				self.$el.removeClass('modal-open');

				view.trigger('modal-close', view);

				current_modal_view.destroy();
				view.$containerModal.remove();
				view.$containerModal = null;

				self.$containerModal = null;
				self.modalCurrentView = null;
				$current_modal_el = false;

				//After closing te modal, impose the underlying view's title
				document.title = self.currentView && self.currentView.getTitle() || '';
			});

			//Only trigger afterAppendView when finished showing the modal (has animation which causes a delay)
			view.$containerModal.on('shown.bs.modal',function ()
			{
				view.$('form:first *:input[type!=hidden]:first').focus();
				self.trigger('afterAppendView', view);
			});
		}

		// @method showInModal
		// @param {Backbone.View} view
		// @param {className:String,modalOptions:Object} options Optional object
		// @param {jQuery.Deferred}
	,	showInModal: function (view, options)
		{
			var promise_result = jQuery.Deferred();

			options = _.extend({ modalOptions: {} }, options);

			view.events = view.events || {};

			// we tell the view its being shown in a Modal
			view.inModal = true;

			// we need a different variable to know if the view has already been rendered in a modal
			// this is to add the Modal container only once to the DOM
			if (!view.hasRenderedInModal)
			{
				current_modal_view = new GlobalViewsModalView({
					childViewIstance: view
				,	pageHeader: view.page_header || view.title || ''
				});

				this.$containerModal = current_modal_view.$el;

				this.modalCurrentView = view;
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

			this.addModalListeners(view);
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
	});
});

//@class BreadcrumbPage
//@property {String} text
//@property {String} href