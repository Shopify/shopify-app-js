// Dummy script just so we can create a Miniflare instance for the KV namespace
const dummyWorker = {
  async fetch(_request, _env, _ctx) {
    return new Response('Hello World!');
  },
};

export default dummyWorker;
