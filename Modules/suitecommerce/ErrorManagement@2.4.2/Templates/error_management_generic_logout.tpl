{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

<section class="error-management-generic-logout-modal-content">
	<div class="error-management-generic-logout">
		<h4>
			<span class="error-management-generic-logout-warning-icon"></span>
			{{labels.title}}
		</h4>
	    <p>{{labels.explanation}}</p>
	</div>
	<p>
	  	<button class="error-management-generic-logout-close-button" data-action="logouterror" >{{labels.login}}</button>
	</p>
</section>

{{!----
The context variables for this template are not currently documented. Use the {{log this}} helper to view the context variables in the Console of your browser's developer tools.

----}}
