// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import { PaymentCheckoutToken } from "$lib/utils/types";
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			checkoutData:PaymentCheckoutToken
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
