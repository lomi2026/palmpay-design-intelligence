# PalmPay体验设计Hub V1.0 — Database ER Model

## 1. 技术原则

- Database: PostgreSQL
- ORM: Prisma
- Cache: Redis
- Search MVP: PostgreSQL Full Text Search
- File storage: Cloudflare R2 through the S3-compatible API in production; a signed local filesystem adapter is permitted for development only
- Primary Key: UUID
- Time storage: UTC
- Formal business data uses database persistence
- Production user, role, content and review data must not use localStorage as source of truth
- Soft delete or archive is preferred for formal business content
- JSONB is used for snapshots and low-frequency extension fields, not to replace core relational models

## 2. Core relationship overview

```text
Organization
 ├─ Team
 │   └─ User
 └─ Content
      ├─ ContentVersion
      ├─ AssetDetail
      ├─ SkillDetail
      ├─ CaseDetail
      │   └─ CaseEvidence
      └─ AIProjectDetail

User
 ├─ UserRole ─ Role ─ RolePermission ─ Permission
 ├─ Favorite
 ├─ RecentView
 ├─ UsageEvent
 ├─ SearchLog
 ├─ ReviewRequest
 ├─ ReviewAction
 ├─ Notification
 ├─ AIRun
 └─ AuditLog

Content
 ├─ Category
 ├─ ContentTag ─ Tag
 ├─ AttachmentRelation ─ FileAttachment
 ├─ ReviewRequest
 ├─ Favorite
 ├─ UsageEvent
 └─ ContentRelation
```

## 3. Organization and permission models

### organizations

- id: uuid
- name: varchar(100)
- code: varchar(50), unique
- status: active | disabled
- settings: jsonb
- created_at
- updated_at

### teams

- id
- organization_id
- parent_id
- name
- code
- owner_id
- status
- created_at
- updated_at

Indexes:

- organization_id
- parent_id
- owner_id

### users

- id
- organization_id
- primary_team_id
- employee_id
- name
- email
- avatar_url
- status: invited | active | disabled
- locale
- last_login_at
- created_at
- updated_at
- deleted_at

Unique:

- organization_id + email
- employee_id when present

### roles

System role codes:

- member
- reviewer
- admin
- manager

Fields:

- id
- organization_id, nullable for system role
- code
- name
- description
- is_system
- created_at
- updated_at

### permissions

Suggested permission codes:

- content.read
- content.create
- content.edit_own
- content.edit_all
- content.submit
- content.publish
- content.unpublish
- content.archive
- review.read
- review.process
- review.assign
- analytics.read
- user.manage
- taxonomy.manage
- audit.read
- ai.execute
- ai.manage

Fields:

- id
- code
- module
- name
- description

### user_roles

- id
- user_id
- role_id
- scope_type: organization | team
- scope_id
- created_by
- created_at

Unique:

- user_id + role_id + scope_type + scope_id

## 4. Unified content model

### contents

Content types:

- DESIGN_ASSET
- AI_SKILL
- AI_CASE
- AI_PROJECT

Fields:

- id
- organization_id
- content_type
- title
- slug
- summary
- category_id
- owner_id
- team_id
- current_version_id
- draft_version_id
- status
- visibility
- verification_status
- cover_file_id
- published_at
- last_reviewed_at
- review_due_at
- created_by
- created_at
- updated_at
- archived_at
- deleted_at

Status enum:

- DRAFT
- IN_REVIEW
- CHANGES_REQUESTED
- APPROVED
- PUBLISHED
- UNPUBLISHED
- ARCHIVED

Verification enum:

- UNVERIFIED
- INTERNAL_TRIAL
- PILOT
- VERIFIED
- INVALIDATED

Visibility:

- public
- organization
- team
- restricted

Indexes:

- organization_id + content_type + status
- category_id
- owner_id
- team_id
- published_at
- updated_at
- review_due_at

Unique:

- slug

## 5. Content versions

### content_versions

- id
- content_id
- version_number
- version_label
- version_status
- base_version_id
- title
- summary
- body: jsonb
- change_summary
- created_by
- created_at
- submitted_at
- published_at

Rules:

- Review always targets a specific version.
- Published versions are immutable.
- Editing published content creates a new version.
- body stores the complete version snapshot.
- `body.taxonomy` stores the version's `{ categoryId, tagIds }`. Dedicated draft API fields are validated server-side; user-provided nested taxonomy is never trusted. Legacy versions without this key fall back to the content's existing relations when creating an edit draft; immutable historical versions are not rewritten.
- Draft-only content projects taxonomy to `contents.category_id` / `content_tags` on save. For published content, editing changes only the draft snapshot; publication projects reviewed taxonomy in the same transaction as version promotion and detail projection.
- Same content cannot reuse a version number.

Unique:

- content_id + version_number

## 6. Design asset detail

### asset_details

- content_id
- asset_type
- platforms: string[]
- scenarios: text[]
- unsuitable_scenarios: text[]
- problem_statement
- usage_guide: jsonb
- resource_links: jsonb
- maintenance_cycle_days
- extra_data: jsonb

## 7. AI Skill detail

### skill_details

- content_id
- applicable_roles: string[]
- input_requirements: jsonb
- output_schema: jsonb
- prompt_template: text
- execution_steps: jsonb
- example_input: jsonb
- example_output: jsonb
- human_review_rules: jsonb
- limitations: text
- recommended_models: string[]
- data_security_level: public | internal | confidential
- prompt_version
- online_executable: boolean
- execution_config: jsonb

Publish requirements:

- input_requirements is not empty
- output_schema is not empty
- prompt_template is not empty
- human_review_rules is not empty
- limitations is not empty
- owner exists
- version exists

## 8. AI case detail

### case_details

- content_id
- background
- original_process
- ai_responsibilities
- human_responsibilities
- result_summary
- metric_name
- before_value
- after_value
- sample_size
- validation_method
- limitations
- related_skill_content_id
- related_project_content_id

### case_evidence

- id
- case_content_id
- evidence_type: data | research | review | attachment
- metric_name
- metric_value
- data_source
- period_start
- period_end
- sample_size
- verification_status: pending | verified | rejected
- verified_by
- verified_at
- attachment_id

Rule:

A VERIFIED AI case must have at least one verified evidence record.

## 9. AI project detail

### ai_project_details

- content_id
- project_code
- domain
- target_value
- project_stage
- priority
- suggested_owner_team_id
- problem_statement
- solution_hypothesis
- expected_outcome
- risk_level
- evaluation_result: jsonb
- converted_project_ref

Project stage:

- EXPLORING
- PENDING_EVALUATION
- READY
- PILOTING
- VERIFIED
- PAUSED
- TERMINATED

Priority:

- high
- medium
- low

## 10. Categories and tags

### categories

- id
- organization_id
- parent_id
- name
- code
- content_types: string[]
- sort_order
- status: active | disabled
- created_at
- updated_at

### tags

- id
- organization_id
- name
- normalized_name
- usage_count
- The administration API computes `usageCount` from real, non-deleted, same-organization content relations instead of trusting the legacy stored counter. Published revisions do not change the count until publication; historical versions are excluded.
- status: active | merged | disabled; default disabled until explicitly enabled by an administrator
- merged_to_id
- created_at

### content_tags

- content_id
- tag_id
- created_by
- created_at

Primary key:

- content_id + tag_id

## 11. Files

### file_attachments

- id
- organization_id
- original_name
- storage_key
- mime_type
- extension
- size_bytes
- checksum
- access_level
- upload_status
- uploaded_by
- created_at
- deleted_at

access_level:

- public
- internal
- restricted

upload_status:

- uploading
- ready
- failed
- deleted

### attachment_relations

- id
- file_id
- entity_type
- entity_id
- usage_type
- sort_order
- created_at

entity_type:

- content
- version
- review
- ai_run

usage_type:

- cover
- attachment
- input
- output
- evidence

## 12. Review workflow

### review_requests

- id
- content_id
- version_id
- submitted_by
- assigned_reviewer_id
- status
- submit_message
- due_at
- submitted_at
- completed_at
- created_at

Status:

- pending
- approved
- changes_requested
- cancelled

Rules:

- One active review per content version.
- submitted_by cannot equal assigned_reviewer_id.
- `review.assign` is granted only to the platform administrator role.
- Only `review.assign` users can assign or reassign `assigned_reviewer_id`.
- `review.process` users can decide only review requests assigned to themselves.

### review_actions

- id
- review_request_id
- actor_id
- action
- comment
- metadata
- created_at

Action:

- assign
- comment
- approve
- request_changes
- cancel

Review actions are append-only.

## 13. User behavior

### favorites

- user_id
- content_id
- created_at

Primary key:

- user_id + content_id

### recent_views

- user_id
- content_id
- view_count
- first_viewed_at
- last_viewed_at

Primary key:

- user_id + content_id

### usage_events

- id
- organization_id
- user_id
- session_id
- content_id
- event_type
- project_reference
- source_page
- metadata
- occurred_at

Core event types:

- content_view
- favorite_add
- favorite_remove
- prompt_copy
- file_download
- content_share
- usage_confirmed
- project_referenced
- feedback_submitted

Indexes:

- organization_id + occurred_at
- content_id + event_type + occurred_at
- user_id + occurred_at

### search_logs

- id
- organization_id
- user_id
- keyword
- normalized_keyword
- filters
- result_count
- clicked_content_id
- session_id
- searched_at

### content_feedback

- id
- content_id
- user_id
- feedback_type
- rating
- comment
- status
- resolved_by
- resolved_at
- created_at

feedback_type:

- helpful
- outdated
- incorrect
- suggestion

status:

- open
- resolved
- ignored

## 14. Notifications

### notifications

- id
- receiver_id
- type
- title
- message
- related_entity_type
- related_entity_id
- channel
- status
- read_at
- created_at
- sent_at

channel:

- in_app
- email

status:

- pending
- sent
- failed

## 15. AI execution

### ai_runs

- id
- organization_id
- skill_content_id
- skill_version_id
- user_id
- status
- provider
- model
- input_data
- output_data
- output_text
- prompt_snapshot
- input_tokens
- output_tokens
- estimated_cost
- error_code
- error_message
- human_review_status
- started_at
- completed_at
- created_at

Status:

- queued
- running
- succeeded
- failed
- cancelled

Human review status:

- pending
- confirmed
- rejected

Rules:

- Save exact skill version used.
- Save prompt snapshot.
- History must not depend on current Skill content.
- Sensitive input persistence depends on data security level.

### ai_run_files

- id
- ai_run_id
- file_id
- direction: input | output
- created_at

### ai_feedback

- id
- ai_run_id
- user_id
- rating
- result_status
- used_in_project
- project_reference
- comment
- created_at

result_status:

- useful
- partially_useful
- unusable

## 16. Audit

### audit_logs

- id
- organization_id
- actor_id
- action
- entity_type
- entity_id
- before_data
- after_data
- ip_address
- user_agent
- created_at

Must audit:

- role change
- permission change
- user disable
- content publish
- content unpublish
- content archive
- reviewer decision
- owner change
- taxonomy change
- AI configuration change
- sensitive file access

## 17. Content relations

### content_relations

- id
- source_content_id
- target_content_id
- relation_type
- created_by
- created_at

relation_type:

- related
- uses
- evidence_for
- derived_from

Unique:

- source_content_id + target_content_id + relation_type

## 18. Search

MVP search source:

- contents.title
- contents.summary
- content_versions.body
- tags.name
- users.name
- ai_project_details.project_code

Suggested ranking:

1. Title
2. Project code
3. Tags
4. Summary
5. Body

Permission filtering must happen before results are returned.

## 19. Data integrity rules

1. Every content item has owner and team.
2. Published content has current published version.
3. Published AI Skill has human review rules.
4. VERIFIED AI case has verified evidence.
5. Reviewer cannot equal submitter.
6. Published version is immutable.
7. Category cannot be deleted while unresolved content dependencies remain.
8. User owner content must be reassigned before user disable.
9. Unpublished content is excluded from normal search.
10. Restricted content access is enforced by backend.
11. Formal user, role, content, review and usage data must not depend on localStorage.

## 20. v9-1 migration

Migrate:

- approved design asset examples
- approved AI Skill examples
- approved AI case examples
- 33 AI project directions
- approved taxonomy and value-goal categories

Do not migrate as production truth:

- demo metrics
- simulated favorites
- simulated audit records
- simulated review records
- temporary fake users

Migration flow:

```text
Extract legacy data
→ Normalize title, category and tags
→ Assign real owners
→ Create contents
→ Create type detail records
→ Create published 1.0 versions
→ Import files
→ Sample verification
```
