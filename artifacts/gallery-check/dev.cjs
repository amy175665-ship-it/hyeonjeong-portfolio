const next=require('next');const http=require('http');const app=next({dev:true,conf:{distDir:'artifacts/gallery-check/preview'}});app.prepare().then(()=>http.createServer(app.getRequestHandler()).listen(3109));

