{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

<article data-id="{{lineId}}" class="transaction-line-views-cell-selectable-actionable {{lineId}}" data-item-id="{{itemId}}">
	{{#if showCustomAlert}}
		<div class="transaction-line-views-cell-selectable-actionable-alert-placeholder" data-type="alert-placeholder">
			<div class="alert alert-{{customAlertType}}">
				{{alertText}}
			</div>
		</div>
	{{/if}}

	<div class="transaction-line-views-cell-selectable-actionable-item">
		<div class="transaction-line-views-cell-selectable-actionable-input-checkbox">
			<input type="checkbox" name="" value="{{lineId}}" {{#if isLineChecked}}checked{{/if}}>
		</div>

		<div class="transaction-line-views-cell-selectable-actionable-image">
			<div class="transaction-line-views-cell-selectable-actionable-thumbnail">
				{{#if isNavigable}}
					<a {{{linkAttributes}}}>
						<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
					</a>
				{{else}}
					<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
				{{/if}}
			</div>
		</div>
		<div class="transaction-line-views-cell-selectable-actionable-details">
				<div  class="transaction-line-views-cell-selectable-actionable-name">
				{{#if isNavigable}}
					<a {{{linkAttributes}}} class="transaction-line-views-cell-selectable-actionable-name-link">
						{{itemName}}
					</a>
				{{else}}
					{{itemName}}
				{{/if}}
				</div>
				<div class="transaction-line-views-cell-selectable-actionable-price">
					<div data-view="Item.Price"></div>
				</div>
				<div data-view="Item.Sku"></div>
				<div class="transaction-line-views-cell-selectable-actionable-options">
					<div data-view="Item.SelectedOptions"></div>
				</div>
			{{#if showSummaryView}}
				<div class="transaction-line-views-cell-selectable-actionable-summary" data-view="Item.Summary.View"></div>
			{{/if}}
		</div>
	</div>
	{{#if showActionsView}}
	<div data-view="Item.Actions.View" class="transaction-line-views-cell-selectable-actionable-actions">
	</div>
	{{/if}}
</article>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
