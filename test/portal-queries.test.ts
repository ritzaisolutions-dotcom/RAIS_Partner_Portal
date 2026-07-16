import assert from "node:assert/strict";
import test from "node:test";
import { resolvePortalHome } from "@/lib/portal-queries";

test("resolvePortalHome returns portal overview when any permission is enabled", () => {
  assert.equal(
    resolvePortalHome({
      canViewReports: true,
      canViewInputs: true,
      canSubmitRequests: true,
      canViewDocuments: true,
    }),
    "/portal",
  );
});

test("resolvePortalHome returns portal overview when only inputs are enabled", () => {
  assert.equal(
    resolvePortalHome({
      canViewReports: false,
      canViewInputs: true,
      canSubmitRequests: true,
      canViewDocuments: true,
    }),
    "/portal",
  );
});

test("resolvePortalHome returns portal overview when only submit permission is enabled", () => {
  assert.equal(
    resolvePortalHome({
      canViewReports: false,
      canViewInputs: false,
      canSubmitRequests: true,
      canViewDocuments: true,
    }),
    "/portal",
  );
});

test("resolvePortalHome returns portal overview when only documents permission is enabled", () => {
  assert.equal(
    resolvePortalHome({
      canViewReports: false,
      canViewInputs: false,
      canSubmitRequests: false,
      canViewDocuments: true,
    }),
    "/portal",
  );
});

test("resolvePortalHome sends users to no-access when all permissions are false", () => {
  assert.equal(
    resolvePortalHome({
      canViewReports: false,
      canViewInputs: false,
      canSubmitRequests: false,
      canViewDocuments: false,
    }),
    "/portal/no-access",
  );
});
