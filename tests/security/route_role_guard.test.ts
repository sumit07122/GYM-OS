import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Route Role Isolation & Guard Verification', () => {
  const routerPath = path.resolve(__dirname, '../../src/app/router.tsx');

  it('verifies owner routes are explicitly protected with allowedRoles', () => {
    const content = fs.readFileSync(routerPath, 'utf8');
    // Owner routes must require gym_owner role
    expect(content).toContain("allowedRoles={['gym_owner', 'gym_manager', 'platform_super_admin']}");
    // Member route must be guarded with member role
    expect(content).toContain("allowedRoles={['member', 'gym_owner', 'gym_manager', 'platform_super_admin']}");
  });
});
