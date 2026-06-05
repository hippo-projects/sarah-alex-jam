const GRAPHQL_URL = 'http://localhost:4000/graphql';

const query = `
  query {
    hello
  }
`;

async function fetchHello(): Promise<string> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data?.hello ?? 'No response';
}

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<h1>Sarah Alex Jam</h1><p id="message">Loading...</p>`;

fetchHello()
  .then((msg) => {
    document.querySelector<HTMLParagraphElement>('#message')!.textContent = msg;
  })
  .catch((err) => {
    document.querySelector<HTMLParagraphElement>('#message')!.textContent =
      `Error: ${err.message}`;
  });
