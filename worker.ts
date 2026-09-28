// @ts-nocheck — runtime types are loose; runs Janus-Pro-1B locally on WebGPU. No network calls except model file fetches.
import {AutoProcessor,MultiModalityCausalLM,BaseStreamer} from '@huggingface/transformers';
const ID='onnx-community/Janus-Pro-1B-ONNX';let p,m;const files={};const post=(x)=>self.postMessage(x);
async function load(){if(m)return;
 p=await AutoProcessor.from_pretrained(ID);
 m=await MultiModalityCausalLM.from_pretrained(ID,{
  dtype:{prepare_inputs_embeds:'q4',language_model:'q4f16',lm_head:'fp16',gen_head:'fp16',gen_img_embeds:'fp16',image_decode:'fp32'},
  device:{prepare_inputs_embeds:'wasm',language_model:'webgpu',lm_head:'webgpu',gen_head:'webgpu',gen_img_embeds:'webgpu',image_decode:'webgpu'},
  progress_callback:(e)=>{if(e.status==='progress'){files[e.file]=[e.loaded,e.total];let l=0,t=0;for(const[a,b]of Object.values(files)){l+=a;t+=b}post({type:'dl',loaded:l,total:t})}}});
 post({type:'ready'})}
self.onmessage=async(ev)=>{try{
 await load();if(ev.data.type!=='generate')return;
 const inputs=await p([{role:'<|User|>',content:ev.data.prompt}],{chat_template:'text_to_image'});
 const n=p.num_image_tokens;let c=0;
 const streamer=new (class extends BaseStreamer{put(){post({type:'gen',done:++c,total:n})}end(){}})();
 const out=await m.generate_images({...inputs,min_new_tokens:n,max_new_tokens:n,do_sample:true,streamer});
 post({type:'image',blob:await out[0].toBlob(),w:out[0].width,h:out[0].height});
}catch(e){post({type:'error',message:String(e?.message||e)})}};
