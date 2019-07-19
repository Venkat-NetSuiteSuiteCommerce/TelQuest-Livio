{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

{{#if showExtendedMenu}}
	{{#if showMyAccountMenu}}
        <a class="header-icon-container-logged" href="#" data-toggle="dropdown">
            <i class="header-profile-login-icon"></i>
            <i class="header-profile-welcome-carret-icon"></i>
            {{translate 'Welcome  $(0)' displayName}}<br>

        {{!-- {{#if salesrep}}
                <small>{{translate 'Sales Rep: '}}{{salesrep}}</small>
            {{/if}} --}}

        </a>
		<ul class="header-profile-menu-myaccount-container">
			<li data-view="Header.Menu.MyAccount"></li>
		</ul>
    {{else}}
        <div class="header-profile-menu-login-container">
            <a class="header-icon-link" title="My Account" href="#" data-touchpoint="customercenter">
                <i class="header-profile-login-icon"></i>
                <span class="header-profile-name">
                    {{translate 'Hi $(0)' displayName}}
                </span>
            </a>
        </div>
	{{/if}}

{{else}}

	{{#if showLoginMenu}}
		{{#if showLogin}}
            <div class="header-icon-container">
            <a class="header-icon-container-logged-out" title="My Account" href="#" data-touchpoint="customercenter">
                <i class="header-profile-login-icon"></i>
                <br>{{translate 'Log In'}}<br>
			</a>
            </div>


		{{/if}}
	{{else}}
		<a class="header-profile-loading-link">
			<i class="header-profile-loading-icon"></i>
			<span class="header-profile-loading-indicator"></span>
		</a>
	{{/if}}
{{/if}}



{{!----
Use the following context variables when customizing this template:

	showExtendedMenu (Boolean)
	showLoginMenu (Boolean)
	showLoadingMenu (Boolean)
	showMyAccountMenu (Boolean)
	displayName (String)
	showLogin (Boolean)
	showRegister (Boolean)

----}}
