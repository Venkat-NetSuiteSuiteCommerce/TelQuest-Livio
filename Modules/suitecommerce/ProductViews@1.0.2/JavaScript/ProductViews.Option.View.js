/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

// @module ProductViews
define(
	'ProductViews.Option.View'
,	[
		'SC.Configuration'

	,	'Backbone'
	,	'underscore'
	,	'bootstrap-datepicker'
	]
,	function (
		Configuration

	,	Backbone
	,	_
	)
{
	'use strict';

	//@class ProductViews.Option.View.initialize
	//@property {Transaction.Line.Model} line
	//@property {String} templateName As this view can be used to show options in all state (selected or to be selected) it is required to specify
	//what template should be used from the list of templates in configuration. If not value is given 'selector' is used, note that this value
	//is used to select option (in the PDP for instance)
	//@property {Backbone.Model<Transaction.Line.Option.Model>} model

	// @class ProductViews.Option.View @extends Backbone.View
	return Backbone.View.extend({

		//@method initialize Set the option template and values availability
		//@param {ProductViews.Option.View.initialize} options
		//@return {Void}
		initialize: function ()
		{
			this.config = _.findWhere(Configuration.get('ItemOptions.optionsConfiguration', []), {cartOptionId: this.model.get('cartOptionId')}) || {templates:{}};
			this.config.templates = this.config.templates || {};

			var item_options_default_templates = Configuration.get('ItemOptions.defaultTemplates', {});

			if (item_options_default_templates && item_options_default_templates.selectorByType)
			{
				// Sets templates for this option
				if (!this.config.templates.selector)
				{
					var option_selector_template = item_options_default_templates.selectorByType[this.model.get('type')]
					,	default_option_selector_template = item_options_default_templates.selectorByType['default'];

					this.config.templates.selector = option_selector_template || default_option_selector_template;
				}

				if (!this.config.templates.selected)
				{
					var option_selected_template = item_options_default_templates.selectedByType[this.model.get('type')]
					,	default_option_selected_template = item_options_default_templates.selectedByType['default'];

					this.config.templates.selected = option_selected_template || default_option_selected_template;
				}

				if (!this.config.templates.facetCell)
				{
					var option_facetcell_template = item_options_default_templates.facetCellByType[this.model.get('type')]
					,	default_option_facetcell_template = item_options_default_templates.facetCellByType['default'];

					this.config.templates.facetCell = option_facetcell_template || default_option_facetcell_template;
				}
			}

			this.options.templateName = this.options.templateName || 'selector';
			this.template =	this.config.templates[this.options.templateName];
		}

		//@method getContext
		//@returns {ProductViews.Option.View.Context}
	,	getContext: function()
		{
			var self = this
			,	selected_value = this.model.get('value') || {}
			,	values = _.map(this.model.get('values'), function (value)
				{
					var color = ''
					,	is_color_tile = true
					,	image = {};

					if (self.model.get('colors'))
					{
						color = self.model.get('colors')[value.label] || self.model.get('colors').defaultColor;

						if (_.isObject(color))
						{
							image = color;
							color = '';
							is_color_tile = false;
						}
					}

					//@class ProductViews.Option.View.Value
					return {
						// @property {String} internalId
						internalId: value.internalid
						// @property {Boolean} isAvailable
					,	isAvailable: value.isAvailable
						// @property {String} url
					,	url: value.url
						// @property {String} label
					,	label: value.label
						// @property {Boolean} isActive
					,	isActive: value.internalid === selected_value.internalid
						// @property {String} color
					,	color: color
						// @property {Boolean} isColorTile Indicate if a simple colored box should be shown or an image object is aimed
					,	isColorTile: is_color_tile
						// @property {Color.Configuration>|String} image
					,	image: image
						// @property {Boolean} isLightColor
					,	isLightColor: _.contains(Configuration.get('layout.lightColors',[]), value.label)
					};
					//@class ProductViews.Option.View
				});

			// @class ProductViews.Option.View.Context
			return {
				// @property {Transaction.Line.Option.Model} model
				model: this.model
				// @property {Array<ItemOptions.Option.View.Value>} values
			,	values: values
				// @property {Boolean} showSelectedValue
			,	showSelectedValue: !!selected_value
				// @propery {Boolean} showRequiredLabel
			,	showRequiredLabel: this.options.show_required_label && this.model.get('isMandatory')
				// @property {String} itemOptionId
			,	itemOptionId: this.model.get('itemOptionId')
				// @property {String} cartOptionId
			,	cartOptionId: this.model.get('cartOptionId')
				// @property {String} label
			,	label: this.model.get('label')
				// @property {ItemViews.Option.View.Option} selectedValue
			,	selectedValue: selected_value
				// @property {Boolean} isTextArea
			,	isTextArea: this.model.get('type') === 'textarea'
				// @property {Boolean} isEmail
			,	isEmail: this.model.get('type') === 'email'
				// @property {Boolean} isText
			,	isText: this.model.get('type') === 'text'
				// @property {Boolean} isCheckbox
			,	isCheckbox: this.model.get('type') === 'checkbox'
				// @property {Boolean} idDate
			,	isDate: this.model.get('type') === 'date'
				// @property {Boolean} isSelect
			,	isSelect: this.model.get('type') === 'select'
				// @property {String} showLabel
			,	showLabel: !this.options.hideLabel
				// @property {Boolean} showSmall
			,	showSmall: !!this.options.showSmall
			};
			// @class ProductViews.Option.View
		}
	});
});
