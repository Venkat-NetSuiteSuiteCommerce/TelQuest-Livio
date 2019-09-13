<nav class="facets-faceted-categories-tree">
    <!--div class="facets-faceted-navigation-item-facet-group-expander">
        <h4 class="facets-faceted-navigation-item-facet-group-title">{{translate 'Categories'}}</h4>
    </div-->
    <ul class="facets-faceted-categories-tree-main-list">
        {{#each categories}}
            <li class="facets-faceted-categories-tree-level level-0 {{#if isOpen}}open{{/if}}">
                <a class="facets-faceted-categories-tree-link" href="{{fullurl}}">{{name}}</a>
                <div class="clearfix"></div>
                <ul class="facets-faceted-categories-tree-level-0 {{#if isOpen}}in{{/if}} collapse" id="tree_{{internalid}}">
                    {{#each categories}}
                        <li class="facets-faceted-categories-tree-level level-1 {{#if isOpen}}open{{/if}}">
                            {{#if isOpen}}
                            <a class="facets-faceted-categories-tree-link" href="{{fullurl}}">
                                {{name}}
                            </a>
                            {{/if}}
                            <div class="clearfix"></div>
                            <ul class="facets-faceted-categories-tree-level-1 {{#if isOpen}}in{{/if}} collapse" id="tree_{{internalid}}">
                                {{#each categories}}
                                    <li class="facets-faceted-categories-tree-level level-2 {{#if isOpen}}open{{/if}}">
                                        <a class="facets-faceted-categories-tree-link" href="{{fullurl}}">
                                            {{name}}
                                        </a>
                                        <div class="clearfix"></div>
                                    </li>
                                {{/each}}
                            </ul>
                        </li>
                    {{/each}}
                </ul>
            </li>
        {{/each}}
    </ul>
</nav>
