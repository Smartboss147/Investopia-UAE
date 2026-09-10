let cleaned = `-----BEGIN PRIVATE KEY-----
MIIEvgIB ADANBgkq hkiG9w0B AQEFAASC BKYwggSi AgEAAoIB AQDC
-----END PRIVATE KEY-----`;

cleaned = cleaned.replace(/\\n/g, '').replace(/\s+/g, '');
console.log("No spaces:", cleaned);

const b64 = cleaned.replace(/.*?BEGIN(?:RSA)?PRIVATEKEY-+(.*)-+END(?:RSA)?PRIVATEKEY.*/i, '$1').replace(/[^A-Za-z0-9+/=]/g, '');
console.log("b64:", b64);

const header = "-----BEGIN PRIVATE KEY-----";
const footer = "-----END PRIVATE KEY-----";
const lines = b64.match(/.{1,64}/g) || [];
const finalKey = `${header}\n${lines.join('\n')}\n${footer}\n`;

console.log("Final:\n" + finalKey);
