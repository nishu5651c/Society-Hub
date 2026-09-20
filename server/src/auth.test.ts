import assert from "node:assert/strict";
import { test } from "node:test";
import { requireRoles, type AuthUser } from "./auth.js";

const user = (role: AuthUser["role"]) => ({ id: "u1", email: "u@example.test", name: "Test User", role });

test("role middleware rejects unauthenticated and unauthorized requests", async () => {
  const middleware = requireRoles("ADMIN");
  const errors: unknown[] = [];
  await new Promise<void>((resolve) => middleware({ user: undefined } as never, {} as never, (error) => { errors.push(error); resolve(); }));
  assert.equal((errors[0] as { status: number }).status, 403);

  await new Promise<void>((resolve) => middleware({ user: user("RESIDENT") } as never, {} as never, (error) => { errors.push(error); resolve(); }));
  assert.equal((errors[1] as { status: number }).status, 403);
});

test("role middleware permits an allowed role", async () => {
  let called = false;
  await new Promise<void>((resolve) => requireRoles("MANAGER")({ user: user("MANAGER") } as never, {} as never, (error) => { assert.equal(error, undefined); called = true; resolve(); }));
  assert.equal(called, true);
});
