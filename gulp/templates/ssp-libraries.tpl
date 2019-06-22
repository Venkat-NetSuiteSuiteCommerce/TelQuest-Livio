<% if(metadata){ %>release_metadata = <%= JSON.stringify(metadata) %>;<% } %>
<%= requireDefinition %>
<%= modules %>
try {
    require.config(<%= JSON.stringify(amdConfig) %>);
    require(<%= JSON.stringify(entryPoint) %>);
}
catch(err)
{
   nlapiLogExecution('ERROR', 'Error loading ssp_libraries', err);

   for(k in err)
   {
           nlapiLogExecution('ERROR', 'Error loading ssp_libraries: ' + k, err[k]);
   }

   throw err;
}

