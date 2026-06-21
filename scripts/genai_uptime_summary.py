#!/usr/bin/env python3
"""Generate an uptime incident summary from JSON events.

Default offline mode is deterministic and does not call external services.
Optional Bedrock mode calls Amazon Bedrock Converse API when boto3 and AWS credentials are available.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from statistics import mean
from typing import Any


def load_events(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError("Input JSON must be a list of uptime events")
    return [event for event in data if isinstance(event, dict)]


def build_metrics(events: list[dict[str, Any]]) -> dict[str, Any]:
    total = len(events)
    failures = [event for event in events if event.get("status") == "FAILURE"]
    successes = total - len(failures)
    response_times = [int(event.get("responseTime", 0) or 0) for event in events]
    error_types = Counter(event.get("errorType") or "Unknown" for event in failures)

    return {
        "total_checks": total,
        "successes": successes,
        "failures": len(failures),
        "uptime_percent": round((successes / total) * 100, 2) if total else 0,
        "average_response_time_ms": round(mean(response_times), 2) if response_times else 0,
        "top_error_types": dict(error_types.most_common(5)),
        "latest_failure": failures[-1] if failures else None,
    }


def offline_summary(metrics: dict[str, Any]) -> str:
    if metrics["failures"] == 0:
        risk = "Low"
        action = "No immediate action required. Continue monitoring normal uptime and latency trends."
    elif metrics["uptime_percent"] >= 95:
        risk = "Medium"
        action = "Review the latest failed check, confirm if the failure was transient, and monitor the next few scheduled checks."
    else:
        risk = "High"
        action = "Treat this as an active incident. Review application, network, DNS, CDN, and backend service health immediately."

    top_errors = ", ".join(f"{k}: {v}" for k, v in metrics["top_error_types"].items()) or "None"
    latest = metrics.get("latest_failure") or {}
    latest_error = latest.get("errorMessage", "No recent failure")

    return "\n".join(
        [
            "# Uptime Incident Summary",
            "",
            f"Risk Level: {risk}",
            f"Total Checks: {metrics['total_checks']}",
            f"Successful Checks: {metrics['successes']}",
            f"Failed Checks: {metrics['failures']}",
            f"Uptime: {metrics['uptime_percent']}%",
            f"Average Response Time: {metrics['average_response_time_ms']}ms",
            f"Top Error Types: {top_errors}",
            f"Latest Failure: {latest_error}",
            "",
            f"Recommended Action: {action}",
        ]
    )


def bedrock_summary(metrics: dict[str, Any], model_id: str, region: str) -> str:
    try:
        import boto3  # type: ignore
    except ImportError as exc:
        raise RuntimeError("boto3 is required for Bedrock mode. Install boto3 or use offline mode.") from exc

    client = boto3.client("bedrock-runtime", region_name=region)
    prompt = (
        "You are a DevOps incident analyst. Summarize these uptime metrics in a concise incident note. "
        "Include risk level, likely cause category, and next action. Do not invent facts.\n\n"
        f"Metrics JSON:\n{json.dumps(metrics, indent=2)}"
    )

    response = client.converse(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": prompt}]}],
        inferenceConfig={"maxTokens": 500, "temperature": 0.2},
    )
    return response["output"]["message"]["content"][0]["text"]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate an uptime incident summary")
    parser.add_argument("--input", required=True, type=Path, help="Path to JSON uptime events")
    parser.add_argument("--provider", choices=["offline", "bedrock"], default="offline")
    parser.add_argument("--model-id", default="anthropic.claude-3-haiku-20240307-v1:0")
    parser.add_argument("--region", default="us-west-2")
    args = parser.parse_args()

    events = load_events(args.input)
    metrics = build_metrics(events)

    if args.provider == "bedrock":
      print(bedrock_summary(metrics, args.model_id, args.region))
    else:
      print(offline_summary(metrics))


if __name__ == "__main__":
    main()
