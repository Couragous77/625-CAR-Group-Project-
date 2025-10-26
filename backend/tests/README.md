# Tests directory for backend

This directory contains pytest tests for the Budget CAR backend API.

## Running Tests

```bash
# Inside backend container
pytest

# With verbose output
pytest -v

# With coverage
pytest --cov=app
```

## Test Structure

- `test_*.py` - Test files (pytest auto-discovery)
- `conftest.py` - Shared fixtures and configuration
