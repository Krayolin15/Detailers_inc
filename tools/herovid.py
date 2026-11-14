import plate, subprocess, glob, os
from assets import U, SRC, OUT
fs,boxes=plate.process((106.0,122.0),30,'EV')
print('frames',len(fs),'blanked',sum(b is not None for b in boxes))
subprocess.run(['ffmpeg','-v','error','-y','-framerate','30','-i','/tmp/hx/EV/%04d.png','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-profile:v','high','-movflags','+faststart',OUT+'video/hero.mp4'],check=True)
# detail film: stream copy, no re-encoding at all (audio track dropped)
subprocess.run(['ffmpeg','-v','error','-y','-i',U+SRC['v5'],'-an','-c:v','copy','-movflags','+faststart',OUT+'video/detail-film.mp4'],check=True)
# Clubsport film: trimmed before the end card, visually lossless
subprocess.run(['ffmpeg','-v','error','-y','-i',U+SRC['n2'],'-t','43.4','-an','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-profile:v','high','-movflags','+faststart',OUT+'video/clubsport.mp4'],check=True)
for f in ['hero','detail-film','clubsport']:
    p=OUT+f'video/{f}.mp4'; print(f, subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=width,height:format=duration','-of','csv=p=0',p],capture_output=True,text=True).stdout.replace('\n',' '), round(os.path.getsize(p)/1e6,1),'MB')
import cv2
cv2.imwrite(OUT+'img/poster-hero.webp', cv2.imread(fs[40]), [cv2.IMWRITE_WEBP_QUALITY,92])
subprocess.run(['ffmpeg','-v','error','-y','-ss','9.0','-i',U+SRC['n2'],'-frames:v','1','-c:v','libwebp','-quality','92',OUT+'img/poster-clubsport.webp'],check=True)
# check frames for a review
import numpy as np
t=[cv2.resize(cv2.imread(fs[i]),(426,216)) for i in (0,120,240,360,470)]
cv2.imwrite('/home/claude/shots/herovid.jpg', np.hstack(t))
