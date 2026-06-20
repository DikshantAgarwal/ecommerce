# E-Commerce Platform

Learning project: Django + DRF + PostgreSQL + React.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for full documentation.

## Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 15+

### Setup

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements/local.txt
python manage.py migrate
python manage.py runserver
```

### Environment

Copy `backend/.env.example` to `backend/.env` and fill in values.
