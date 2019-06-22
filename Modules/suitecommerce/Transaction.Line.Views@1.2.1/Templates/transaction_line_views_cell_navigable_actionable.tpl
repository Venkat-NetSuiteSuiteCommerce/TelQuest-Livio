{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

<tr class="transaction-line-views-cell-navigable-actionable {{cellClassName}} item-{{itemId}}" data-id="{{itemId}}" data-item-type="{{itemType}}">
	<td class="transaction-line-views-cell-navigable-actionable-item-image" name="item-image">
		<img src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}">
	</td>
	<td class="transaction-line-views-cell-navigable-actionable-details" name="item-details">
		<p class="transaction-line-views-cell-navigable-actionable-product-name">
			{{#if isNavigable}}
				<a class="transaction-line-views-cell-navigable-actionable-product-title-anchor" {{{itemURLAttributes}}}>{{itemName}}</a>
			{{else}}
				<span class="transaction-line-views-cell-navigable-actionable-product-title">
					{{itemName}}
				</span>
			{{/if}}
		</p>

		<div data-view="Item.Sku"></div>
		{{#if showOptions}}
			<div data-view="Item.Options"></div>
		{{/if}}
	</td>
	<td class="transaction-line-views-cell-navigable-actionable-item-unit-price" name="item-totalprice">
		<p>
		{{#if showDetail2Title}}
				<span class="transaction-line-views-cell-navigable-actionable-item-unit-price-label">{{detail2Title}}</span>
		{{/if}}
		<span class="transaction-line-views-cell-navigable-actionable-item-reason-value"> {{detail2}}</span>
		</p>
	</td>
	<td class="transaction-line-views-cell-navigable-actionable-item-quantity" name="item-quantity">
		<p>
			<span class="transaction-line-views-cell-navigable-actionable-item-quantity-label">{{translate 'Quantity:'}}</span>
			<span class="transaction-line-views-cell-navigable-actionable-item-quantity-value"> {{quantity}}</span>
		</p>
	</td>
	<td class="transaction-line-views-cell-navigable-actionable-amount" name="item-amount">
		<p>
		{{#if showDetail3Title}}
			<span class="transaction-line-views-cell-navigable-actionable-item-amount-label">{{detail3Title}}</span>
		{{/if}}
		<span class="transaction-line-views-cell-navigable-actionable-item-amount-value"> {{detail3}}</span>
		{{#if showComparePrice}}
			<small class="transaction-line-views-cell-navigable-actionable-item-old-price">{{comparePriceFormatted}}</small>
		{{/if}}
		</p>
	</td>
</tr>


{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
