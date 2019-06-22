{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

{{#if showShippingInformation}}
	<section class="order-wizard-showshipments-actionable-module-shipping-details">
		<div class="order-wizard-showshipments-actionable-module-shipping-details-body">
			<div class="order-wizard-showshipments-actionable-module-shipping-details-address">
				<h3 class="order-wizard-showshipments-actionable-module-shipping-title">
					{{translate 'Shipping Address'}}
				</h3>
				{{#if showShippingAddress}}
					<div data-view="Shipping.Address"></div>
					{{#if showEditButton}}
						<a data-action="edit-module" href="{{{editUrl}}}?force=true" class="order-wizard-showshipments-actionable-module-shipping-details-address-link">
							{{translate 'Back to Shipping'}}
						</a>
					{{/if}}
				{{else}}
					<a data-action="edit-module" href="{{{editUrl}}}?force=true" class="order-wizard-showshipments-actionable-module-shipping-details-address-link">
						{{translate 'Please select a valid shipping address'}}
					</a>
				{{/if}}
			</div>
			<div class="order-wizard-showshipments-actionable-module-shipping-details-method">
				<h3 class="order-wizard-showshipments-actionable-module-shipping-title">
					{{translate 'Shipping Method'}}
				</h3>
				<div class="order-wizard-showshipments-actionable-module-shipping-details-method-info-card">
					<span class="order-wizard-showshipments-actionable-module-shipmethod-name">
						{{selectedShipmethod.name}}
					</span>
					:
					<span class="order-wizard-showshipments-actionable-module-shipmethod-rate">
						{{selectedShipmethod.rate_formatted}}
					</span>
				</div>
			</div>
		</div>
	</section>
{{/if}}

<section class="order-wizard-showshipments-actionable-module-cart-details">
	<div class="order-wizard-showshipments-actionable-module-cart-details-accordion-head">
		<a class="order-wizard-showshipments-actionable-module-cart-details-accordion-head-toggle" data-toggle="collapse" data-target="#unfulfilled-items" aria-expanded="true" aria-controls="unfulfilled-items">
		{{#if linesLengthGreaterThan1}}
			{{translate 'Products ($(0))' lines.length}}
		{{else}}
			{{translate 'Product ($(0))' lines.length}}
		{{/if}}
		<i class="order-wizard-showshipments-actionable-module-cart-details-accordion-toggle-icon"></i>
		</a>
	</div>
	<div class="order-wizard-showshipments-actionable-module-cart-details-accordion-body collapse" id="unfulfilled-items" role="tabpanel" data-target="#unfulfilled-items">
		<div class="order-wizard-showshipments-actionable-module-accordion-container" data-content="order-items-body">
			<table class="">
				<tbody data-view="Items.Collection"></tbody>
			</table>
		</div>
	</div>
</section>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
