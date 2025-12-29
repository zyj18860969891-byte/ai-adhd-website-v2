import { RelatedFile } from '../types/index.js';
/**
 * 生成任務相關文件的內容摘要
 * Generate a content summary of task-related files
 *
 * 此函數根據提供的 RelatedFile 物件列表，生成文件的摘要信息，而不實際讀取檔案內容。
 * This function generates file summary information based on the provided RelatedFile object list without actually reading file contents.
 * 這是一個輕量級的實現，僅基於檔案元數據（如路徑、類型、描述等）生成格式化的摘要，
 * This is a lightweight implementation that generates formatted summaries based only on file metadata (such as paths, types, descriptions, etc.),
 * 適用於需要提供文件上下文信息但不需要訪問實際檔案內容的情境。
 * suitable for scenarios that need to provide file context information but don't need to access actual file contents.
 *
 * @param relatedFiles 相關文件列表 - RelatedFile 物件數組，包含文件的路徑、類型、描述等資訊
 * @param relatedFiles Related file list - Array of RelatedFile objects containing file paths, types, descriptions, and other information
 * @param maxTotalLength 摘要內容的最大總長度 - 控制生成摘要的總字符數，避免過大的返回內容
 * @param maxTotalLength Maximum total length of summary content - Controls the total character count of generated summaries to avoid overly large return content
 * @returns 包含兩個字段的物件：
 * @returns Object containing two fields:
 *   - content: 詳細的文件資訊，包含每個檔案的基本資訊和提示訊息
 *   - content: Detailed file information, including basic information and hint messages for each file
 *   - summary: 簡潔的檔案列表概覽，適合快速瀏覽
 *   - summary: Concise file list overview, suitable for quick browsing
 */
export declare function loadTaskRelatedFiles(relatedFiles: RelatedFile[], maxTotalLength?: number): Promise<{
    content: string;
    summary: string;
}>;
