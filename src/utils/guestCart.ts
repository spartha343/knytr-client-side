export interface GuestCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  priceSnapshot: number;
  productName: string;
  productSlug: string;
  storeId: string;
  storeName: string;
  storeSlug: string;
  variantName?: string;
  imageUrl?: string;
  comparePrice?: number;
}

interface GuestCart {
  items: GuestCartItem[];
  createdAt: string;
  updatedAt: string;
}

const CART_STORAGE_KEY = "knytr_guest_cart";

export class GuestCartManager {
  // Get entire cart
  static get(): GuestCart | null {
    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      if (!cartData) return null;
      return JSON.parse(cartData);
    } catch (error) {
      console.error("Error reading guest cart:", error);
      return null;
    }
  }

  // Initialize empty cart
  private static initCart(): GuestCart {
    const cart: GuestCart = {
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveCart(cart);
    return cart;
  }

  // Save cart to localStorage
  private static saveCart(cart: GuestCart): void {
    try {
      cart.updatedAt = new Date().toISOString();
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving guest cart:", error);
    }
  }

  // Add item to cart (or update quantity if exists)
  static add(item: GuestCartItem): void {
    let cart = this.get();
    if (!cart) {
      cart = this.initCart();
    }

    // Check if item already exists (same product and variant)
    const existingItemIndex = cart.items.findIndex(
      (i) =>
        i.productId === item.productId &&
        (i.variantId || null) === (item.variantId || null),
    );

    if (existingItemIndex !== -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].priceSnapshot = item.priceSnapshot; // Update price
    } else {
      // Add new item
      cart.items.push(item);
    }

    this.saveCart(cart);
  }

  // Update item quantity
  static updateQuantity(
    productId: string,
    variantId: string | undefined,
    quantity: number,
  ): void {
    const cart = this.get();
    if (!cart) return;

    const itemIndex = cart.items.findIndex(
      (i) =>
        i.productId === productId &&
        (i.variantId || null) === (variantId || null),
    );

    if (itemIndex !== -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      this.saveCart(cart);
    }
  }

  // Remove item from cart
  static remove(productId: string, variantId: string | undefined): void {
    const cart = this.get();
    if (!cart) return;

    cart.items = cart.items.filter(
      (i) =>
        !(
          i.productId === productId &&
          (i.variantId || null) === (variantId || null)
        ),
    );

    this.saveCart(cart);
  }

  // Clear entire cart
  static clear(): void {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing guest cart:", error);
    }
  }

  // Get total number of items
  static getItemCount(): number {
    const cart = this.get();
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  }

  // Get cart subtotal
  static getSubtotal(): number {
    const cart = this.get();
    if (!cart) return 0;
    return cart.items.reduce(
      (total, item) => total + item.priceSnapshot * item.quantity,
      0,
    );
  }

  // Get specific item
  static getItem(
    productId: string,
    variantId: string | undefined,
  ): GuestCartItem | null {
    const cart = this.get();
    if (!cart) return null;

    return (
      cart.items.find(
        (i) =>
          i.productId === productId &&
          (i.variantId || null) === (variantId || null),
      ) || null
    );
  }

  // Check if item exists in cart
  static hasItem(productId: string, variantId: string | undefined): boolean {
    return this.getItem(productId, variantId) !== null;
  }

  // Get all items
  static getItems(): GuestCartItem[] {
    const cart = this.get();
    return cart?.items || [];
  }
}
