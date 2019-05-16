{{!
	© 2015 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}
<div class="contact-us-container">
    <header class="contact-us-header">
        <h1 class="contact-us-title">{{pageHeader}}</h1>
        <div id="contact-us-header-cms" class="contact-us-header-cms" data-cms-area="contact-us-header-cms" data-cms-area-filters="path"></div>
    </header>

    <div class="contact-us-content">

        <div id="contact-us-form-cms" class="contact-us-form-cms" data-cms-area="contact-us-form-cms" data-cms-area-filters="path"></div>
        <div class="contact-us-alert-placeholder" data-type="alert-placeholder"></div>
        <small class="contact-us-required">
            {{translate 'Required'}}<span class="contact-us-form-required">*</span>
        </small>

        <form action="#" class="contact-us-form" novalidate>
            {{#each additionalFields}}
                <div class="contact-us-form-controls-group" data-validation="control-group">
                    <label class="contact-us-form-label" for="{{fieldId}}">
                        {{translate '$(0)' displayName}}
                        {{#if mandatory}}
                            {{translate '<small class="contact-us-form-required">*</small>'}}
                        {{/if}}
                    </label>
                    <div class="contact-us-form-controls" data-validation="control">
                        <input  data-action="text" type="text" name="{{fieldId}}" id="{{fieldId}}" class="contact-us-form-input" value="" maxlength="300"></input>
                    </div>
                </div>
            {{/each}}

            <div class="contact-us-form-controls-group" data-validation="control-group">
                <label class="contact-us-form-label" for="email">
                    {{translate 'Email <small class="contact-us-form-required">*</small>'}}
                </label>
                <div class="contact-us-form-controls" data-validation="control">
                    <input  data-action="text" type="text" name="email" id="email" class="contact-us-form-input" value="" maxlength="300"></input>
                    <p>{{ translate '(If you have an account with us, please enter the email address associated with your account.)' }}</p>
                </div>
            </div>


            <div class="contact-us-form-controls-group" data-validation="control-group">
                <label class="contact-us-form-label" for="title">
                    {{translate 'Title <small class="contact-us-form-required">*</small>'}}
                </label>
                <div class="contact-us-form-controls" data-validation="control">
                    <input  data-action="text" type="text" name="title" id="title" class="contact-us-form-input" value="" maxlength="300"></input>
                </div>
            </div>

            <div class="contact-us-form-controls-group" data-validation="control-group">
                <label  class="contact-us-form-label" for="incomingmessage">
                    {{translate 'Comments <small class="contact-us-form-required">*</small>'}}
                </label>
                <div class="contact-us-form-controls" data-validation="control">
                    <textarea name="incomingmessage" id="incomingmessage" class="contact-us-form-textarea"></textarea>
                </div>
            </div>

            <div id="contact-us-extras-cms" class="contact-us-extras-cms" data-cms-area="contact-us-extras-cms" data-cms-area-filters="path"></div>

            <div class="hide message contact-us-message"></div>

            <div class="contact-us-form-controls-group">
                <button type="submit" class="contact-us-button-submit">{{translate 'Submit'}}</button>
            </div>
        </form>

    </div>

</div>

