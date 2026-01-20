"""
YouTube 오디오 전사 자동화 스크립트
사용법: python transcribe_youtube.py "YouTube_URL"
"""
import subprocess
import sys
import os
from pathlib import Path

def download_audio(youtube_url, output_path="temp_audio"):
    """YouTube에서 오디오 다운로드"""
    print(f"⏬ YouTube 오디오 다운로드 중...")
    
    cmd = [
        "yt-dlp",
        "-x",  # 오디오만 추출
        "--audio-format", "mp3",
        "-o", f"{output_path}.%(ext)s",
        youtube_url
    ]
    
    subprocess.run(cmd, check=True)
    return f"{output_path}.mp3"

def transcribe_audio(audio_path, model="base", language="en"):
    """Whisper로 오디오 전사"""
    print(f"🎤 Whisper 전사 중... (모델: {model})")
    
    cmd = [
        "whisper",
        audio_path,
        "--model", model,
        "--language", language,
        "--output_format", "txt",
        "--output_dir", "."
    ]
    
    subprocess.run(cmd, check=True)
    
    # 생성된 텍스트 파일 경로
    base_name = Path(audio_path).stem
    txt_file = f"{base_name}.txt"
    
    return txt_file

def main():
    if len(sys.argv) < 2:
        print("사용법: python transcribe_youtube.py \"YouTube_URL\" [model] [language]")
        print("예시: python transcribe_youtube.py \"https://youtube.com/watch?v=xxxxx\" medium en")
        print("\n모델 옵션: tiny, base, small, medium, large (클수록 정확하지만 느림)")
        print("언어 옵션: en (영어), ko (한국어), 기타 ISO 코드")
        sys.exit(1)
    
    youtube_url = sys.argv[1]
    model = sys.argv[2] if len(sys.argv) > 2 else "base"
    language = sys.argv[3] if len(sys.argv) > 3 else "en"
    
    try:
        # 1. 오디오 다운로드
        audio_file = download_audio(youtube_url)
        
        # 2. 전사
        txt_file = transcribe_audio(audio_file, model, language)
        
        # 3. 임시 오디오 파일 삭제
        if os.path.exists(audio_file):
            os.remove(audio_file)
            print(f"🧹 임시 오디오 파일 삭제됨")
        
        print(f"\n✅ 전사 완료!")
        print(f"📄 파일 위치: {txt_file}")
        
        # 결과 미리보기
        with open(txt_file, 'r', encoding='utf-8') as f:
            preview = f.read()[:300]
            print(f"\n--- 미리보기 ---")
            print(preview + "...")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
