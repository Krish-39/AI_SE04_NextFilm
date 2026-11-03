import { test } from "vitest";
import assert from "node:assert/strict";

import { communityPicks, extractTitles, normalizeComments, tally } from "./picks.js";
import { parseExtraction } from "./ai.js";

test("extractTitles finds bold, dated and list-line titles", () => {
  assert.deepEqual(extractTitles("**Moon** is perfect for this"), [{ title: "Moon", year: null }]);
  assert.deepEqual(extractTitles("Try Interstellar (2014), it wrecked me"), [{ title: "Interstellar", year: 2014 }]);
  assert.deepEqual(
    extractTitles("- Gravity\n- Ad Astra - slow but sad\n- I think you'd also like this one"),
    [
      { title: "Gravity", year: null },
      { title: "Ad Astra", year: null },
    ],
  );
});

test("extractTitles ignores chatter", () => {
  assert.deepEqual(extractTitles("Yes"), []);
  assert.deepEqual(extractTitles("this is a really long sentence about how much I loved watching everything as a kid"), []);
});

test("normalizeComments keeps real top-level replies", () => {
  const json = [{}, { data: { children: [
    { kind: "t1", data: { body: "Moon", score: 40 } },
    { kind: "t1", data: { body: "[deleted]", score: 3 } },
    { kind: "t1", data: { body: "Rules reminder", score: 1, author: "AutoModerator" } },
    { kind: "more", data: {} },
  ] } }];
  const thread = { id: "t" };
  assert.deepEqual(normalizeComments(json, thread), [{ body: "Moon", score: 40, thread }]);
});

test("tally ranks by how many people named a title, then upvotes", () => {
  const a = { id: "a" };
  const b = { id: "b" };
  const picks = tally([
    { body: "Moon", score: 50, thread: a },
    { body: "**Gravity**", score: 400, thread: a },
    { body: "Moon (2009)", score: 10, thread: b },
    { body: "The Moon", score: -3, thread: b },
  ]);
  assert.equal(picks[0].title, "Moon");
  assert.equal(picks[0].mentions, 3);
  assert.equal(picks[0].votes, 61);
  assert.equal(picks[0].year, 2009);
  assert.equal(picks[0].threads.length, 2);
  assert.equal(picks[1].title, "Gravity");
});

test("communityPicks reads the busiest threads' comments", async () => {
  const listing = (sub) => ({ data: { children: [
    { data: { id: `${sub}1`, title: "Sad space movies?", permalink: `/r/${sub}/1`, score: 100, num_comments: 40 } },
    { data: { id: `${sub}2`, title: "quiet", permalink: `/r/${sub}/2`, score: 1, num_comments: 0 } },
  ] } });
  const comments = [{}, { data: { children: [
    { kind: "t1", data: { body: "Moon (2009)", score: 30 } },
    { kind: "t1", data: { body: "**Solaris**", score: 12 } },
  ] } }];
  const fetchImpl = async (url) => ({
    ok: true,
    json: async () => (url.includes("/search") ? listing(url.match(/\/r\/(\w+)\//)[1]) : comments),
  });
  const { picks, threads } = await communityPicks({ q: "sad space", kind: "movie" }, { fetchImpl });
  assert.deepEqual(picks.map((p) => [p.title, p.mentions]), [["Moon", 3], ["Solaris", 3]]);
  assert.equal(threads.length, 3);
  assert.ok(threads.every((t) => t.comments >= 3));
});

test("parseExtraction keeps well-formed lines only", () => {
  const out = parseExtraction("1|Moon|2009\n[2] | Solaris |\n9|Out of range|\nnonsense\n2|**Gravity**|2013", 2);
  assert.deepEqual(out, [[{ title: "Moon", year: 2009 }], [{ title: "Solaris", year: null }, { title: "Gravity", year: 2013 }]]);
});

test("generate sends the key in x-goog-api-key and joins the reply text", async () => {
  const { generate, recommend } = await import("./ai.js");
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: "Moon, " }, { text: "Solaris" }] } }] }) };
  };
  assert.equal(await generate("hi", "AQ.secret", { fetchImpl, model: "gemini-test" }), "Moon, Solaris");
  assert.match(calls[0].url, /models\/gemini-test:generateContent$/);
  assert.equal(calls[0].init.headers["x-goog-api-key"], "AQ.secret");
  assert.ok(!calls[0].url.includes("AQ.secret"));
  assert.deepEqual(await recommend("sad space", "k", {}, { fetchImpl }), ["Moon", "Solaris"]);
});

test("generate surfaces Google's error message", async () => {
  const { generate } = await import("./ai.js");
  const fetchImpl = async () => ({ ok: false, status: 404, json: async () => ({ error: { message: "model retired" } }) });
  await assert.rejects(generate("hi", "k", { fetchImpl }), /Gemini 404: model retired/);
});

test("generate retries when Gemini is busy", async () => {
  const { generate } = await import("./ai.js");
  let n = 0;
  const fetchImpl = async () => {
    n += 1;
    return n < 3
      ? { ok: false, status: 503, json: async () => ({ error: { message: "high demand" } }) }
      : { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: "Moon" }] } }] }) };
  };
  assert.equal(await generate("hi", "k", { fetchImpl, delayMs: 1 }), "Moon");
  assert.equal(n, 3);
  n = -10;
  await assert.rejects(generate("hi", "k", { fetchImpl, delayMs: 1 }), /Gemini 503/);
});
