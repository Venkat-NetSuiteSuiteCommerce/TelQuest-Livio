# HTTPS server
#
server {
    listen 7778;
    server_name localhost;

    root <%= localDistributionPath %>;

    ssl on;
    ssl_certificate <%= certFile %>;
    ssl_certificate_key <%= keyfile %>;

    ssl_session_timeout 5m;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2; # don't use SSLv3 ref: POODLE
    ssl_ciphers "HIGH:!aNULL:!MD5 or HIGH:!aNULL:!MD5:!3DES";
    ssl_prefer_server_ciphers on;

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