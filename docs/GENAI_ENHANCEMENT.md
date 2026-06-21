# Optional GenAI Enhancement

## Purpose

The GenAI enhancement is designed for AI-assisted operations. It summarizes uptime events into a simple incident or daily health report.

## What it summarizes

- Number of total checks
- Success and failure count
- Uptime percentage
- Average response time
- Main error types
- Recommended next action

## Offline mode

Offline mode does not call any external AI model. It creates a deterministic summary from JSON event data.

```bash
python scripts/genai_uptime_summary.py --input docs/sample-uptime-events.json
```

## Amazon Bedrock mode

Bedrock mode sends a concise prompt to Amazon Bedrock Converse API. This requires AWS permissions for `bedrock:InvokeModel` and access to the selected model.

```bash
python scripts/genai_uptime_summary.py \
  --input docs/sample-uptime-events.json \
  --provider bedrock \
  --model-id anthropic.claude-3-haiku-20240307-v1:0
```

## Interview explanation

I added this GenAI helper to show how operations teams can turn raw monitoring events into short incident summaries. Instead of reading multiple CloudWatch logs and DynamoDB records manually, the script can summarize what failed, how often it failed, and what action should be taken next.

## Security note

Do not send sensitive URLs, headers, tokens, or private customer data to any AI service. Keep prompts minimal and sanitize operational data before sending it to a model.
