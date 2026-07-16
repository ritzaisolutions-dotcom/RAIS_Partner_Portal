import test from "node:test";
import assert from "node:assert/strict";
import { requiresPasswordChange } from "../src/lib/auth-metadata";

test("requiresPasswordChange accepts boolean true only", () => {
  assert.equal(requiresPasswordChange({ must_change_password: true }), true);
  assert.equal(requiresPasswordChange({ must_change_password: false }), false);
  assert.equal(requiresPasswordChange({ must_change_password: "false" }), false);
  assert.equal(requiresPasswordChange({ must_change_password: "true" }), true);
  assert.equal(requiresPasswordChange(undefined), false);
  assert.equal(requiresPasswordChange({}), false);
});
