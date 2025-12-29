/**
 * ChurnFlow Database Manager - Core ADHD-Friendly Operations
 * Simplified database operations using Drizzle ORM
 */
import { type Capture, type NewCapture, type Context, type NewContext, type NewLearningPattern } from './schema.js';
export interface DatabaseConfig {
    dbPath?: string;
    enableWAL?: boolean;
    enableForeignKeys?: boolean;
}
export declare class DatabaseManager {
    private dbConfig;
    private db;
    private sqlite;
    private isInitialized;
    constructor(dbConfig?: DatabaseConfig);
    initialize(): Promise<void>;
    private verifyDatabaseSetup;
    createCapture(capture: NewCapture): Promise<Capture>;
    getCaptureById(id: string): Promise<Capture | null>;
    updateCapture(id: string, updates: Partial<NewCapture>): Promise<Capture | null>;
    deleteCapture(id: string): Promise<boolean>;
    getCapturesNeedingReview(limit?: number): Promise<Capture[]>;
    markCaptureReviewed(id: string, reviewNotes?: string): Promise<boolean>;
    getNextActions(limit?: number): Promise<Capture[]>;
    getQuickWins(limit?: number): Promise<Capture[]>;
    getHighImpactTasks(limit?: number): Promise<Capture[]>;
    createContext(context: NewContext): Promise<Context>;
    getContexts(): Promise<Context[]>;
    getContextByName(name: string): Promise<Context | null>;
    searchCaptures(query: string, limit?: number): Promise<Capture[]>;
    recordLearningPattern(pattern: NewLearningPattern): Promise<void>;
    updateLearningFeedback(patternId: string, wasCorrect: boolean, userCorrectedContextId?: string, userCorrectedType?: 'action' | 'reference' | 'someday' | 'activity'): Promise<void>;
    getDashboardStats(): Promise<{
        inbox: number;
        active: number;
        completed: number;
        needingReview: number;
        overdue: number;
    }>;
    setupDatabase(): Promise<void>;
    resetDatabase(): Promise<void>;
    private seedInitialData;
    private createFullTextSearch;
    private runMigrations;
    /**
     * @deprecated Manual table creation is deprecated. Use Drizzle ORM migrations instead.
     */
    private createTablesManually;
    close(): Promise<void>;
}
//# sourceMappingURL=DatabaseManager.d.ts.map