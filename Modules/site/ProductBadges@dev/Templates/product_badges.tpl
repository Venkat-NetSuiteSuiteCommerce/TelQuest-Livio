<div class="product-badges">
    {{#each badges}}
        {{#if image}}
            <div class="image-badge-{{id}}">
                <img src="{{image}}" alt="badge">
            </div>

        {{else}}
            <div class="product-badge-{{id}}" style="color:{{color}}">
                <span>{{translate badge}}</span>
            </div>

        {{/if}}

    {{/each}}
</div>
