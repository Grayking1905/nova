import { readFile } from 'node:fs/promises';
const root=new URL('../../apps/desktop/dist/',import.meta.url);
const mime={'.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
export async function serveFrontend(req,res,url){
  if(url.pathname!=='/'&&url.pathname!=='/favicon.svg'&&!/^\/ui-assets\/[\w.-]+$/.test(url.pathname))return false;
  try{const path=url.pathname==='/'?'index.html':url.pathname.slice(1),data=await readFile(new URL(path,root));const extension=path.slice(path.lastIndexOf('.'));res.writeHead(200,{'Content-Type':path==='index.html'?'text/html; charset=utf-8':mime[extension]||'application/octet-stream','Cache-Control':path==='index.html'?'no-cache':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'});res.end(data);return true;}catch{return false;}
}
