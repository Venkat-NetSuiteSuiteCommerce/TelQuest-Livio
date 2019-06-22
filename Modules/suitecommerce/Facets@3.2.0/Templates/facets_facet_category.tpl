{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

<li class="facets-facet-category {{#if isActive}} active {{/if}}">
	<div class="facets-facet-category-item-label">
		<a title="{{itemId}}" href="{{url}}" class="facets-facet-category-item-anchor">
			{{itemId}}
			{{#if hasItems}} {{itemCount}} {{/if}}
		</a>
	</div>
	{{#if hasSubcategory}}
		<div data-view="Facets.FacetCategoriesList"></div>
	{{/if}}
</li>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
