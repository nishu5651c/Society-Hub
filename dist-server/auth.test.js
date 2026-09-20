import assert from "node:assert/strict";
import { test } from "node:test";
import { requireRoles } from "./auth.js";
const user = (role) => ({ id: "u1", email: "u@example.test", name: "Test User", role });
test("role middleware rejects unauthenticated and unauthorized requests", async () => {
    const middleware = requireRoles("ADMIN");
    const errors = [];
    await new Promise((resolve) => middleware({ user: undefined }, {}, (error) => { errors.push(error); resolve(); }));
    assert.equal(errors[0].status, 403);
    await new Promise((resolve) => middleware({ user: user("RESIDENT") }, {}, (error) => { errors.push(error); resolve(); }));
    assert.equal(errors[1].status, 403);
});
test("role middleware permits an allowed role", async () => {
    let called = false;
    await new Promise((resolve) => requireRoles("MANAGER")({ user: user("MANAGER") }, {}, (error) => { assert.equal(error, undefined); called = true; resolve(); }));
    assert.equal(called, true);
});
