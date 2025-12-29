import { Server } from "@modelcontextprotocol/sdk/server/index.js";
/**
 * 設置全局 server 實例
 * Set global server instance
 */
export declare function setGlobalServer(server: Server): void;
/**
 * 獲取全局 server 實例
 * Get global server instance
 */
export declare function getGlobalServer(): Server | null;
/**
 * 取得 DATA_DIR 路徑
 * Get DATA_DIR path
 * 如果有 server 且支援 listRoots，則使用第一筆 file:// 開頭的 root + "/data"
 * If there's a server that supports listRoots, use the first root starting with file:// + "/data"
 * 否則使用環境變數或專案根目錄
 * Otherwise use environment variables or project root directory
 */
export declare function getDataDir(): Promise<string>;
/**
 * 取得任務檔案路徑
 * Get task file path
 */
export declare function getTasksFilePath(): Promise<string>;
/**
 * 取得記憶體資料夾路徑
 * Get memory directory path
 */
export declare function getMemoryDir(): Promise<string>;
/**
 * 取得 WebGUI 檔案路徑
 * Get WebGUI file path
 */
export declare function getWebGuiFilePath(): Promise<string>;
/**
 * 取得專案根目錄
 * Get project root directory
 */
export declare function getProjectRoot(): string;
