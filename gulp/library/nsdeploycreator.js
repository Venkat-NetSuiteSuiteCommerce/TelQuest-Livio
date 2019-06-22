var fs = require('fs')
,   path = require('path')
,   args = require('yargs').argv
,   inquirer = require('inquirer')
;

'use strict';

var nsdeploy_path =  path.join(process.gulp_init_cwd, '.nsdeploy');

var generateNsdeployFile = function (config, cb)
{
    var nsdeploydata = {
        'email': config.email,
        'account': config.account,
        'role': config.role || 3,
        'roleId': config.role || 3,
        'hostname': config.hostname || 'rest.netsuite.com',
        'target_folder': config.target_folder,
        'webapp_id': config.webapp_id,
        'website': config.website,
        'domain': config.domain
    };

    fs.writeFileSync(nsdeploy_path, JSON.stringify(nsdeploydata, null, 4));
};

var getCredentials = function getCredentials(cb)
{
    if(fs.existsSync(nsdeploy_path)) 
    {
        var credentials = JSON.parse(fs.readFileSync(nsdeploy_path));
        credentials.vm = args.vm || credentials.vm;
        credentials.molecule = args.m || credentials.molecule;
        credentials.nsVersion = args.nsVersion;  
        credentials.role =  args.role || credentials.role;
        credentials.website = args.website || credentials.website;
        credentials.applicationId = args.applicationId;
        credentials.domain = args.domain || credentials.domain;
       
        if(!credentials.password)
        {
            inquirer.prompt(
            {
                    type: 'password'
                ,   name: 'password'
                ,   message: 'Password'
                ,   validate: function(input)
                    {
                        return input.length > 0 || 'Please enter a password';
                    }
                }
            ,   function(answers)
                {
                    credentials.password = answers.password;
                    cb(null, credentials);
                }
            );
        }
        else
        {
            cb(null, credentials);
        }
    }
    else
    {
        cb(new Error('there is no .nsdeploy'));
    }
};

module.exports = {
    generateNsdeployFile: generateNsdeployFile
,   getCredentials: getCredentials
,   nsdeploy_path: nsdeploy_path
};