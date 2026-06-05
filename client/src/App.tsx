import { useEffect, useState } from 'react';

const GRAPHQL_URL = 'http://localhost:4000/graphql';

const query = `
  query {
    hello
  }
`;

export default function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((json) => setMessage(json.data?.hello ?? 'No response'))
      .catch((err) => setMessage(`Error: ${err.message}`));
  }, []);

  return (
    <div>
      <h1>Sarah Alex Jam</h1>
      <p>{message}</p>
    </div>
  );
}
