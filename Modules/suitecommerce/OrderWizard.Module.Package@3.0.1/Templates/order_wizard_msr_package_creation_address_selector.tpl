{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

<p  class="order-wizard-msr-package-creation-address-selector-title"> {{translate 'Ship items to: '}}</p>
<select data-line-id="{{lineId}}" data-action="set-shipments-address-selector" class="order-wizard-msr-package-creation-address-selector" {{#unless areAddressesToShow}}disabled="disabled"{{/unless}} >
	{{#if areAddressesToShow}}
		{{#each addresses}}
			<option value="{{addressId}}" {{#if isSelected}}selected{{/if}} >
				{{title}}
			</option>
		{{/each}}
	{{else}}
		<option value="" 'selected' >
			{{translate 'Assign shipping addresses'}}
		</option>
	{{/if}}
</select>


{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
