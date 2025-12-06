from typing import List, Dict, Optional


def find_low_funds_envelopes(
    envelopes: List[Dict],
    *,
    absolute_threshold: Optional[float] = None,
    percentage_threshold: Optional[float] = 0.1,
) -> List[Dict]:
    low_envelopes: List[Dict] = []

    for env in envelopes:
        balance = float(env.get("balance", 0.0))
        budgeted = float(env.get("budgeted", 0.0))

        if budgeted <= 0:
            if absolute_threshold is not None and balance <= absolute_threshold:
                low_envelopes.append(
                    {
                        **env,
                        "reason": f"Balance {balance:.2f} below absolute threshold {absolute_threshold:.2f}",
                    }
                )
            continue

        if absolute_threshold is not None:
            if balance <= absolute_threshold:
                low_envelopes.append(
                    {
                        **env,
                        "reason": f"Balance {balance:.2f} below absolute threshold {absolute_threshold:.2f}",
                    }
                )
            continue

        pct = balance / budgeted
        if pct <= percentage_threshold:
            low_envelopes.append(
                {
                    **env,
                    "reason": (
                        f"Balance {balance:.2f} is {pct:.0%} of budgeted {budgeted:.2f}, "
                        f"below threshold {percentage_threshold:.0%}"
                    ),
                }
            )

    return low_envelopes
