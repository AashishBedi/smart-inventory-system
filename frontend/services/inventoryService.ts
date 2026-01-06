
import { Product, Reservation, ReservationStatus, InventoryStats } from '../types';

// Constants
const RESERVATION_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory "Database" State
class InventoryStore {
  private products: Map<string, Product> = new Map();
  private reservations: Map<string, Reservation> = new Map();
  private orders: any[] = []; // Store confirmed checkouts

  constructor() {
    this.initialize();
  }

  private initialize() {
    const initialProducts: Product[] = [
      {
        sku: 'IPHONE-15-PRO',
        name: 'iPhone 15 Pro Max',
        price: 1199,
        stock: 5,
        description: 'Titanium design, A17 Pro chip, customizable Action button.',
        imageUrl: 'https://picsum.photos/id/1/400/300'
      },
      {
        sku: 'MBP-M3-MAX',
        name: 'MacBook Pro M3 Max',
        price: 3499,
        stock: 3,
        description: 'The most advanced chips ever built for a personal computer.',
        imageUrl: 'https://picsum.photos/id/2/400/300'
      },
      {
        sku: 'AIRPODS-MAX-2',
        name: 'AirPods Max 2',
        price: 549,
        stock: 10,
        description: 'The ultimate listening experience. Now with USB-C.',
        imageUrl: 'https://picsum.photos/id/3/400/300'
      }
    ];
    initialProducts.forEach(p => this.products.set(p.sku, p));
  }

  // Helper to get effective availability (Stock - Active Reservations)
  public getAvailability(sku: string): number {
    const product = this.products.get(sku);
    if (!product) return 0;

    const now = Date.now();
    const activeReservedQuantity = Array.from(this.reservations.values())
      .filter(r => r.sku === sku && r.status === ReservationStatus.PENDING && r.expiresAt > now)
      .reduce((sum, r) => sum + r.quantity, 0);

    return Math.max(0, product.stock - activeReservedQuantity);
  }

  public getProduct(sku: string): Product | undefined {
    return this.products.get(sku);
  }

  public getProducts(): Product[] {
    return Array.from(this.products.values());
  }

  // POST /inventory/reserve
  public async reserve(sku: string, userId: string, quantity: number = 1): Promise<Reservation> {
    // Simulate network latency
    await new Promise(r => setTimeout(r, 400));

    // CRITICAL SECTION: Atomic check and reserve
    const available = this.getAvailability(sku);
    if (available < quantity) {
      throw new Error(`Insufficient inventory for ${sku}. Only ${available} units available.`);
    }

    const reservation: Reservation = {
      id: `res_${Math.random().toString(36).substr(2, 9)}`,
      sku,
      userId,
      quantity,
      createdAt: Date.now(),
      expiresAt: Date.now() + RESERVATION_TTL_MS,
      status: ReservationStatus.PENDING
    };

    this.reservations.set(reservation.id, reservation);
    return reservation;
  }

  // POST /checkout/confirm
  public async confirm(reservationId: string): Promise<void> {
    await new Promise(r => setTimeout(r, 400));
    
    const res = this.reservations.get(reservationId);
    if (!res) throw new Error("Reservation not found.");
    
    if (res.status !== ReservationStatus.PENDING) {
      throw new Error(`Reservation is already ${res.status}.`);
    }

    if (res.expiresAt < Date.now()) {
      res.status = ReservationStatus.EXPIRED;
      throw new Error("Reservation has expired.");
    }

    // Finalize: Deduct from actual stock
    const product = this.products.get(res.sku);
    if (product) {
      if (product.stock < res.quantity) {
        throw new Error("Concurrency Error: Physical stock depleted before confirmation.");
      }
      product.stock -= res.quantity;
      res.status = ReservationStatus.CONFIRMED;
      this.orders.push({ ...res, confirmedAt: Date.now() });
    }
  }

  // POST /checkout/cancel
  public async cancel(reservationId: string): Promise<void> {
    const res = this.reservations.get(reservationId);
    if (res && res.status === ReservationStatus.PENDING) {
      res.status = ReservationStatus.CANCELLED;
    }
  }

  public getStats(): InventoryStats[] {
    return this.getProducts().map(p => {
      const activeReserved = Array.from(this.reservations.values())
        .filter(r => r.sku === p.sku && r.status === ReservationStatus.PENDING && r.expiresAt > Date.now())
        .reduce((sum, r) => sum + r.quantity, 0);
      
      const sold = Array.from(this.reservations.values())
        .filter(r => r.sku === p.sku && r.status === ReservationStatus.CONFIRMED)
        .reduce((sum, r) => sum + r.quantity, 0);

      return {
        sku: p.sku,
        available: this.getAvailability(p.sku),
        reserved: activeReserved,
        sold
      };
    });
  }
}

export const inventoryStore = new InventoryStore();
