const next=require('next');const http=require('http');const app=next({dev:true,conf:{distDir:'artifacts/footer-layout/preview'}});app.prepare().then(()=>http.createServer(app.getRequestHandler()).listen(3110));

