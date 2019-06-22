/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

//@module OrderWizard
define(
	'OrderWizard.Module.Title'
,	[	'Wizard.Module'

	,	'order_wizard_title.tpl'

	,	'underscore'
	]
,	function (
		WizardModule

	,	order_wizard_title_tpl

	,	_
	)
{
	'use strict';

	//@class OrderWizard.Module.Title @extend WizardModule
	return WizardModule.extend(
	{
		//@property {Function} template
		template: order_wizard_title_tpl

		//@method render We override render to just render this module in case the it is active
		//@return {Void}
	,	render: function ()
		{
			if (this.isActive())
			{
				this._render();
			}
			else
			{
				this.$el.empty();
			}
			
			return this.trigger('ready', true);
		}

		//@method initialize
		//@param {OrderWizard.Module.Title.Initialize.Options} options
		//@return {Void}
	,	initialize: function (options)
		{
			WizardModule.prototype.initialize.apply(this, arguments);			
			this.title = options.title;
			this.refreshOn = options.refreshOn;
			this.tag = options.tag;
			this.details = options.details;
			this.attributes = options.attributes;

			this.refresh();
		}

		//@method refresh Attach to the desire refreshOn of the passed in options when this module is initialized
		//@return {Void}
	,	refresh: function ()
		{
			if (this.refreshOn)
			{
				if (_(this.refreshOn).isFunction())
				{
					this.refreshOn();
				}
				else
				{
					this.wizard.model.on(this.refreshOn, this.render, this);
				}
			}
		}

		//@method getStringifyAttributes Given an object generate a string representation of it
		//@param {Object} obj Any object to convert to string
		//@return {String}
	,	getStringifyAttributes: function (obj)
		{
			var self = this;

			return _.reduce(obj, function (memo, value, key)
			{
				if ( _.isObject(value))
				{
					return memo + self.getStringifyAttributes(obj[key], key + '-');
				}

				return memo + ' ' + _.escape(key) + '=' + _.escape( _.isArray(value) ? value.join(' ') : value);
			}, '');
		}

		//@method getTag Evaluates the current tag and returns it final value
		//@return {String}
	,	getTag: function ()
		{
			return _(this.tag).isFunction() ? this.tag() : (this.tag || 'h2');
		}

		//@method getDetails Evaluates the current details and returns it final value
		//@return {String}
	,	getDetails: function ()
		{
			return _(this.details).isFunction() ? this.details() : (this.details || '');
		}

		//@method getTitle Evaluates the current title and returns it final value
		//@return {String}
	,	getTitle: function ()
		{
			return _(this.title).isFunction() ? this.title() : (this.title || '');
		}

		// @method getContext
		// @return {OrderWizard.Module.Title.Context}
	,	getContext: function ()
		{
			//@class OrderWizard.Module.Title.Context
			return {
				//@property {String} tag
				tag: this.getTag()
				//@property {String} attributes
			,	attributes: this.getStringifyAttributes(this.attributes || {})
				//@property {String} details
			,	details: this.getDetails()
				//@property {String} title
			,	title: this.getTitle()
				//@property {Boolean} showDetails
			,	showDetails: !!this.getDetails()
			};
			//@class OrderWizard.Module.Title
		}

		//@method destroy Override parent method to handle detaching form model event used to re-render
		//@return {Void}
	,	destroy: function ()
		{
			if (this.refreshOn && !_(this.refreshOn).isFunction())
			{
				this.wizard.model.on(this.refreshOn, this.render, this);
			}

			WizardModule.prototype.destroy.apply(this, arguments);
		}
	});
});

//@class OrderWizard.Module.Title.Initialize.Options
//@property {String} title
//@property {String|Function} refreshOn If it is a function you can specify when the module should be re-render.
//If it is a string is the name of the event thrown by the wizard's model used to re-render
//@property {String|Function} tag Name of the HTML tag to be created
//@property {String|Function} details
//@property {String|Function} title Title to show (main property of this module)
//@property {Object} attributes