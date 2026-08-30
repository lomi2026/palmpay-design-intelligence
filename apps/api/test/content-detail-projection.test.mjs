import assert from 'node:assert/strict';
import test from 'node:test';
import {
  projectContentDetail,
  upsertPublishedContentDetail,
} from '../dist/content/content-detail-projection.js';
import { DraftsService } from '../dist/content/drafts.service.js';

const validUuid = '3f66f052-dbe9-4e52-9fd4-0146878fc5c5';

const fixtures = {
  DESIGN_ASSET: {
    delegate: 'assetDetail',
    changedField: 'assetType',
    changedValue: 'UPDATED_STANDARD',
    body: {
      assetType: 'COMPONENT_STANDARD',
      platforms: ['Web'],
      scenarios: ['Design review'],
      unsuitableScenarios: ['Unreviewed release'],
      problemStatement: 'Components are inconsistent.',
      usageGuide: 'Follow the reviewed component guidance.',
      resourceLinks: ['https://example.test/asset'],
      maintenanceCycleDays: '30',
      extraData: { source: 'approved-version' },
    },
  },
  AI_SKILL: {
    delegate: 'skillDetail',
    changedField: 'promptTemplate',
    changedValue: 'Use the updated approved prompt.',
    body: {
      goal: 'Improve research synthesis.',
      scenarios: ['Research synthesis'],
      unsuitableScenarios: ['Final decisions without review'],
      applicableRoles: ['Designer'],
      inputRequirements: 'Approved research notes.',
      outputSchema: 'A structured findings list.',
      promptTemplate: 'Analyze the approved notes.',
      executionSteps: 'Prepare, execute, review.',
      exampleInput: 'Interview notes.',
      exampleOutput: 'Prioritized findings.',
      humanReviewRules: 'Verify every cited finding.',
      limitations: 'Cannot replace designer judgment.',
      recommendedModels: ['approved-model'],
      dataSecurityLevel: 'internal',
      promptVersion: '1.0',
      onlineExecutable: true,
      executionConfig: { temperature: 0 },
    },
  },
  AI_CASE: {
    delegate: 'caseDetail',
    changedField: 'resultSummary',
    changedValue: 'The updated approved result.',
    body: {
      background: 'A research project.',
      originalProblem: 'Synthesis took too long.',
      originalProcess: 'Manual synthesis.',
      aiIntervention: 'Initial clustering.',
      aiResponsibilities: 'Produce candidate clusters.',
      humanResponsibilities: 'Verify the evidence.',
      resultSummary: 'The cycle was reduced.',
      beforeAfterComparison: 'Five days to two days.',
      sampleSize: '20',
      validationMethod: 'Owner review.',
      dataResult: 'Cycle reduced by 60%.',
      limitations: 'Validated on a limited sample.',
      reusableConclusion: 'Suitable for initial synthesis.',
      metricName: 'Cycle time',
      beforeValue: '5',
      afterValue: 2,
      relatedSkillContentId: validUuid,
      relatedProjectContentId: 'not-a-uuid',
    },
  },
  AI_PROJECT: {
    delegate: 'aIProjectDetail',
    changedField: 'expectedOutcome',
    changedValue: 'The updated approved outcome.',
    body: {
      projectCode: 'P27',
      domain: 'Research',
      targetValue: 'Efficiency',
      projectStage: 'EXPLORING',
      priority: 'high',
      problemStatement: 'The workflow is repetitive.',
      solutionHypothesis: 'AI can assist synthesis.',
      expectedOutcome: 'Reduce the cycle time.',
      riskLevel: 'Internal data must be controlled.',
      evaluationResult: 'Proceed to pilot evaluation.',
      suggestedOwnerTeamId: 'invalid-team-id',
      convertedProjectRef: 'JIRA-27',
    },
  },
};

test('projects all four approved body types into their formal detail fields', () => {
  const asset = projectContentDetail('DESIGN_ASSET', fixtures.DESIGN_ASSET.body);
  assert.equal(asset.data.assetType, 'COMPONENT_STANDARD');
  assert.equal(asset.data.maintenanceCycleDays, 30);
  assert.deepEqual(asset.data.extraData, { source: 'approved-version' });

  const skill = projectContentDetail('AI_SKILL', fixtures.AI_SKILL.body);
  assert.equal(skill.data.dataSecurityLevel, 'INTERNAL');
  assert.equal(skill.data.onlineExecutable, true);
  assert.equal(skill.data.promptTemplate, 'Analyze the approved notes.');

  const aiCase = projectContentDetail('AI_CASE', fixtures.AI_CASE.body);
  assert.equal(aiCase.data.sampleSize, 20);
  assert.equal(aiCase.data.beforeValue, '5');
  assert.equal(aiCase.data.afterValue, '2');
  assert.equal(aiCase.data.relatedSkillContentId, validUuid);
  assert.equal(aiCase.data.relatedProjectContentId, null);

  const project = projectContentDetail('AI_PROJECT', fixtures.AI_PROJECT.body);
  assert.equal(project.data.projectStage, 'EXPLORING');
  assert.equal(project.data.priority, 'HIGH');
  assert.equal(project.data.suggestedOwnerTeamId, null);
  assert.equal(project.data.evaluationResult, 'Proceed to pilot evaluation.');
});

test('invalid optional UUID and numeric values clear stale detail fields safely', () => {
  const asset = projectContentDetail('DESIGN_ASSET', {
    ...fixtures.DESIGN_ASSET.body,
    maintenanceCycleDays: 'every quarter',
  });
  assert.equal(asset.data.maintenanceCycleDays, null);

  const aiCase = projectContentDetail('AI_CASE', {
    ...fixtures.AI_CASE.body,
    sampleSize: 'twenty interviews',
    beforeValue: 'not measured',
    relatedSkillContentId: 'invalid',
  });
  assert.equal(aiCase.data.sampleSize, null);
  assert.equal(aiCase.data.beforeValue, null);
  assert.equal(aiCase.data.relatedSkillContentId, null);
});

test('invalid required enum and list data is rejected instead of silently discarded', () => {
  assert.throws(
    () =>
      projectContentDetail('AI_SKILL', {
        ...fixtures.AI_SKILL.body,
        dataSecurityLevel: 'restricted',
      }),
    (error) => error?.response?.code === 'INVALID_CONTENT_DETAIL',
  );
  assert.throws(
    () =>
      projectContentDetail('AI_PROJECT', {
        ...fixtures.AI_PROJECT.body,
        priority: 'urgent',
      }),
    (error) => error?.response?.code === 'INVALID_CONTENT_DETAIL',
  );
  assert.throws(
    () =>
      projectContentDetail('DESIGN_ASSET', {
        ...fixtures.DESIGN_ASSET.body,
        platforms: ['Web', 42],
      }),
    (error) => error?.response?.code === 'INVALID_CONTENT_DETAIL',
  );
});

test('upserts all four detail models and updates the same row on a second publication', async () => {
  const calls = Object.fromEntries(
    ['assetDetail', 'skillDetail', 'caseDetail', 'aIProjectDetail'].map((delegate) => [delegate, []]),
  );
  const tx = Object.fromEntries(
    Object.entries(calls).map(([delegate, delegateCalls]) => [
      delegate,
      {
        upsert: async (input) => {
          delegateCalls.push(input);
          return input.create;
        },
      },
    ]),
  );
  tx.content = {
    findMany: async () => [{ id: validUuid, contentType: 'AI_SKILL' }],
  };
  tx.team = { findFirst: async () => null };

  for (const [contentType, fixture] of Object.entries(fixtures)) {
    const contentId = `${contentType.toLowerCase()}-content-id`;
    await upsertPublishedContentDetail(tx, contentType, contentId, 'organization-id', fixture.body);
    await upsertPublishedContentDetail(tx, contentType, contentId, 'organization-id', {
      ...fixture.body,
      [fixture.changedField]: fixture.changedValue,
    });

    const delegateCalls = calls[fixture.delegate];
    assert.equal(delegateCalls.length, 2);
    assert.equal(delegateCalls[0].create.contentId, contentId);
    assert.equal(delegateCalls[1].where.contentId, contentId);
    assert.equal(delegateCalls[1].update[fixture.changedField], fixture.changedValue);
    assert.equal(delegateCalls[1].create[fixture.changedField], fixture.changedValue);
  }
});

test('autosave preserves the published detail and publish switches it inside the promotion transaction', async () => {
  const contentId = 'published-content-id';
  const user = {
    id: 'publisher-id',
    organizationId: 'organization-id',
    primaryTeamId: 'team-id',
    permissions: ['content.edit_all', 'content.publish'],
  };
  const draftVersion = {
    id: 'draft-version-id',
    versionNumber: 2,
    versionStatus: 'DRAFT',
    title: 'Draft title',
    summary: 'Draft summary',
    body: { ...fixtures.DESIGN_ASSET.body, assetType: 'DRAFT_STANDARD' },
  };
  let publishedDetail = { assetType: 'PUBLISHED_STANDARD' };
  let insideTransaction = false;
  let detailUpsertCount = 0;
  let content = {
    id: contentId,
    contentType: 'DESIGN_ASSET',
    organizationId: user.organizationId,
    ownerId: user.id,
    status: 'PUBLISHED',
    draftVersionId: draftVersion.id,
    draftVersion,
  };
  const tx = {
    contentVersion: {
      updateMany: async () => ({ count: 1 }),
    },
    content: {
      updateMany: async () => ({ count: 1 }),
      findUniqueOrThrow: async () => ({ ...content, currentVersion: draftVersion }),
      findMany: async () => [],
    },
    team: { findFirst: async () => null },
    assetDetail: {
      upsert: async ({ update }) => {
        assert.equal(insideTransaction, true);
        detailUpsertCount += 1;
        publishedDetail = { ...publishedDetail, ...update };
        return publishedDetail;
      },
    },
    skillDetail: { upsert: async () => assert.fail('Unexpected Skill detail upsert.') },
    caseDetail: { upsert: async () => assert.fail('Unexpected case detail upsert.') },
    aIProjectDetail: { upsert: async () => assert.fail('Unexpected project detail upsert.') },
  };
  const prisma = {
    content: {
      findFirst: async () => content,
      update: async ({ data }) => ({ ...content, ...data }),
    },
    contentVersion: {
      update: async ({ data }) => {
        Object.assign(draftVersion, data);
        return draftVersion;
      },
    },
    $transaction: async (operation) => {
      if (Array.isArray(operation)) return Promise.all(operation);
      insideTransaction = true;
      try {
        return await operation(tx);
      } finally {
        insideTransaction = false;
      }
    },
  };
  const service = new DraftsService(
    prisma,
    { write: async () => undefined },
    { recordEvent: async () => undefined },
  );

  await service.autosave(user, contentId, {
    title: 'Updated draft title',
    body: { ...fixtures.DESIGN_ASSET.body, assetType: 'UPDATED_DRAFT_STANDARD' },
  });
  assert.equal(publishedDetail.assetType, 'PUBLISHED_STANDARD');
  assert.equal(detailUpsertCount, 0);

  draftVersion.versionStatus = 'APPROVED';
  content = { ...content, draftVersion };
  await service.publishApproved(user, contentId);
  assert.equal(detailUpsertCount, 1);
  assert.equal(publishedDetail.assetType, 'UPDATED_DRAFT_STANDARD');
  assert.equal(insideTransaction, false);
});
