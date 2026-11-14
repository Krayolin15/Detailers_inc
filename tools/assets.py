import subprocess, os, sys, json, shutil, glob
U='/mnt/user-data/uploads/'
SRC={ 'n1':'e77a6d82-WhatsApp_Video_2026-11-14_at_14.25.11_1.mp4','n2':'cb2e6155-WhatsApp_Video_2026-11-14_at_14.25.11.mp4',
 'n3':'8e3bccbc-WhatsApp_Video_2026-11-14_at_14.25.22.mp4','n4':'2b32a9fc-WhatsApp_Video_2026-11-14_at_14.25.22_1.mp4',
 'n5':'39b3d829-WhatsApp_Video_2026-11-14_at_14.25.22_2.mp4','n6':'91e81109-WhatsApp_Video_2026-11-14_at_14.25.23.mp4',
 'n7':'2f5bf31b-WhatsApp_Video_2026-11-14_at_14.25.23_1.mp4','n8':'7952a6c4-WhatsApp_Video_2026-11-14_at_14.25.23_2.mp4',
 'n9':'ac69199a-WhatsApp_Video_2026-11-14_at_14.25.24.mp4','v5':'b557111e-WhatsApp_Video_2026-11-14_at_14.13.30.mp4','v6':'3a7d0804-WhatsApp_Video_2026-11-14_at_14.13.31.mp4'}
OUT='/home/claude/detailers-inc/assets/'
def run(a): subprocess.run(a,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def cuts(k):
    r=subprocess.run(['ffmpeg','-hide_banner','-i',U+SRC[k],'-vf',"select='gt(scene,0.30)',showinfo",'-an','-f','null','-'],capture_output=True,text=True).stderr
    import re; return [float(x) for x in re.findall(r'pts_time:([0-9.]+)',r)]
def seq(name, src, segs, sizes, q=60):
    """segs: list of (start,end,fps). sizes: {'d':'1280:-2','m':'854:-2'}"""
    meta={'chapters':[]}
    for var,scale in sizes.items():
        d=OUT+f'seq/{name}/{var}/'; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
        n=0; ch=[]
        for i,(s,e,fps) in enumerate(segs):
            tmp=f'/tmp/seq_{name}_{var}_{i}/'; shutil.rmtree(tmp,ignore_errors=True); os.makedirs(tmp)
            run(['ffmpeg','-y','-ss',str(s),'-t',str(e-s),'-i',U+SRC[src],'-vf',f'fps={fps},scale={scale}:flags=lanczos','-c:v','libwebp','-quality',str(q),'-compression_level','5',tmp+'%04d.webp'])
            fs=sorted(glob.glob(tmp+'*.webp')); st=n
            for f in fs:
                n+=1; shutil.move(f,d+f'{n:04d}.webp')
            ch.append([st,n-1])
        meta['count']=n; meta['chapters']=ch
        sz=sum(os.path.getsize(f) for f in glob.glob(d+'*.webp'))
        from PIL import Image
        im=Image.open(d+'0001.webp'); meta[var]={'w':im.size[0],'h':im.size[1]}
        print(name,var,n,'frames',round(sz/1e6,2),'MB',im.size)
    return meta
def clip(name, src, s, dur, scale='540:-2', crf=27):
    run(['ffmpeg','-y','-ss',str(s),'-t',str(dur),'-i',U+SRC[src],'-an','-vf',f'scale={scale}:flags=lanczos,fps=30','-c:v','libx264','-preset','slow','-crf',str(crf),'-pix_fmt','yuv420p','-profile:v','main','-movflags','+faststart',OUT+f'video/{name}.mp4'])
    still(name+'-poster',src,s+0.6,scale.split(':')[0],sub='video')
    print('clip',name,round(os.path.getsize(OUT+f'video/{name}.mp4')/1e3),'KB')
def still(name, src, t, w, q=74, sub='img', crop=None):
    vf=(crop+',' if crop else '')+f'scale={w}:-2:flags=lanczos'
    run(['ffmpeg','-y','-ss',str(t),'-i',U+SRC[src],'-frames:v','1','-vf',vf,'-c:v','libwebp','-quality',str(q),OUT+f'{sub}/{name}.webp'])
if __name__=='__main__':
    what=sys.argv[1:]
    M={}
    if 'cuts' in what:
        for k in ['n3','n4','n5','n7','n8','n9','v6']: print(k,[round(c,1) for c in cuts(k)])
    if 'seq' in what:
        M['hero']=seq('hero','n6',[(78.1,80.8,8),(97.0,99.55,6),(94.15,96.8,6),(103.0,105.85,6),(106.0,122.1,4)],{'d':'1280:-2','m':'854:-2'},q=62)
        M['angles']=seq('angles','n2',[(8.25,10.25,5),(10.4,12.45,5),(12.6,15.7,5),(18.95,22.55,4),(22.75,25.85,4),(29.55,32.7,5),(32.9,36.6,5)],{'d':'1280:-2','m':'854:-2'},q=58)
        M['film']=seq('film','v5',[(0.3,2.7,5),(5.82,6.98,7),(7.05,8.8,6),(8.9,11.45,5),(13.9,19.9,4),(25.85,28.42,5),(37.4,40.05,5)],{'d':'540:-2','m':'432:-2'},q=62)
        M['finale']=seq('finale','n6',[(81.1,84.8,8)],{'d':'1280:-2','m':'854:-2'},q=62)
        json.dump(M,open(OUT+'seq/manifest.json','w'))
        print(json.dumps(M))
