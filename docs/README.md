# KuHu Apparels — Engineering Documentation

> **Version:** 1.0  
> **Last Updated:** 5 July 2026  
> **Target MVP Launch:** 10 August 2026  
> **Developer:** Single developer (11 yr Frontend → learning Backend)

---

## Purpose

This documentation serves as the single source of truth for the KuHu Apparels e-commerce platform. It covers architecture, design decisions, UI system, API conventions, deployment, and launch readiness.

## Documentation Map

```
docs/
├── README.md                  # This file — entry point & navigation
├── PROJECT_CONTEXT.md         # Full project context, constraints, goals
├── CHANGELOG.md               # Version history & change log
└── handbook/
    ├── 01_Project_Vision.md   # Vision, mission, brand identity
    ├── 02_Roadmap.md          # Weekly milestones → 10 Aug
    ├── 03_Architecture_Decisions.md  # Lightweight ADRs
    ├── 04_UI_Design_Bible.md  # Complete design system & UI spec
    ├── 05_API_Conventions.md  # API standards, patterns, examples
    ├── 06_Deployment_Guide.md # Local & production deployment
    └── 07_Launch_Checklist.md # Pre-launch verification
```

## Quick Links

| Document | Purpose |
|---|---|
| [Project Context](./PROJECT_CONTEXT.md) | Why this project exists, constraints, goals |
| [Project Vision](./handbook/01_Project_Vision.md) | Brand vision & product scope |
| [Roadmap](./handbook/02_Roadmap.md) | Weekly milestones until MVP |
| [Architecture Decisions](./handbook/03_Architecture_Decisions.md) | Key technical decisions (ADRs) |
| [UI Design Bible](./handbook/04_UI_Design_Bible.md) | Complete design system specification |
| [API Conventions](./handbook/05_API_Conventions.md) | API standards across all endpoints |
| [Deployment Guide](./handbook/06_Deployment_Guide.md) | How to run & deploy everything |
| [Launch Checklist](./handbook/07_Launch_Checklist.md) | Pre-flight checks before go-live |

## Status Summary

| Area | Status |
|---|---|
| Project Foundation | ✅ Complete |
| Accounts (Backend) | ⏳ In Progress |
| Products (Backend) | ✅ Complete |
| Cart (Backend) | ❌ Not Started |
| Orders (Backend) | ❌ Not Started |
| Payments (Backend) | ❌ Not Started |
| Reviews (Backend) | ❌ Not Started |
| Coupons (Backend) | ❌ Not Started |
| Frontend Scaffold | ✅ Complete |
| Frontend Pages | ⏳ In Progress |
| Docker / Deployment | ❌ Not Started |
| Tests | ❌ Not Started |

## How to Use This Documentation

1. **New to the project?** Start with [Project Context](./PROJECT_CONTEXT.md) and [Project Vision](./handbook/01_Project_Vision.md).
2. **Building a feature?** Check the [Architecture Decisions](./handbook/03_Architecture_Decisions.md) and [API Conventions](./handbook/05_API_Conventions.md).
3. **Designing a UI?** Refer to the [UI Design Bible](./handbook/04_UI_Design_Bible.md).
4. **Deploying?** Follow the [Deployment Guide](./handbook/06_Deployment_Guide.md).
5. **Launching?** Run through the [Launch Checklist](./handbook/07_Launch_Checklist.md).

---

*This documentation is a living document. Update it as decisions are made and the project evolves.*
