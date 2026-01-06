const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function reserveInventory(
  sku: string,
  userId: string,
  quantity: number,
  idempotencyKey: string
) {
  const res = await fetch(`${BASE_URL}/inventory/reserve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "idempotency-key": idempotencyKey,
    },
    body: JSON.stringify({ sku, user_id: userId, quantity }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Reservation failed");
  }

  return res.json();
}

export async function confirmCheckout(reservationId: string) {
  const res = await fetch(`${BASE_URL}/checkout/confirm?reservation_id=${reservationId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Confirm failed");
  return res.json();
}

export async function cancelCheckout(reservationId: string) {
  const res = await fetch(`${BASE_URL}/checkout/cancel?reservation_id=${reservationId}`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("Cancel failed");
  return res.json();
}

export async function getInventory(sku: string) {
  const res = await fetch(`${BASE_URL}/inventory/${sku}`);
  if (!res.ok) throw new Error("Inventory fetch failed");
  return res.json();
}
