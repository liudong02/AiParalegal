#!/usr/bin/env python3
"""
法院官网诉讼指南 AI 自动提取工具

Pipeline:
  URL → HTTP Fetch → HTML 清洗 → Claude API 结构化提取 → CaseFlow JSON

用法:
  python3 extract_flow.py --url <URL> --case-type labor --city 北京 --province 北京
  python3 extract_flow.py --file guide.html --case-type divorce --city 上海 --province 上海
  python3 extract_flow.py --urls-file urls.json   # 批量模式

需要环境变量：
  ANTHROPIC_API_KEY=sk-ant-xxx
"""

import os
import sys
import json
import time
import argparse
import re
from pathlib import Path
from datetime import date

import requests
from bs4 import BeautifulSoup
import anthropic

# ── 配置 ──────────────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "zh-CN,zh;q=0.9",
}

REQUEST_TIMEOUT = 15
REQUEST_DELAY   = 1.5   # 礼貌性限速，每次请求间隔秒数

# Claude 模型（cost-efficient 足够用于提取任务）
CLAUDE_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6")

# 输出目录（相对于脚本位置）
OUTPUT_DIR = Path(__file__).parent.parent / "src" / "data" / "flows"

# ── 已知北京相关 URL（按案件类型分组）─────────────────────────────────────────

BEIJING_URLS = {
    "labor": [
        # 北京市人力资源和社会保障局 - 劳动仲裁指南
        "https://rsj.beijing.gov.cn/",
        # 北京法院网 - 劳动争议诉讼指南
        "https://www.bjcourt.gov.cn/",
    ],
    "divorce": [
        # 北京法院网 - 家事案件诉讼须知
        "https://www.bjcourt.gov.cn/",
    ],
    "contract": [
        # 北京法院网 - 合同纠纷
        "https://www.bjcourt.gov.cn/",
    ],
}

# ── JSON Schema（给 Claude 的输出格式定义）──────────────────────────────────

FLOW_SCHEMA = """
{
  "case_type": "labor | divorce | contract | ...",
  "city": "城市名",
  "province": "省份名",
  "updated_at": "YYYY-MM-DD",
  "nodes": [
    {
      "id": "n01",
      "step": 1,
      "name": "环节名称",
      "nodeType": "start | normal | decision | end",
      "duration": "预估时间描述",
      "duration_legal": "法定时限描述（可选）",
      "materials": [
        {
          "name": "材料名称",
          "required": true,
          "note": "补充说明（可选）"
        }
      ],
      "key_points": ["注意事项1", "注意事项2"],
      "warnings": ["风险提示1"]
    }
  ],
  "edges": [
    {
      "from": "n01",
      "to": "n02",
      "label": "连线说明（可选）",
      "style": "normal | success | warning | dashed"
    }
  ]
}
"""

EXTRACTION_PROMPT = """你是一个法律流程数据提取专家。请从以下法院/仲裁委官网文本中，提取完整的案件处理流程，输出为严格 JSON 格式。

【提取要求】
1. 流程节点（nodes）：按处理顺序提取每个环节，包括：
   - step：步骤序号（整数）
   - name：环节名称（简洁，如"申请劳动仲裁"）
   - nodeType：起点=start，普通环节=normal，存在分支决策=decision，终止/执行=end
   - duration：实际预估时间（用口语描述，如"当天"、"约30日内"）
   - duration_legal：法定时限（如有，格式如"受理后5个工作日内"）
   - materials：每步所需材料，注明是否必须（required:true/false），附说明
   - key_points：3-6条关键注意事项，结合地域特点
   - warnings：1-2条风险提示（重要的才写，可为空数组）

2. 连线（edges）：
   - 顺序推进用 style:"normal"
   - 接受结果/推进执行用 style:"success"
   - 不服结果/另行处理用 style:"warning"
   - 上诉/申诉路径用 style:"dashed"
   - 有分支时 label 写清楚条件

3. nodeType 使用规则：
   - 第一个节点通常是 start
   - 裁决/判决后存在多条路径的节点是 decision
   - 申请执行、案件结束节点是 end
   - 其余是 normal

4. 注意地域特点：提取文本中北京特有的规定、流程差异、管辖规则等

【目标案件类型】{case_type_label}
【目标城市】{city}

【原始文本】
{text}

【输出要求】
- 只输出 JSON，不要有任何解释文字
- JSON 从 {{ 开始，到 }} 结束
- 字符串使用双引号
- 如原文信息不足以填充某字段，填入合理的默认值
"""

# ── 工具函数 ──────────────────────────────────────────────────────────────────

def fetch_url(url: str) -> str | None:
    """抓取 URL，返回原始 HTML；失败返回 None"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding or "utf-8"
        print(f"  [✓] 抓取成功: {url} ({len(resp.text):,} 字节)")
        return resp.text
    except requests.RequestException as e:
        print(f"  [✗] 抓取失败: {url} → {e}")
        return None


def clean_html(html: str) -> str:
    """
    HTML → 纯文本，保留结构性信息（标题、列表）
    去除导航栏、页脚、JS、广告等噪声
    """
    soup = BeautifulSoup(html, "html.parser")

    # 去除无用标签
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "aside", "iframe", "form", "button", "img"]):
        tag.decompose()

    # 尝试定位正文区域（常见 class/id 命名）
    content_selectors = [
        "article", "main", ".content", ".main-content",
        "#content", ".article-content", ".page-content",
        ".zw", ".nr", ".article",   # 政务网站常用
    ]
    content = None
    for sel in content_selectors:
        found = soup.select_one(sel)
        if found and len(found.get_text(strip=True)) > 200:
            content = found
            break
    if content is None:
        content = soup.body or soup

    # 提取文本，保留换行结构
    lines = []
    for elem in content.find_all(["h1", "h2", "h3", "h4", "p", "li", "td", "div"]):
        text = elem.get_text(separator=" ", strip=True)
        if text and len(text) > 5:
            lines.append(text)

    full_text = "\n".join(lines)

    # 清理多余空行
    full_text = re.sub(r'\n{3,}', '\n\n', full_text)
    full_text = re.sub(r'[ \t]{2,}', ' ', full_text)

    return full_text.strip()


def chunk_text(text: str, max_chars: int = 12000) -> list[str]:
    """
    将长文本按段落分块，避免超出 Claude 上下文限制
    超过 max_chars 时分块，每块保留前后重叠
    """
    if len(text) <= max_chars:
        return [text]

    paragraphs = text.split('\n\n')
    chunks, current, current_len = [], [], 0

    for para in paragraphs:
        para_len = len(para)
        if current_len + para_len > max_chars and current:
            chunks.append('\n\n'.join(current))
            # 保留最后2段作为上下文重叠
            current = current[-2:] if len(current) >= 2 else current
            current_len = sum(len(p) for p in current)
        current.append(para)
        current_len += para_len

    if current:
        chunks.append('\n\n'.join(current))

    return chunks


CASE_TYPE_LABELS = {
    "labor": "劳动争议（劳动仲裁 + 诉讼）",
    "divorce": "离婚诉讼（含财产分割、子女抚养）",
    "contract": "合同纠纷民事诉讼",
    "administrative": "行政诉讼",
    "enforcement": "强制执行申请",
}


def extract_with_claude(text: str, case_type: str, city: str, province: str) -> dict | None:
    """调用 Claude API 提取结构化流程数据"""
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    case_label = CASE_TYPE_LABELS.get(case_type, case_type)
    chunks = chunk_text(text)

    print(f"  [→] 文本长度 {len(text):,} 字符，分为 {len(chunks)} 块处理")

    # 如果多块，先合并关键信息再提取
    if len(chunks) > 1:
        print("  [→] 多块模式：先合并摘要，再整体提取")
        combined = summarize_chunks(client, chunks, case_label, city)
    else:
        combined = chunks[0]

    prompt = EXTRACTION_PROMPT.format(
        case_type_label=case_label,
        city=city,
        text=combined,
    )

    print(f"  [→] 调用 Claude 提取结构化数据...")
    try:
        msg = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip()

        # 去除 markdown 代码块包裹
        raw = re.sub(r'^```(?:json)?\s*', '', raw)
        raw = re.sub(r'\s*```$', '', raw)
        raw = raw.strip()

        # 提取 JSON 对象
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        if not json_match:
            print("  [✗] Claude 输出中未找到有效 JSON")
            print(f"  原始输出:\n{raw[:500]}")
            return None

        json_str = json_match.group()
        try:
            data = json.loads(json_str)
        except json.JSONDecodeError:
            # 尝试修复常见问题：末尾多余逗号
            json_str = re.sub(r',\s*}', '}', json_str)
            json_str = re.sub(r',\s*]', ']', json_str)
            try:
                data = json.loads(json_str)
            except json.JSONDecodeError as e2:
                print(f"  [✗] JSON 解析失败: {e2}")
                print(f"  原始输出片段:\n{raw[:800]}")
                return None

        # 补充元数据
        data["case_type"] = case_type
        data["city"] = city
        data["province"] = province
        data["updated_at"] = str(date.today())

        return data

    except json.JSONDecodeError as e:
        print(f"  [✗] JSON 解析失败: {e}")
        return None
    except anthropic.APIError as e:
        print(f"  [✗] Claude API 错误: {e}")
        return None


def summarize_chunks(client: anthropic.Anthropic, chunks: list[str],
                     case_label: str, city: str) -> str:
    """多块时先让 Claude 提取每块关键信息，再合并"""
    summaries = []
    for i, chunk in enumerate(chunks):
        print(f"    摘要第 {i+1}/{len(chunks)} 块...")
        msg = client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=1500,
            messages=[{
                "role": "user",
                "content": (
                    f"从以下法院官网文本中提取与【{city} {case_label}】相关的信息摘要，"
                    f"重点保留：流程步骤、所需材料、时限规定、地域特有规定。\n\n{chunk}"
                )
            }],
        )
        summaries.append(msg.content[0].text.strip())
        time.sleep(0.5)

    return "\n\n---\n\n".join(summaries)


def validate_flow(data: dict) -> list[str]:
    """简单校验提取结果的完整性，返回问题列表"""
    issues = []
    nodes = data.get("nodes", [])
    edges = data.get("edges", [])

    if len(nodes) < 3:
        issues.append(f"节点数量过少（{len(nodes)} 个），可能提取不完整")

    for i, node in enumerate(nodes):
        if not node.get("name"):
            issues.append(f"节点 {i+1} 缺少名称")
        if not node.get("materials"):
            issues.append(f"节点「{node.get('name', i+1)}」没有材料信息")
        if not node.get("key_points"):
            issues.append(f"节点「{node.get('name', i+1)}」没有注意事项")

    node_ids = {n["id"] for n in nodes}
    for edge in edges:
        if edge.get("from") not in node_ids:
            issues.append(f"边 from={edge.get('from')} 引用了不存在的节点 ID")
        if edge.get("to") not in node_ids:
            issues.append(f"边 to={edge.get('to')} 引用了不存在的节点 ID")

    return issues


def save_flow(data: dict, output_path: Path | None = None) -> Path:
    """保存为 TypeScript 模块文件（兼容前端 import）"""
    case_type = data["case_type"]
    city = data["city"].replace(" ", "_")

    if output_path is None:
        output_path = OUTPUT_DIR / f"{case_type}_{city}_extracted.ts"

    output_path.parent.mkdir(parents=True, exist_ok=True)

    ts_content = (
        "import type { CaseFlow } from '../../types';\n\n"
        "const flow: CaseFlow = "
        + json.dumps(data, ensure_ascii=False, indent=2)
        + ";\n\nexport default flow;\n"
    )

    output_path.write_text(ts_content, encoding="utf-8")
    print(f"  [✓] 已保存: {output_path}")
    return output_path


# ── 主流程 ────────────────────────────────────────────────────────────────────

def process_single(url: str | None, file_path: str | None,
                   case_type: str, city: str, province: str,
                   output: str | None = None) -> bool:
    print(f"\n{'='*60}")
    print(f"案件类型: {case_type}  城市: {city}  省份: {province}")

    # 1. 获取原始内容
    if file_path:
        print(f"读取本地文件: {file_path}")
        raw = Path(file_path).read_text(encoding="utf-8")
        is_html = file_path.endswith((".html", ".htm"))
    elif url:
        print(f"抓取 URL: {url}")
        raw = fetch_url(url)
        if raw is None:
            return False
        is_html = True
        time.sleep(REQUEST_DELAY)
    else:
        print("从 stdin 读取...")
        raw = sys.stdin.read()
        is_html = False

    # 2. 清洗
    if is_html:
        print("清洗 HTML...")
        text = clean_html(raw)
    else:
        text = raw

    print(f"清洗后文本长度: {len(text):,} 字符")

    if len(text) < 100:
        print("[✗] 文本过短，可能抓取失败或内容为空")
        return False

    # 3. Claude 提取
    data = extract_with_claude(text, case_type, city, province)
    if data is None:
        return False

    # 4. 校验
    issues = validate_flow(data)
    if issues:
        print(f"\n  [!] 校验发现 {len(issues)} 个问题：")
        for issue in issues:
            print(f"     - {issue}")
        print("  建议人工检查后再使用")
    else:
        print("  [✓] 校验通过")

    # 5. 保存
    out_path = Path(output) if output else None
    save_flow(data, out_path)

    # 同时输出 JSON 供调试
    json_path = out_path.with_suffix(".json") if out_path else \
        OUTPUT_DIR / f"{case_type}_{city}_extracted.json"
    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  [✓] 调试 JSON: {json_path}")

    return True


def process_batch(urls_file: str) -> None:
    """批量模式：从 JSON 文件读取任务列表"""
    tasks = json.loads(Path(urls_file).read_text(encoding="utf-8"))
    success, fail = 0, 0
    for task in tasks:
        ok = process_single(
            url=task.get("url"),
            file_path=task.get("file"),
            case_type=task["case_type"],
            city=task["city"],
            province=task["province"],
            output=task.get("output"),
        )
        if ok:
            success += 1
        else:
            fail += 1
        time.sleep(REQUEST_DELAY)

    print(f"\n批量完成：成功 {success} / 失败 {fail}")


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="法院官网诉讼指南 AI 自动提取工具")
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--url",        help="抓取指定 URL")
    source.add_argument("--file",       help="读取本地 HTML/文本文件")
    source.add_argument("--urls-file",  help="批量模式：JSON 任务列表文件")

    parser.add_argument("--case-type",  default="labor",
                        choices=list(CASE_TYPE_LABELS.keys()),
                        help="案件类型")
    parser.add_argument("--city",       default="北京", help="城市名称")
    parser.add_argument("--province",   default="北京", help="省份名称")
    parser.add_argument("--output",     help="输出文件路径（.ts）")

    args = parser.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("[✗] 请设置环境变量 ANTHROPIC_API_KEY")
        sys.exit(1)

    if args.urls_file:
        process_batch(args.urls_file)
    else:
        ok = process_single(
            url=args.url,
            file_path=args.file,
            case_type=args.case_type,
            city=args.city,
            province=args.province,
            output=args.output,
        )
        sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
