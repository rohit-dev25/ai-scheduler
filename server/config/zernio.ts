import { Zernio } from '@zernio/node';

const apiKey = process.env.ZERNIO_API;

if (!apiKey) {
  throw new Error("ZERNIO_API is not defined in environment variables");
}

const zernio = new Zernio({
  apiKey,
  baseURL: "https://zernio.com/api",
});

export default zernio;