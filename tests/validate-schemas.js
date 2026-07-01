const Ajv = require('ajv');
const { readFileSync, readdirSync, existsSync } = require('fs');
const { join } = require('path');

const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(readFileSync(join(__dirname, '../schemas/collection-info.schema.json'), 'utf8'));
const validate = ajv.compile(schema);

const collectionsDir = join(__dirname, '../collections');
let passed = 0;
let failed = 0;

for (const drop of readdirSync(collectionsDir)) {
  const infoPath = join(collectionsDir, drop, 'info.json');
  if (!existsSync(infoPath)) {
    console.error(`FAIL ${drop}: missing info.json`);
    failed++;
    continue;
  }

  let data;
  try {
    data = JSON.parse(readFileSync(infoPath, 'utf8'));
  } catch (e) {
    console.error(`FAIL ${infoPath}: invalid JSON — ${e.message}`);
    failed++;
    continue;
  }

  if (validate(data)) {
    console.log(`PASS ${infoPath}`);
    passed++;
  } else {
    console.error(`FAIL ${infoPath}:`);
    for (const err of validate.errors) {
      console.error(`  ${err.instancePath || '(root)'} ${err.message}`);
    }
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
