import { 
    RevenueCatInterface, 
    CustomerInfo, 
    Product, 
    Offerings, 
    PurchaseResult,
    RevenueCatConfig,
    LogLevel,
    PaywallResult,
    PaywallOptions
} from './types';

class RevenueCatNative implements RevenueCatInterface {
    configure(_config: RevenueCatConfig): void {
        console.log('RevenueCat: native purchases not available (Google Play removed)');
    }

    async getCustomerInfo(): Promise<CustomerInfo> {
        return {
            activeSubscriptions: {},
            entitlements: { all: {} },
            originalAppUserId: '',
            requestDate: new Date(),
        };
    }

    async getOfferings(): Promise<Offerings> {
        return { current: null, all: {} };
    }

    async getProducts(_productIds: string[]): Promise<Product[]> {
        return [];
    }

    async purchaseStoreProduct(_product: Product): Promise<PurchaseResult> {
        return {
            customerInfo: await this.getCustomerInfo(),
        };
    }

    async syncPurchases(): Promise<void> {
        // No-op without Google Play
    }

    setLogLevel(_level: LogLevel): void {
        // No-op
    }

    async presentPaywall(_options?: PaywallOptions): Promise<PaywallResult> {
        return PaywallResult.NOT_PRESENTED;
    }

    async presentPaywallIfNeeded(_options?: PaywallOptions & { requiredEntitlementIdentifier: string }): Promise<PaywallResult> {
        return PaywallResult.NOT_PRESENTED;
    }
}

export default new RevenueCatNative();
