{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

<div class="facets-category-browse">
	<nav class="facets-category-browse-facets">
		<div id="category-navigation" class="facets-category-browse-navigation">
			<div class="facets-category-browse-header">
				<div id="banner-left-top" class="facets-category-browse-banner-left-top"></div>
				<h1 class="facets-category-browse-title">
					{{translate 'Shop $(0)' categoryItemId}}
				</h1>
			</div>
			<div class="facets-category-browse-facets-list-wrapper">		
				<div data-view="Facets.FacetsList"></div>
				<div id="banner-left-bottom" class="facets-category-browse-banner-left-bottom"></div>
			</div>
		</div>
	</nav>
	<section id="category-list-container" class="facets-category-browse-body">
		<div id="banner-section-top" class="facets-category-browse-banner-top"></div>
		<div data-view="Facets.CategoryCellList"></div>
		<div id="banner-section-bottom" class="facets-category-browse-banner-bottom"></div>
	</section>
</div>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
