import { base64url } from 'multiformats/bases/base64';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Utility class for encoding/converting data into various formats.
 */
export class Encoder {

  static base64UrlToBytes(base64urlString) {
    const content = base64url.baseDecode(base64urlString);
    return content;
  }

  static base64UrlToObject(base64urlString) {
    const payloadBytes = base64url.baseDecode(base64urlString);
    const payloadString = Encoder.bytesToString(payloadBytes);
    const payloadObject = JSON.parse(payloadString);
    return payloadObject;
  }

  static bytesToBase64Url(bytes) {
    const base64UrlString = base64url.baseEncode(bytes);
    return base64UrlString;
  }

  static bytesToString(content) {
    const bytes = textDecoder.decode(content);
    return bytes;
  }

  static objectToBytes(obj) {
    const objectString = JSON.stringify(obj);
    const objectBytes = textEncoder.encode(objectString);
    return objectBytes;
  }

  static stringToBase64Url(content) {
    const bytes = textEncoder.encode(content);
    const base64UrlString = base64url.baseEncode(bytes);
    return base64UrlString;
  }

  static stringToBytes(content) {
    const bytes = textEncoder.encode(content);
    return bytes;
  }
}
