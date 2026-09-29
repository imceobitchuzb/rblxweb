import { describe, it } from "node:test";
import assert from "node:assert";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import { createSessionToken, verifySessionToken } from "../lib/auth/session";
import { validateLoginInput, validateRegisterInput } from "../lib/server/validation";
import { loginAction, registerAction, logoutAction } from "../app/actions/auth";

describe("Phase 7 - Authentication System", () => {
  it("Auth - 1. Password hashing and verification", async () => {
    const password = "SuperSecretPassword2026!";
    const hash = await hashPassword(password);

    assert.ok(hash && hash.length > 20, "Hash should be generated");
    assert.notStrictEqual(hash, password, "Hash must not equal plaintext password");

    const match = await verifyPassword(password, hash);
    assert.strictEqual(match, true, "Matching password should verify successfully");

    const mismatch = await verifyPassword("WrongPassword123", hash);
    assert.strictEqual(mismatch, false, "Wrong password should fail verification");
  });

  it("Auth - 2. Signed JWT Session token lifecycle", async () => {
    const payload = {
      sub: "user-test-uuid",
      email: "testcreator@roxiehub.gg",
      workspaceId: "workspace-test-uuid",
      role: "OWNER" as const,
      name: "Test Creator",
    };

    const token = await createSessionToken(payload);
    assert.ok(token && typeof token === "string", "JWT token string should be created");

    const verified = await verifySessionToken(token);
    assert.ok(verified, "Session token should be verified");
    assert.strictEqual(verified.sub, payload.sub);
    assert.strictEqual(verified.email, payload.email);
    assert.strictEqual(verified.workspaceId, payload.workspaceId);
    assert.strictEqual(verified.role, "OWNER");

    // Invalid token verification
    const invalid = await verifySessionToken("invalid.jwt.token");
    assert.strictEqual(invalid, null, "Invalid token should decode to null");
  });

  it("Auth - 3. Registration input validation", () => {
    // Valid input
    const valid = validateRegisterInput({
      name: "Roxie",
      email: "roxie@example.com",
      password: "password123",
    });
    assert.strictEqual(valid.valid, true);

    // Short password
    const shortPass = validateRegisterInput({
      name: "Roxie",
      email: "roxie@example.com",
      password: "short",
    });
    assert.strictEqual(shortPass.valid, false);
    assert.ok(shortPass.errors.password);

    // Invalid email
    const invalidEmail = validateRegisterInput({
      name: "Roxie",
      email: "invalid-email",
      password: "password123",
    });
    assert.strictEqual(invalidEmail.valid, false);
    assert.ok(invalidEmail.errors.email);

    // Empty name
    const emptyName = validateRegisterInput({
      name: "",
      email: "roxie@example.com",
      password: "password123",
    });
    assert.strictEqual(emptyName.valid, false);
    assert.ok(emptyName.errors.name);
  });

  it("Auth - 4. Login input validation", () => {
    const valid = validateLoginInput({
      email: "creator@roxie.gg",
      password: "password123",
    });
    assert.strictEqual(valid.valid, true);

    const missingPass = validateLoginInput({
      email: "creator@roxie.gg",
      password: "",
    });
    assert.strictEqual(missingPass.valid, false);
    assert.ok(missingPass.errors.password);

    const invalidEmail = validateLoginInput({
      email: "bad-email",
      password: "password123",
    });
    assert.strictEqual(invalidEmail.valid, false);
    assert.ok(invalidEmail.errors.email);
  });

  it("Auth - 5. User registration creates account, workspace, and owner membership", async () => {
    const uniqueEmail = `creator-${Date.now()}@test.gg`;
    const regRes = await registerAction({
      name: "New Creator",
      email: uniqueEmail,
      password: "SecurePassword2026!",
      workspaceName: "Genesis Gaming Studio",
    });

    assert.strictEqual(regRes.success, true, "Registration should succeed");
    if (regRes.success) {
      assert.strictEqual(regRes.data.user.email, uniqueEmail);
      assert.strictEqual(regRes.data.user.name, "New Creator");
      assert.strictEqual(regRes.data.workspace.name, "Genesis Gaming Studio");
      assert.strictEqual(regRes.data.role, "OWNER");
    }

    // Duplicate email registration should fail
    const duplicateRes = await registerAction({
      name: "Another Creator",
      email: uniqueEmail,
      password: "SecurePassword2026!",
    });
    assert.strictEqual(duplicateRes.success, false);
    assert.ok(duplicateRes.error?.includes("already exists"));
  });

  it("Auth - 6. User login with valid and invalid credentials", async () => {
    // 1. Valid login with demo user
    const loginRes = await loginAction({
      email: "roxie@bloxmedia.gg",
      password: "RoxieHub2026!",
    });

    assert.strictEqual(loginRes.success, true, "Demo login should succeed");
    if (loginRes.success) {
      assert.strictEqual(loginRes.data.user.email, "roxie@bloxmedia.gg");
      assert.strictEqual(loginRes.data.role, "OWNER");
    }

    // 2. Invalid password
    const badPassRes = await loginAction({
      email: "roxie@bloxmedia.gg",
      password: "WrongPassword!",
    });
    assert.strictEqual(badPassRes.success, false);
    assert.strictEqual(badPassRes.error, "Invalid email or password.");

    // 3. Unknown email
    const unknownRes = await loginAction({
      email: "nonexistent@bloxmedia.gg",
      password: "Password123!",
    });
    assert.strictEqual(unknownRes.success, false);
    assert.strictEqual(unknownRes.error, "Invalid email or password.");
  });

  it("Auth - 7. User logout cleans up session", async () => {
    const res = await logoutAction();
    assert.strictEqual(res.success, true);
  });

  it("Auth - 8. Open-redirect defense via getSafeCallbackUrl", async () => {
    const { getSafeCallbackUrl } = await import("../lib/auth/session");

    assert.strictEqual(getSafeCallbackUrl("https://evil.com"), "/dashboard");
    assert.strictEqual(getSafeCallbackUrl("http://evil.com/phishing"), "/dashboard");
    assert.strictEqual(getSafeCallbackUrl("//evil.com"), "/dashboard");
    assert.strictEqual(getSafeCallbackUrl("/\\evil.com"), "/dashboard");
    assert.strictEqual(getSafeCallbackUrl("javascript:alert(1)"), "/dashboard");
    assert.strictEqual(getSafeCallbackUrl("/javascript:alert(1)"), "/dashboard");
    assert.strictEqual(getSafeCallbackUrl("data:text/html,evil"), "/dashboard");
    assert.strictEqual(getSafeCallbackUrl(null), "/dashboard");
    assert.strictEqual(getSafeCallbackUrl(undefined), "/dashboard");
    assert.strictEqual(getSafeCallbackUrl(""), "/dashboard");

    // Legitimate internal paths
    assert.strictEqual(getSafeCallbackUrl("/dashboard"), "/dashboard");
    assert.strictEqual(getSafeCallbackUrl("/ideas"), "/ideas");
    assert.strictEqual(getSafeCallbackUrl("/videos?filter=YOUTUBE"), "/videos?filter=YOUTUBE");
    assert.strictEqual(getSafeCallbackUrl("/characters#roster"), "/characters#roster");
  });

  it("Auth - 9. Tampered JWT signature rejection", async () => {
    const token = await createSessionToken({
      sub: "user-tamper-test",
      email: "tamper@test.gg",
      workspaceId: "ws-tamper",
      role: "MEMBER",
    });

    const parts = token.split(".");
    assert.strictEqual(parts.length, 3, "JWT must contain 3 parts");

    // Alter signature
    const tamperedSigToken = `${parts[0]}.${parts[1]}.badSignatureInvalid1234567890`;
    const result1 = await verifySessionToken(tamperedSigToken);
    assert.strictEqual(result1, null, "Tampered signature must be rejected");

    // Alter payload
    const tamperedPayloadToken = `${parts[0]}.eyJzdWIiOiJoYWNrZWQifQ.${parts[2]}`;
    const result2 = await verifySessionToken(tamperedPayloadToken);
    assert.strictEqual(result2, null, "Tampered payload must be rejected");
  });

  it("Auth - 10. Expired JWT token rejection", async () => {
    const { SignJWT } = await import("jose");
    const secret = new TextEncoder().encode(
      "roxie-hub-secure-auth-jwt-secret-token-32-bytes-minimum"
    );

    const expiredToken = await new SignJWT({
      email: "expired@test.gg",
      workspaceId: "ws-expired",
      role: "MEMBER",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user-expired")
      .setIssuedAt(Math.floor(Date.now() / 1000) - 3600)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60) // Expired 60s ago
      .sign(secret);

    const verified = await verifySessionToken(expiredToken);
    assert.strictEqual(verified, null, "Expired JWT token must return null");
  });

  it("Auth - 11. Production persistence guard prevents silent memory fallback", async () => {
    const { assertPersistentDatabase } = await import("../lib/server/store");
    const prevEnv = process.env.NODE_ENV;

    try {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      assert.throws(
        () => assertPersistentDatabase("createIdeaRecord", new Error("DB offline")),
        /\[Production Persistence Failure\]/
      );
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
    }
  });

  it("Auth - 12. Production SESSION_SECRET enforcement (minimum 32 characters)", async () => {
    const prevEnv = process.env.NODE_ENV;
    const prevSecret = process.env.SESSION_SECRET;

    try {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";

      // Missing secret in production
      delete process.env.SESSION_SECRET;
      await assert.rejects(
        async () => {
          await createSessionToken({
            sub: "user-prod",
            email: "prod@test.gg",
            workspaceId: "ws-prod",
            role: "OWNER",
          });
        },
        /\[SECURITY CRITICAL\] SESSION_SECRET/
      );

      // Secret too short in production
      process.env.SESSION_SECRET = "too-short-secret";
      await assert.rejects(
        async () => {
          await createSessionToken({
            sub: "user-prod",
            email: "prod@test.gg",
            workspaceId: "ws-prod",
            role: "OWNER",
          });
        },
        /\[SECURITY CRITICAL\] SESSION_SECRET/
      );
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = prevEnv;
      if (prevSecret !== undefined) process.env.SESSION_SECRET = prevSecret;
      else delete process.env.SESSION_SECRET;
    }
  });
});
