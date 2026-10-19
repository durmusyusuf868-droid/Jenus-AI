import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMath, evaluateUnitConversion, processLocalQuery } from './localEngine.ts';
import { scrubPII } from './privacyVault.ts';

test('evaluateMath calculates standard mathematical arithmetic', () => {
  const result = evaluateMath('25 * 4');
  assert.ok(result !== null);
  assert.match(result, /100/);
});

test('evaluateMath calculates percentages correctly in Turkish', () => {
  const result = evaluateMath('200 ün yüzde 15 i');
  assert.ok(result !== null);
  assert.match(result, /30/);

  const result2 = evaluateMath('450 nin yüzde 18 i');
  assert.ok(result2 !== null);
  assert.match(result2, /81/);
});

test('evaluateMath calculates square root correctly', () => {
  const result = evaluateMath('karekök 144');
  assert.ok(result !== null);
  assert.match(result, /12/);
});

test('evaluateUnitConversion converts kilometers to miles', () => {
  const result = evaluateUnitConversion('100 km kaç mil');
  assert.ok(result !== null);
  assert.match(result, /62\.14/);
});

test('evaluateUnitConversion converts kilograms to pounds', () => {
  const result = evaluateUnitConversion('10 kg kaç pound');
  assert.ok(result !== null);
  assert.match(result, /22\.05/);
});

test('scrubPII masks sensitive data like phones and emails on device', () => {
  const sample = 'Bana test@example.com adresinden veya 05321234567 numarasından ulaşabilirsiniz.';
  const res = scrubPII(sample);
  assert.equal(res.hasPii, true);
  assert.ok(!res.scrubbedText.includes('test@example.com'));
  assert.ok(!res.scrubbedText.includes('05321234567'));
  assert.match(res.scrubbedText, /\[GİZLENDİ: E-Posta\]/);
  assert.match(res.scrubbedText, /\[GİZLENDİ: Telefon\]/);
});

test('processLocalQuery handles note taking intent locally', () => {
  const query = 'not al: yarın saat 9 da toplantı';
  const result = processLocalQuery(query);
  assert.equal(result.handledLocally, true);
  assert.equal(result.category, 'not');
  assert.equal(result.actionTaken, 'note_added');
  assert.ok(result.createdNote !== undefined);
  assert.match(result.createdNote.content, /yarın saat 9 da toplantı/);
});

test('processLocalQuery answers offline knowledge queries', () => {
  const query = 'Jenus nedir?';
  const result = processLocalQuery(query);
  assert.equal(result.handledLocally, true);
  assert.match(result.text, /Jenus/);
});
