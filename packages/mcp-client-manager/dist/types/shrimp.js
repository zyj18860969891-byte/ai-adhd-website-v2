"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentType = exports.TaskPriority = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["TODO"] = "todo";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
var AgentType;
(function (AgentType) {
    AgentType["RESEARCHER"] = "researcher";
    AgentType["ANALYZER"] = "analyzer";
    AgentType["EXECUTOR"] = "executor";
    AgentType["COORDINATOR"] = "coordinator";
})(AgentType || (exports.AgentType = AgentType = {}));
//# sourceMappingURL=shrimp.js.map