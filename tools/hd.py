"""Full-HD masters. Sources are 720p; these are high-quality Lanczos upscales to 1080p with light
sharpening, encoded at high bitrate so no further quality is lost. Stills likewise."""
import subprocess, os, glob, cv2
U='/mnt/user-data/uploads/'; OUT='/home/claude/detailers-inc/assets/'
R='/home/claude/refs3/'
SH='unsharp=5:5:0.55:5:5:0.0'
def enc(inp, out, vf, pre=[], crf=18):
    subprocess.run(['ffmpeg','-v','error','-y']+pre+['-i',inp,'-an','-vf',vf,'-c:v','libx264','-preset','medium','-crf',str(crf),'-pix_fmt','yuv420p','-profile:v','high','-movflags','+faststart',OUT+'video/'+out],check=True)
    p=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height','-of','csv=p=0',OUT+'video/'+out],capture_output=True,text=True).stdout.strip()
    print(out,p,round(os.path.getsize(OUT+'video/'+out)/1e6,1),'MB',flush=True)
P=f'scale=1080:1920:flags=lanczos,{SH}'; L=f'scale=1920:1080:flags=lanczos,{SH}'
enc('/tmp/hx/EV/%04d.png','hero.mp4',f'scale=1920:-2:flags=lanczos,{SH}',pre=['-framerate','30'],crf=17)
for name,src,s,d in [('svc-wash','h6',15.2,7.2),('svc-detail','h5',13.9,5.9),('svc-polish','h3',19.6,6.9),('svc-ceramic','h11',34.1,7.6)]:
    enc(R+src+'.mp4',name+'.mp4',P,pre=['-ss',str(s),'-t',str(d)])
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(s+0.6),'-i',R+src+'.mp4','-frames:v','1','-vf',P,'-c:v','libwebp','-quality','92',OUT+f'video/{name}-poster.webp'],check=True)
enc(R+'h5.mp4','detail-film.mp4',P)
enc(R+'h2.mp4','clubsport.mp4',L,pre=['-t','43.4'])
def still(name,src,t,vf): subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',R+src+'.mp4','-frames:v','1','-vf',vf,'-c:v','libwebp','-quality','92',OUT+f'img/{name}.webp'],check=True)
for n,s,t in [('g-gti8-black','h4',5.4),('g-red-gti','h6',38.5),('g-polish','h3',23.5),('g-ceramic-suv','h11',52.5),('g-bmw-blue','h10',48.3),('g-gti75-white','h1',8.15),('g-event-foam','h9',5.0),('g-steam','h5',10.0),('g-inspection','h3',45.0),('s-van','h9',13.6),('s-staff','h7',1.5),('s-microfibre','h5',38.6),('s-foamcar','h6',19.8),('cmp-before','h4',2.0),('cmp-after','h4',5.5),('poster-film','h5',1.0)]: still(n,s,t,P)
for n,s,t in [('g-clubsport-rear','h2',30.6),('g-clubsport-wheel','h2',14.0),('poster-angles','h2',33.5),('poster-clubsport','h2',9.0)]: still(n,s,t,L)
still('g-foam','h12',8.0,f'crop=iw:ih*0.9:0:0,scale=1920:-2:flags=lanczos,{SH}')
def up(src,name):
    im=cv2.imread(src); im=cv2.resize(im,(1920,972),interpolation=cv2.INTER_LANCZOS4); bl=cv2.GaussianBlur(im,(0,0),1.2); im=cv2.addWeighted(im,1.45,bl,-0.45,0); cv2.imwrite(OUT+f'img/{name}.webp',im,[cv2.IMWRITE_WEBP_QUALITY,92])
EV=sorted(glob.glob('/tmp/hx/EV/0*.png')); C=sorted(glob.glob('/tmp/hx/C/0*.png')); F=sorted(glob.glob('/tmp/hx/F/0*.png'))
up(EV[60],'poster-hero'); up(EV[60],'og-cover'); up(EV[150],'g-night'); up(C[8],'g-taillight'); up(F[15],'poster-finale')
print('stills done')
