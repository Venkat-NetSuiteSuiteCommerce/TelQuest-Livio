{{!
© 2017 NetSuite Inc.
User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
provided, however, if you are an authorized user with a NetSuite account or log-in, you
may use this code subject to the terms that govern your access and use.
}}

<div class="facets-item-cell-grid clearfix" data-type="item" data-item-id="{{itemId}}" itemprop="itemListElement" itemscope
    itemtype="http://schema.org/ListItem" data-track-productlist-list="{{track_productlist_list}}"
    data-track-productlist-category="{{track_productlist_category}}" data-track-productlist-position="{{track_productlist_position}}"
    data-sku="{{sku}}">

    <meta itemprop="name" content="{{name}}">
    <meta itemprop="url" content="{{url}}">

    <p class="table-view-mpn"><span class="facets-item-cell-table-rating" itemprop="aggregateRating" itemscope="" itemtype="https://schema.org/AggregateRating" data-view="GlobalViews.StarRating"></span>{{translate 'MPN: '}} {{mpn}} </p>

    <div itemscope itemtype="https://schema.org/Product">
        <meta itemprop="name" content="{{name}}">
        <meta itemprop="url" content="{{url}}">
        <div class="facets-item-cell-table-image-wrapper">
            <a class="facets-item-cell-table-link-image" href="{{url}}">
                <img class="facets-item-cell-table-image" src="{{resizeImage thumbnail.url 'thumbnail'}}" alt="{{thumbnail.altimagetext}}"
                    itemprop="image">
            </a>
            {{#if isEnvironmentBrowser}}
            <div class="facets-item-cell-table-quick-view-wrapper">
                <a href="{{url}}" class="facets-item-cell-table-quick-view-link" data-toggle="show-in-modal">
                    <i class="facets-item-cell-table-quick-view-icon"></i>
                    {{translate 'Quick View'}}
                </a>
            </div>
            {{/if}}
            <div data-view="ProductBadges"></div>

        </div>
        <div class="facets-item-cell-table-content-wrapper">
            <h2 class="facets-item-cell-table-title">
                <a  href="{{url}}">
                    <span class="table-product-title" itemprop="name">
                        {{name}}
                    </span>
                </a>
            </h2>
            <div class="facets-item-cell-table-price">
                <div data-view="ItemViews.Price"></div>
            </div>


          {{!--  {{#if features}}

            <div class="list-item-description">
                <p>{{{features}}}</p>
            </div>
            {{/if}}

         --}}

            <div data-view="ItemDetails.Options"></div>

           <div data-view="Cart.QuickAddToCart"></div>

            <div class="facets-item-cell-table-stock">
                <div data-view="ItemViews.Stock" class="facets-item-cell-table-stock-message"></div>
            </div>

            <div data-view="StockDescription"></div>
        </div>
    </div>
</div>


{{!----
Use the following context variables when customizing this template:

itemId (Number)
name (String)
url (String)
sku (String)
isEnvironmentBrowser (Boolean)
thumbnail (Object)
thumbnail.url (String)
thumbnail.altimagetext (String)
itemIsNavigable (Boolean)
showRating (Boolean)
rating (Number)

----}}
