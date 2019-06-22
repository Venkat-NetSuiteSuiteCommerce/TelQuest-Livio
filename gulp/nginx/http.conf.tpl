server {
    listen 7777 default_server;
    listen [::]:7777 default_server ipv6only=on;

    root <%= localDistributionPath %>;
    server_name localhost;

    location / {
        add_header Access-Control-Allow-Origin *;
        try_files $uri $uri/ =404;
        autoindex on;
    }

    location /Modules {
        add_header Access-Control-Allow-Origin *;
        alias ../../Modules;
        autoindex on;
    }
}
