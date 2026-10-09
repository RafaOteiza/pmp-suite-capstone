# Rafael Oteiza — Diario de Reflexión Fase 2

**Versión:** V2.0

> Individual reflection written in English to comply with the Phase 2 formal requirement.

## 1. Have I completed the planned activities on time? What helped or hindered the work?

I completed most of the activities related to architecture, backend, database design, integration and technical coordination. The project progressed faster than the original plan in several functional areas, but the scope also became more complex.

The main facilitators were my previous knowledge of the real maintenance process, a clear understanding of the business rules, a centralized PostgreSQL model and the use of automated tests. The main difficulties were the growth of the scope, changes in custody rules, role separation, mobile-device validation and keeping the documentation synchronized with the actual implementation.

## 2. How have I addressed the difficulties?

I focused on reducing ambiguity instead of adding more features. We separated validation from physical confirmation, introduced a dedicated Laboratory Manager role, removed the operational wildcard from Admin, restricted Bridge to correlation and implemented clearer backend authorization.

I also prioritized isolated tests to protect the main database and converted technical decisions into explicit documentation so the team could continue working with the same rules.

## 3. How do I evaluate my work so far?

I evaluate my contribution positively. My strongest contribution has been connecting the operational problem with architecture, backend, data, security and project decisions.

I should improve the balance between implementation and documentation. When the code changes quickly, documentation can become obsolete. I also need to strengthen deployment automation, formal security testing and performance testing.

## 4. What questions remain?

My main question is how much technical evidence should be included in the final academic report versus kept as annexes in GitHub.

I would also like feedback on how much technical deployment evidence should be included in the final report versus maintained as reproducible documentation in the repository.

## 5. Should activities be redistributed?

The main responsibilities remain appropriate:

- I continue leading architecture, backend, database, integration and technical closure.
- Matías should lead academic documentation, traceability and evidence organization.
- Luis should lead Web/Mobile presentation quality, UX validation and visual evidence.

For the closing stage, all three members should participate in the final end-to-end validation and presentation rehearsal.

## 6. How do I evaluate teamwork?

The team has complementary strengths and this has been positive for the project. The project benefits from separating architecture/backend/data, requirements/documentation and frontend/UX responsibilities.

The main improvement opportunity is to keep Git evidence and documentation updated continuously, rather than consolidating everything near an evaluation milestone. A shorter review cycle between members would also reduce inconsistencies between implementation and academic documents.
