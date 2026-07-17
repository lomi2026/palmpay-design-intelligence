import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { RoleScopeType, UserStatus } from '../src/generated/prisma/enums';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to bootstrap the test environment.');
}

const adminEmail = process.env.TEST_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
if (!adminEmail) {
  throw new Error('TEST_BOOTSTRAP_ADMIN_EMAIL is required to bootstrap the test environment.');
}

const organizationCode = process.env.DEFAULT_ORGANIZATION_CODE ?? 'palmpay-experience-design';
const adminName = process.env.TEST_BOOTSTRAP_ADMIN_NAME?.trim() || 'PalmPay Test Administrator';
const teamCode = 'palmpay-experience-design';
const teamName = 'PalmPay Experience Design';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const organization = await prisma.organization.findUnique({ where: { code: organizationCode } });
  if (!organization) {
    throw new Error(`Organization not found: ${organizationCode}. Run prisma:seed first.`);
  }

  const [adminRole, memberRole] = await Promise.all([
    prisma.role.findUnique({ where: { code: 'admin' } }),
    prisma.role.findUnique({ where: { code: 'member' } }),
  ]);
  if (!adminRole || !memberRole) {
    throw new Error('System roles are missing. Run prisma:seed first.');
  }

  const user = await prisma.user.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: adminEmail } },
    create: {
      organizationId: organization.id,
      email: adminEmail,
      name: adminName,
      status: UserStatus.ACTIVE,
    },
    update: {
      status: UserStatus.ACTIVE,
      deletedAt: null,
    },
  });

  const team = await prisma.team.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: teamCode } },
    create: {
      organizationId: organization.id,
      code: teamCode,
      name: teamName,
      ownerId: user.id,
    },
    update: { ownerId: user.id, status: 'ACTIVE' },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { primaryTeamId: team.id },
  });

  await Promise.all(
    [adminRole, memberRole].map((role) =>
      prisma.userRole.upsert({
        where: {
          userId_roleId_scopeType_scopeId: {
            userId: user.id,
            roleId: role.id,
            scopeType: RoleScopeType.ORGANIZATION,
            scopeId: organization.id,
          },
        },
        create: {
          userId: user.id,
          roleId: role.id,
          scopeType: RoleScopeType.ORGANIZATION,
          scopeId: organization.id,
        },
        update: {},
      }),
    ),
  );

  console.log(
    JSON.stringify({
      organization: organization.code,
      team: team.code,
      administrator: adminEmail,
      roles: ['admin', 'member'],
    }),
  );
}

void main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    await prisma.$disconnect();
    throw error;
  });
