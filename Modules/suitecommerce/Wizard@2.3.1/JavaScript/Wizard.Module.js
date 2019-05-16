/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module Wizard
define('Wizard.Module'
,	[	'wizard_module.tpl'
	,	'GlobalViews.Message.View'
	,	'Backbone'
	,	'underscore'
	,	'jQuery'
	]
,	function (
		wizard_module_tpl
	,	GlobalViewsMessageView

	,	Backbone
	,	_
	,	jQuery
	)
{
	'use strict';

	// @class Wizard.Module Abstract Representation of a Wizard Module @extends Backbone.View
	return Backbone.View.extend({

		tagName: 'article'

	,	template: wizard_module_tpl

		// @property {Array} errors
	,	errors: []

	,	initialize: function (options)
		{
			this.wizard = options.wizard;
			this.step = options.step;
			this.model = options.wizard.model;

			// errors array in the configuration file completely overrides the default one.
			if (options.errors)
			{
				this.errors = options.errors;
			}
		}

		// @method disableInterface General method to disable the module interface called at the moment of submitting the step
	,	disableInterface: jQuery.noop

		// @method enableInterface General method to re-enable the module interface called after getting an ERROR on submitting
	,	enableInterface: jQuery.noop

		// @method refresh Auxiliary method to refresh a module. It is implemented by the OrderWizard to refresh titles
	,	refresh: jQuery.noop

	,	_render: function ()
		{
			var ret;
			if(!this.isActive())
			{
				ret = this.$el.empty();
			}
			else
			{
				this.$el.addClass('module-rendered');
				ret = Backbone.View.prototype._render.apply(this, arguments);
				// add the error message box to the module
				if (!this.$('[data-type="alert-placeholder-module"]').length)
				{
					this.$el.prepend('<div data-type="alert-placeholder-module"></div>');
				}

				// we show module errors (if any) and remove the error object
				if (this.error)
				{
					this.showError();
				}
			}

			// We trigger the resize event of the body as the DOM is changed
			// and some components might be positioned based on the body size
			jQuery(document.body).trigger('resize');

			return ret;
		}

		// @method submit by default, a module returns it's validation promise. @returns {jQuery.Deferred}
	,	submit: function ()
		{
			return this.isValid();
		}

		// @method cancel @returns {jQuery.Deferred}
	,	cancel: function ()
		{
			return jQuery.Deferred().resolve();
		}

		// @method isValid validate resolves a promise because maybe it needs to do some ajax for validation @returns {jQuery.Deferred}
	,	isValid: function ()
		{
			return jQuery.Deferred().resolve();
		}

		// @method isActive Base implementation to determines is a module is active (can be submitted, rendered or just use) or not. @returns {Boolean}
	,	isActive: function ()
		{
			return _.isFunction(this.options.isActive) ?
					this.options.isActive.apply(this, arguments) :
					true;
		}

		// @method getTitle returns the title of the module, can be overridden in the configuration file. @returns {String}
	,	getTitle: function ()
		{
			return _.isFunction(this.options.title) ?
					this.options.title.apply(this) :
					this.options.title || this.title || '';
		}

		// @method manageError @param {Wizard.Module.Error} error
	,	manageError: function (error)
		{
			if (this.state !== 'future' && this.isActive())
			{
				//@property {Wizard.Module.Error} error the current error object if any
				this.error = error;
				this.trigger('error', error);

				// if the module is being shown we show the error
				if (this.wizard.getCurrentStep() === this.step)
				{
					this.showError();
				}
			}
		}

		// @method showError render the error message
	,	showError: function ()
		{
			var global_view_message = new GlobalViewsMessageView({
					message: this.error.errorMessage
				,	type: 'error'
				,	closable: true
			});

			//Note: in special situations (like in payment-selector), there are modules inside modules, so we have several place holders, so we only want to show the error in the first place holder.
			var error_container = this.$('[data-type="alert-placeholder-module"]:first')
			,	error_container_parent = error_container.parents('.module-rendered:last');

			if (error_container_parent.length)
			{
				//may be more than one, we are interested in the last one
				jQuery('body').animate({
					scrollTop: jQuery(error_container_parent[0]).offset().top
				}, 600);
			}

			error_container.html(global_view_message.render().$el.html());
			this.error = null;
		}

		// @method clearError empty the error message container
	,	clearError: function ()
		{
			this.$('[data-type="alert-placeholder-module"]').empty();
			this.error = null;
		}

		// @method clearGeneralMessages General method to clear any message at step level
	,	clearGeneralMessages: function ()
		{
			jQuery('[data-type="alert-placeholder-module"]:first').empty();
		}

		// @method showGeneralMessage Notify a message (not just an error) at step level. Type can be a boolean (true: for errors, false: for success) or string to add a class alert-<type>
	,	showGeneralMessage: function (message, type)
		{
			var message_type = _.isString(type) ?
										type :
										type && 'error' || 'success';

			var global_view_message = new GlobalViewsMessageView({
					message: message
				,	type: message_type
				,	closable: true
			});

			jQuery('[data-type="alert-placeholder-module"]:first').html(global_view_message.render().$el.html());
		}

	});
});

//@class Wizard.Module.Error 
//@property {String} errorMessage
//@property {String} errorCode