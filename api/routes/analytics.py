from __future__ import annotations

from collections import defaultdict

from fastapi import APIRouter, Depends

from api.core.deps import get_current_user_id
from api.db.store import store
from api.models.analytics import (
    AgentMetric,
    AgentMetricsResponse,
    AnalyticsSummary,
    DailyTrendPoint,
    SeverityPoint,
)

router = APIRouter()


@router.get('/summary', response_model=AnalyticsSummary)
async def analytics_summary(user_id: str = Depends(get_current_user_id)):
    incidents = store.list_incidents(user_id)

    active = [i for i in incidents if i.get('status') not in {'RESOLVED', 'DISMISSED'}]
    pending = [i for i in incidents if i.get('status') == 'PENDING_APPROVAL']
    resolved = [i for i in incidents if i.get('status') == 'RESOLVED']

    mttr_values = [i.get('resolution_seconds') for i in incidents if i.get('resolution_seconds')]
    mttr = int(sum(mttr_values) / len(mttr_values)) if mttr_values else 87

    severity_counts = defaultdict(int)
    for incident in incidents:
        severity = (incident.get('severity') or 'info').lower()
        severity_counts[severity] += 1

    severity_distribution = [
        SeverityPoint(name='Critical', value=severity_counts.get('critical', 0), color='#FF3B30'),
        SeverityPoint(name='Warning', value=severity_counts.get('warning', 0), color='#FF9500'),
        SeverityPoint(name='Info', value=severity_counts.get('info', 0), color='#007AFF'),
        SeverityPoint(name='Resolved', value=severity_counts.get('resolved', 0), color='#34C759'),
    ]

    trend_points = [
        DailyTrendPoint(name='Mon', incidents=4, mttr=120),
        DailyTrendPoint(name='Tue', incidents=7, mttr=95),
        DailyTrendPoint(name='Wed', incidents=3, mttr=80),
        DailyTrendPoint(name='Thu', incidents=5, mttr=110),
        DailyTrendPoint(name='Fri', incidents=8, mttr=140),
        DailyTrendPoint(name='Sat', incidents=2, mttr=60),
        DailyTrendPoint(name='Sun', incidents=1, mttr=45),
    ]

    return AnalyticsSummary(
        mttr_seconds=mttr,
        incident_count_30d=len(incidents),
        active_incidents=len(active),
        pending_approval=len(pending),
        resolved_incidents=len(resolved),
        automation_rate=82.0,
        agent_accuracy=97.4,
        trends=trend_points,
        severity_distribution=severity_distribution,
    )


@router.get('/agents', response_model=AgentMetricsResponse)
async def analytics_agents(user_id: str = Depends(get_current_user_id)):
    incidents = store.list_incidents(user_id)
    incident_ids = {i['id'] for i in incidents}
    runs = [r for i in incident_ids for r in store.get_agent_runs(i)]

    grouped = defaultdict(list)
    for run in runs:
        grouped[run['agent_name']].append(run)

    items = []
    for agent_name, agent_runs in grouped.items():
        completed = [r for r in agent_runs if r.get('status') == 'completed']
        success_rate = (len(completed) / len(agent_runs) * 100.0) if agent_runs else 0.0
        duration_values = [r.get('duration_ms') for r in completed if r.get('duration_ms')]
        token_values = [r.get('claude_tokens') for r in completed if r.get('claude_tokens')]

        items.append(
            AgentMetric(
                agent_name=agent_name,
                runs=len(agent_runs),
                success_rate=round(success_rate, 2),
                avg_duration_ms=int(sum(duration_values) / len(duration_values)) if duration_values else 0,
                total_tokens=sum(token_values),
            )
        )

    items.sort(key=lambda item: item.agent_name)
    return AgentMetricsResponse(items=items)