#!/usr/bin/env python3
import os, re, json, anthropic
from pathlib import Path
from bs4 import BeautifulSoup

html = Path('sample_beijing_labor.html').read_text()
soup = BeautifulSoup(html, 'html.parser')
for tag in soup(['script','style','nav','footer']):
    tag.decompose()
text = soup.get_text(separator=' ', strip=True)
text = re.sub(r'[ \t]{2,}', ' ', text)
print(f'文本长度: {len(text)}')

client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])

prompt = f"""只输出JSON，禁止使用markdown代码块，禁止任何解释文字。
从以下文本提取北京劳动争议处理流程，严格输出如下格式：

{{"case_type":"labor","city":"北京","province":"北京","updated_at":"2025-05-25","nodes":[{{"id":"n01","step":1,"name":"环节名","nodeType":"start","duration":"时间","duration_legal":"法定时限","materials":[{{"name":"材料","required":true,"note":"说明"}}],"key_points":["要点"],"warnings":["风险"]}}],"edges":[{{"from":"n01","to":"n02","label":"","style":"normal"}}]}}

文本：
{text}"""

msg = client.messages.create(
    model=os.environ.get('ANTHROPIC_MODEL', 'claude-sonnet'),
    max_tokens=8192,
    messages=[{'role': 'user', 'content': prompt}],
)
raw = msg.content[0].text.strip()
# 去除可能的代码块标记
raw = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.MULTILINE)
raw = re.sub(r'\s*```\s*$', '', raw, flags=re.MULTILINE)
raw = raw.strip()

print(f'stop_reason: {msg.stop_reason}  output_tokens: {msg.usage.output_tokens}')
print(f'输出前200字符:\n{raw[:200]}')
Path('/tmp/claude_raw.txt').write_text(raw)

try:
    d = json.loads(raw)
    print(f'\n解析成功！nodes数量: {len(d.get("nodes",[]))}  edges数量: {len(d.get("edges",[]))}')
    print('节点列表:')
    for n in d.get('nodes', []):
        print(f'  {n.get("id")} step={n.get("step")} {n.get("name")} [{n.get("nodeType")}]  材料:{len(n.get("materials",[]))}条')
except json.JSONDecodeError as e:
    print(f'\n解析失败: {e}')
    pos = e.pos
    print(f'出错位置附近: ...{raw[max(0,pos-50):pos+50]}...')
