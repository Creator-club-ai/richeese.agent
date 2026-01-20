"""
VTT 파일을 깔끔한 텍스트로 변환 (중복 제거)
"""
import re

# VTT 파일 읽기
with open('transcript.en.vtt', 'r', encoding='utf-8') as f:
    content = f.read()

# WEBVTT 헤더 제거
text = re.sub(r'WEBVTT.*?\n\n', '', content, flags=re.DOTALL)

# 타임스탬프 제거
text = re.sub(r'\d{2}:\d{2}:\d{2}\.\d{3} --\> \d{2}:\d{2}:\d{2}\.\d{3}.*?\n', '', text)

# HTML 태그 제거
text = re.sub(r'<[^>]+>', '', text)

# 빈 줄 정리
lines = text.strip().split('\n')
cleaned_lines = []
prev_line = ""

for line in lines:
    line = line.strip()
    if line and line != prev_line:  # 중복 제거
        cleaned_lines.append(line)
        prev_line = line

# 최종 텍스트
final_text = '\n\n'.join(cleaned_lines)

# 저장
with open('David Sacks on Unicorn Ideas.txt', 'w', encoding='utf-8') as f:
    f.write(final_text)

print(f"✅ Cleaned transcript saved!")
print(f"Total lines: {len(cleaned_lines)}")
