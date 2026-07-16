import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CLIENT_DOCUMENT_CATEGORIES,
  CLIENT_DOCUMENT_STATUS_LABEL,
  isClientDocumentCategory,
} from "../src/lib/client-document-status";

test("client document categories cover vault types", () => {
  assert.ok(CLIENT_DOCUMENT_CATEGORIES.includes("Rechnung"));
  assert.ok(CLIENT_DOCUMENT_CATEGORIES.includes("AVV"));
  assert.ok(CLIENT_DOCUMENT_CATEGORIES.includes("Mehrwert-Report"));
  assert.equal(CLIENT_DOCUMENT_CATEGORIES.length, 6);
});

test("client document status labels cover draft and published", () => {
  assert.equal(CLIENT_DOCUMENT_STATUS_LABEL.draft, "Entwurf");
  assert.equal(CLIENT_DOCUMENT_STATUS_LABEL.published, "Freigegeben");
});

test("isClientDocumentCategory validates known categories", () => {
  assert.equal(isClientDocumentCategory("Rechnung"), true);
  assert.equal(isClientDocumentCategory("Unknown"), false);
});
