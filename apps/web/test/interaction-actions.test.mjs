import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
function load(relative, imports) {
  const target = { exports: {} };
  const code = ts.transpileModule(readFileSync(new URL(relative, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  runInNewContext(code, { exports: target.exports, module: target, AbortSignal, Response, URL, File, Buffer, require: name => { assert.ok(name in imports, name); return imports[name]; } });
  return target.exports;
}
const auth = { authenticatedApiHeaders: async () => ({ Authorization: 'Bearer test' }) };
const form = values => { const data = new FormData(); for (const [key,value] of Object.entries(values)) data.set(key,value); return data; };
test('favorite acknowledges only the write without a redirect or layout refresh; failure is retryable', async () => {
  const calls = []; let fail = false;
  const actions = load('../src/app/workspace/engagement-actions.ts', {
    '@/lib/auth': auth, '@/lib/api': { serverApiFetch: async (path, init) => { if (fail) throw Error(); calls.push([path, init.method]); return {}; } },
    'next/navigation': { redirect: () => { throw Error('must not redirect'); } },
  });
  assert.equal((await actions.favoriteAction(form({contentId:'c',active:'false'}))).active,true);
  assert.equal((await actions.favoriteAction(form({contentId:'c',active:'true'}))).active,false);
  assert.deepEqual(calls,[['/api/contents/c/favorite','POST'],['/api/contents/c/favorite','DELETE']]);
  fail = true; assert.ok((await actions.favoriteAction(form({contentId:'c'}))).error);
});
test('managed publication returns the confirmed record before any catalog read', async () => {
  const calls = [];
  const actions = load('../src/app/workspace/submit/actions.ts', {
    '@/lib/auth': auth, '@/lib/api': { serverApiFetch: async (path) => { calls.push(path); return {contentType:'AI_SKILL',title:'Confirmed',slug:'confirmed',summary:'Real'}; } },
    '@/lib/user-error': { userError:()=> 'failed' }, './attachment-actions': {},
    'next/cache': { revalidatePath:()=>{throw Error('no page read');} }, 'next/navigation': { redirect:()=>{throw Error('no redirect');} },
  });
  const result = await actions.publishDraftAction({},form({id:'c',contentType:'AI_SKILL',title:'Confirmed',__managedCache:'true'}));
  assert.equal(result.publishedHref,'/workspace/ai-skills'); assert.equal(result.publication.title,'Confirmed');
  assert.equal(calls.length,1); assert.equal(calls[0],'/api/content-drafts/c/publish');
});
test('search click endpoint rejects cross-origin and malformed requests before contacting API', async () => {
  let count=0;
  const route = load('../src/app/api/search-click/route.ts', { '@/lib/auth':auth,'@/lib/api':{ApiError:class extends Error {},serverApiFetch:async()=>{count++;}} });
  const request=(origin,data)=>new Request('https://hub.example/api/search-click',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
  assert.equal((await route.POST(request('https://other.example',{contentId:'a',searchLogId:'b'}))).status,403);
  assert.equal((await route.POST(request('https://hub.example',{}))).status,400);
  assert.equal(count,0);
  assert.equal((await route.POST(request('https://hub.example',{contentId:'a',searchLogId:'b'}))).status,204); assert.equal(count,1);
});
test('upload checks draft access first and retains server-authorized file protocol', async () => {
  const calls=[];let deny=true;
  const actions=load('../src/app/workspace/submit/attachment-actions.ts',{
    '@/lib/auth':auth, '@/lib/user-error':{userError:()=> 'failed'}, 'node:crypto':{},
    '@/lib/api':{serverApiFetch:async(path,init)=>{calls.push(path);if(deny)throw Error('denied');if(path.includes('upload-intents'))return {file:{id:'file'},upload:{url:'https://storage.example/signed',method:'PUT',headers:{}}};return {attachments:[],coverFile:null};}},
  });
  const input={id:'draft',name:'file.pdf',type:'application/pdf',size:500,checksum:'checksum',cover:false};
  await assert.rejects(actions.prepareDraftUpload(input));assert.deepEqual(calls,['/api/content-drafts/draft']);
  deny=false;const prepared=await actions.prepareDraftUpload(input);assert.equal(prepared.upload.method,'PUT');
  await assert.rejects(actions.prepareDraftUpload({...input,size:101*1024*1024}));
  const completed=await actions.completeDraftUpload('draft','file',false);assert.ok(completed.savedAt);assert.equal(completed.attachments.length,0);
});
