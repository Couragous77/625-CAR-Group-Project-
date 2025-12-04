from typing import Optional
import logging

logger = logging.getLogger(__name__)


def send_email_notification(
    to_email: str,
    subject: str,
    body: str,
    from_email: Optional[str] = None,
) -> None:
    sender = from_email or "no-reply@budgetcar.local"
    logger.info("Sending email notification")
    logger.info("From: %s", sender)
    logger.info("To: %s", to_email)
    logger.info("Subject: %s", subject)
    logger.info("Body:\n%s", body)
