{{#if hasItems}}
    <div>
        <span>{{label}}</span>

        <div class="dropdown">
            <button class="btn btn-default dropdown-toggle button-upsell-items-selected" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">
                {{#if showSelectedUpsell}}
                    <div class="upsell-items-option-select-text">
                        <div>{{ selectedUpsell.name }}</div>{{#if selectedUpsell.price}} <div><b>+ {{ selectedUpsell.price }}</b></div>{{/if}}
                    </div>
                {{else}}
                    {{emptyLabel}}
                {{/if}}
                <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
                {{#if showSelectedUpsell}}
                    <li data-action="select-upsell" role="presentation">
                        <a role="menuitem" tabindex="-1" data-value="" href="#">
                           {{emptyLabel}}
                        </a>
                    </li>
                {{/if}}

                {{#each items}}
                    <li data-action="select-upsell" role="presentation" data-value="{{id}}">
                        <a role="menuitem" tabindex="-1" data-value="{{id}}" href="#" class="upsell-items-opton-select">

                            <div class="upsell-items-option-select-text">
                                <div>{{ name }}</div>{{#if price}} <div><b>+ {{ price }}</b></div>{{/if}}
                                {{!---
                                {{#if showCompare}}
                                    <div class="product-views-price-old" data-value="{{id}}">
                                        {{translate 'Reg.: $(0)' basePrice}}
                                    </div>
                                {{/if}}
                                --}}
                            </div>
                            {{#if upsellImage.url}}
                                <img data-value="{{id}}" src="{{resizeImage upsellImage.url 'tinythumb'}}" alt="{{upsellImage.alt}}"/>
                            {{/if}}
                        </a>
                    </li>
                {{/each}}
            </ul>
        </div>
    </div>
{{/if}}

