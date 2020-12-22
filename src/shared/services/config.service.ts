import * as dotenv from 'dotenv';

export class ConfigService {
    constructor() {
        const nodeEnv = this.nodeEnv;

        // eslint-disable-next-line no-restricted-syntax
        console.log(nodeEnv);

        dotenv.config({
            path: `.${nodeEnv}.env`,
        });

        // Replace \\n with \n to support multiline strings in AWS
        for (const envName of Object.keys(process.env)) {
            process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
        }
    }

    get isLocal(): boolean {
        return this.nodeEnv === 'local';
    }

    get isDevelopment(): boolean {
        return this.nodeEnv === 'development';
    }

    get isStaging(): boolean {
        return this.nodeEnv === 'staging';
    }

    get isProduction(): boolean {
        return this.nodeEnv === 'production';
    }

    public get(key: string): string {
        return process.env[key];
    }

    public getNumber(key: string): number {
        return Number(this.get(key));
    }

    get nodeEnv(): string {
        return this.get('NODE_ENV') || 'local';
    }

    get fallbackLanguage(): string {
        return this.get('FALLBACK_LANGUAGE').toLowerCase();
    }
}
