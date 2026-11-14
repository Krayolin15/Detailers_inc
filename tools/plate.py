"""Blank the custom 'RICIN.' show plate in the night footage and crop the corner watermark.
Template-matches the plate across scales, then paints a feathered dark patch over it."""
import cv2, numpy as np, subprocess, glob, os, shutil, sys
V='/mnt/user-data/uploads/91e81109-WhatsApp_Video_2026-11-14_at_14.25.23.mp4'
def grab(t, w=1280):
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',V,'-frames:v','1','-vf',f'crop=iw:ih*0.9:0:0,scale={w}:-2:flags=lanczos','/tmp/hx/_g.png'],check=True); return cv2.imread('/tmp/hx/_g.png')
ref=grab(120.0)
TPL=cv2.cvtColor(ref[400:452, 520:670], cv2.COLOR_BGR2GRAY)
cv2.imwrite('/home/claude/shots/tpl.png', ref[400:452,520:670])
SCALES=np.geomspace(0.14,1.25,26)
def find(gray, prev=None):
    best=(0,None)
    for s in SCALES:
        t=cv2.resize(TPL,None,fx=s,fy=s,interpolation=cv2.INTER_AREA)
        if t.shape[0]<6 or t.shape[1]>gray.shape[1]: continue
        if prev is not None and not (0.7 < t.shape[1]/prev[2] < 1.45): continue
        roi=gray; ox=oy=0
        if prev is not None:
            x,y,w,h=prev; m=int(max(60,w*1.2)); x0,y0=max(0,x-m),max(0,y-m); x1,y1=min(gray.shape[1],x+w+m),min(gray.shape[0],y+h+m)
            roi=gray[y0:y1,x0:x1]; ox,oy=x0,y0
            if roi.shape[0]<t.shape[0] or roi.shape[1]<t.shape[1]: continue
        r=cv2.matchTemplate(roi,t,cv2.TM_CCOEFF_NORMED); _,mx,_,loc=cv2.minMaxLoc(r)
        if mx>best[0]: best=(mx,(loc[0]+ox,loc[1]+oy,t.shape[1],t.shape[0]))
    return best
def paint(img, box):
    x,y,w,h=box; px,py=int(w*0.10)+2,int(h*0.18)+2
    x0,y0,x1,y1=max(0,x-px),max(0,y-py),min(img.shape[1],x+w+px),min(img.shape[0],y+h+py)
    mask=np.zeros(img.shape[:2],np.float32); cv2.rectangle(mask,(x0,y0),(x1,y1),1,-1)
    k=max(3,int(h*0.25))|1; mask=cv2.GaussianBlur(mask,(k,k),0)[...,None]
    patch=np.full_like(img,(14,13,12)); return (img*(1-mask)+patch*mask).astype(np.uint8)
def process(seg, fps, tag, thr=0.42):
    d=f'/tmp/hx/{tag}/'; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
    s,e=seg
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(s),'-t',str(e-s),'-i',V,'-vf',f'fps={fps},crop=iw:ih*0.9:0:0,scale=1280:-2:flags=lanczos',d+'%04d.png'],check=True)
    fs=sorted(glob.glob(d+'*.png')); prev=None; log=[]
    # seed from the frame with the strongest global match, then track outwards
    grays=[cv2.cvtColor(cv2.imread(f),cv2.COLOR_BGR2GRAY) for f in fs]
    seeds=[find(g) for g in grays[::max(1,len(grays)//8)]]; si=int(np.argmax([s_[0] for s_ in seeds]))*max(1,len(grays)//8)
    boxes=[None]*len(fs); sc=[0]*len(fs)
    sc[si],boxes[si]=find(grays[si])
    for rng in (range(si+1,len(fs)), range(si-1,-1,-1)):
        prev=boxes[si]
        for i in rng:
            m,b=find(grays[i],prev)
            if b is not None and m>thr: boxes[i],sc[i],prev=b,m,b
            else: sc[i]=m                      # lost: keep last position as the search anchor
    n=0
    for f,b in zip(fs,boxes):
        if b is not None: cv2.imwrite(f, paint(cv2.imread(f), b)); n+=1
    print(tag, len(fs),'frames, plate blanked in',n,'| seed score %.2f'%sc[si],'| min/med score %.2f/%.2f'%(min(sc),float(np.median(sc))))
    return fs, boxes
if __name__=='__main__':
    out={}
    for tag,seg,fps in [('A',(78.1,80.8),8),('B',(97.0,99.55),6),('C',(94.15,96.8),6),('D',(103.0,105.85),6),('E',(106.0,122.1),4),('F',(81.1,84.8),8)]:
        if tag in ('A','C','F'):   # distant / rear / no front plate: watermark crop only
            d=f'/tmp/hx/{tag}/'; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
            subprocess.run(['ffmpeg','-v','error','-y','-ss',str(seg[0]),'-t',str(seg[1]-seg[0]),'-i',V,'-vf',f'fps={fps},crop=iw:ih*0.9:0:0,scale=1280:-2:flags=lanczos',d+'%04d.png'],check=True)
            print(tag,len(glob.glob(d+'*.png')),'frames (crop only)')
        else: out[tag]=process(seg,fps,tag)
    # review sheet: every 6th processed frame of B, D, E
    tiles=[]
    for tag in 'BDE':
        fs=sorted(glob.glob(f'/tmp/hx/{tag}/*.png'))
        for f in fs[::max(1,len(fs)//6)][:6]: tiles.append(cv2.resize(cv2.imread(f),(426,216)))
    rows=[np.hstack(tiles[i:i+6]) for i in range(0,len(tiles),6)]
    cv2.imwrite('/home/claude/shots/plate_review.jpg', np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY,85])
