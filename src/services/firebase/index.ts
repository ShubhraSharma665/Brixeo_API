import admin from "firebase-admin";
import dotenv from "dotenv";
import { readFileSync } from "fs";

dotenv.config();
const FIREBASE_SERVICE_ACCOUNT:any = {
  type: "service_account",
  project_id: "test-477cc",
  private_key_id: "5892c8d5b2a2716e6aab36747dff721b8afd5d37",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDXTVWsmSi6k3Dg\nlGdHhsXLeohJGDLtfHw87Rqkz80Rw1q2SyEqLx14rj5VNqDbu0XNsXufugf01e9n\ntGbzPaorgwJieEkybiK6ClXfobpdMGbxLek+l5wRzXvcOE0Ot7v5IIwcdbzNGMjr\nEnQwlUwh7m9JwvLkMKpLSDE0kpVNlJ8MblFilyv4U2WviuD3X3+gh4gvXcrHwTSU\nEVGjE7XDwTs2iPQj1hUKIReM0Z7miy7UNZ3G7/GtJXw7kXuPOgaLUAgMtSBasVPt\nQaRn2LHvrEvWyenyyLEpNMzZFxxRUp0UGZ5G9ChFL4I5xpA9lq0EmoUyP3loVnLG\nFVIbdwAJAgMBAAECggEACbeACRrdc3QxiTUxZxE+ToVgbroUnFK8saw6wlrthKJ2\nLtl7rPF06Uwl3IcrYddVGmgq7eXBs6tPE3VZGxu6mR2fxy1qEkhVsWNDhmUAafHE\nB5j8mJpTjRsivqjc02/34BG3uRYYOAJpGPDbhRDL35Eo/SF7AFDw8pZWwCpoahiY\nliIldDLutAqcQtu60XcOV3btmaQ1pXSh5Sk+vIQZhYyF9xqfjWTqmdoeNoT4vppB\nNsiIrm0FeoA7gsOCM4X3UMcw3i39FH/W6iL1naEAniIkFredlSlOcWTP4C2LcgBS\n2c3SRx5GDUsT7Dz/AEHzHINZq79A+Xd5DR7T3ik+4QKBgQDvJIdE2ZRV/z3Je4FT\n8gqpxlPjqrukBYfbYXIN1SZ+EydkIcs5Gom6CdJNksNqTiKmWFRAfcGVq7zQWQHr\nbKZfg9k19UEf6XERNgF/8RlYkGdipMsyLOIob7GbY8wXsgm8Cdoy802E7uIHFdci\nHNRbpncNG77n9hqBiBBnIo5IMQKBgQDmepan7ntYwXgUmaaFEBMjJEnsnDEs/2+F\nfLLguQRNVjF09obXyrO4kAfPe4sZY85mP8qlwVdkuUVbadGVdIyGnadG/d4it9dj\nabt1JQKfReMQ5Evwl6BUxqV3WZprSnY5P1UojpEi/vXOdn3UzN9eEo9iRK8zXc/3\nglzbIluXWQKBgQDCNoBEwg9d5/Rd9ReK/T77sj3e34GUK4mx+OmPolOogBW1lFxe\n+9ZuaBuLNG3Pn7U0Mvf5iCf3TYoCCscsUwiq+YEl+Q/ywrs4pwuAxGU5L81Gp17+\nWMUy4cLz15Cgjc6qD7ZNOpryIq8d4fbdlVxBMmftFWNtLslH+SCZIc87gQKBgQCW\nM5H3Qw4Tm5H8Kt5AnWc7YazjjC7oGle9cLTKiwjotaFpjjf2bd2ODB9q8iKGm2qp\nbC1OtJ+VvsAagO3bLqdeG2Qmec/IZHL0ELXf9Ayva8Y8/esXklkkpoizLSvbfB1r\n1YBT/AVN/0aGFOaQRivTjNjwu75KBXtA3C5TiSKTkQKBgC2mOouDF0wx84LF3w/w\nE+ZcqfFp8YHYuGza+cVTReb6sP9dzpa9Uy2xsPnQp9majihcnTyXbdUayt1DO/Cd\ncng/Ly7H+zqBiVccmDCIxwloUkD1wwWBwu9tZ8JyNV/m+oDMRNUozC7l22eLLcM1\n8zzH43YEX82lumezHgv2k6ng\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@test-477cc.iam.gserviceaccount.com",
  client_id: "101843315777556988519",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40test-477cc.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
}


const serviceAccount = FIREBASE_SERVICE_ACCOUNT;

admin.initializeApp({
  credential: admin.credential.cert(FIREBASE_SERVICE_ACCOUNT),
});

export default admin;