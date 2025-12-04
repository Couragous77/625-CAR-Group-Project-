import { useEffect, useState } from "react";
import { fetchLowFunds } from "../../services/notificationService";

export default function LowFundsAlert({ envelopes }) {
  const [lowFunds, setLowFunds] = useState([]);

  useEffect(() => {
    async function run() {
      if (!envelopes || envelopes.length === 0) return;
      const data = await fetchLowFunds(envelopes);
      setLowFunds(data.envelopes || []);
    }
    run();
  }, [envelopes]);

  if (lowFunds.length === 0) return null;

  return (
    <div className="alert alert-warning">
      <strong>Low Funds:</strong>
      <ul>
        {lowFunds.map((env) => (
          <li key={env.id ?? env.name}>
            {env.name}: {env.reason}
          </li>
        ))}
      </ul>
    </div>
  );
}
