// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
        interface Platform {
            env: {
                DB: D1Database,
                SEB: {
					send: (message: any) => Promise<void>;
				};
            }
            context: {
                waitUntil(promise: Promise<any>): void;
            }
            cf: CfProperties
            ctx: ExecutionContext
        }
    }
}

export {};